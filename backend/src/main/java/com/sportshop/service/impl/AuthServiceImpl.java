package com.sportshop.service.impl;

import com.sportshop.dto.auth.*;
import com.sportshop.entity.RefreshToken;
import com.sportshop.entity.Role;
import com.sportshop.entity.User;
import com.sportshop.enums.RoleName;
import com.sportshop.enums.UserStatus;
import com.sportshop.exception.BadRequestException;
import com.sportshop.exception.ResourceNotFoundException;
import com.sportshop.mapper.UserMapper;
import com.sportshop.repository.RefreshTokenRepository;
import com.sportshop.repository.RoleRepository;
import com.sportshop.repository.UserRepository;
import com.sportshop.security.jwt.JwtService;
import com.sportshop.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    private final Map<String, String> resetCodeStore = new ConcurrentHashMap<>();

    public AuthServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           AuthenticationManager authenticationManager,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           UserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setStatus(UserStatus.ACTIVE);

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vai trò ROLE_USER"));
        user.getRoles().add(userRole);

        user = userRepository.save(user);
        String accessToken = jwtService.generateAccessToken(toUserDetails(user));
        String refreshToken = createRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmailAndDeletedFalse(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (!user.isEnabled()) {
            throw new BadRequestException("Tài khoản đã bị khóa");
        }

        String accessToken = jwtService.generateAccessToken(toUserDetails(user));
        String refreshToken = createRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshTokenEntity = refreshTokenRepository.findByTokenAndRevokedFalse(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Refresh token không hợp lệ"));

        if (refreshTokenEntity.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Refresh token đã hết hạn");
        }

        User user = refreshTokenEntity.getUser();
        if (!jwtService.isRefreshTokenValid(request.getRefreshToken(), user.getEmail())) {
            throw new BadRequestException("Xác minh refresh token thất bại");
        }

        String newAccessToken = jwtService.generateAccessToken(toUserDetails(user));
        return buildAuthResponse(user, newAccessToken, request.getRefreshToken());
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        refreshTokenRepository.deleteByUser(user);
    }

    @Override
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy email"));

        String code = String.valueOf(100000 + new Random().nextInt(900000));
        resetCodeStore.put(user.getEmail(), code);
        log.info("Mock reset code for {} is {}", user.getEmail(), code);
        return code;
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy email"));

        String validCode = resetCodeStore.get(user.getEmail());
        if (validCode == null || !validCode.equals(request.getResetCode())) {
            throw new BadRequestException("Mã đặt lại không hợp lệ");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        resetCodeStore.remove(user.getEmail());
        refreshTokenRepository.deleteByUser(user);
    }

    private String createRefreshToken(User user) {
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());
        RefreshToken tokenEntity = new RefreshToken();
        tokenEntity.setUser(user);
        tokenEntity.setToken(refreshToken);
        tokenEntity.setExpiryDate(LocalDateTime.now().plusDays(7));
        tokenEntity.setRevoked(false);
        refreshTokenRepository.save(tokenEntity);
        return refreshToken;
    }

    private org.springframework.security.core.userdetails.User toUserDetails(User user) {
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.getRoles().stream().map(r -> new org.springframework.security.core.authority.SimpleGrantedAuthority(r.getName().name())).toList()
        );
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresInSeconds(3600L)
                .user(userMapper.toSummary(user))
                .build();
    }
}
