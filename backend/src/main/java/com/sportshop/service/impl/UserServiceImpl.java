package com.sportshop.service.impl;

import com.sportshop.dto.user.*;
import com.sportshop.entity.Address;
import com.sportshop.entity.Role;
import com.sportshop.entity.User;
import com.sportshop.enums.RoleName;
import com.sportshop.enums.UserStatus;
import com.sportshop.exception.BadRequestException;
import com.sportshop.exception.ResourceNotFoundException;
import com.sportshop.mapper.AddressMapper;
import com.sportshop.mapper.UserMapper;
import com.sportshop.repository.AddressRepository;
import com.sportshop.repository.RoleRepository;
import com.sportshop.repository.UserRepository;
import com.sportshop.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AddressRepository addressRepository;
    private final UserMapper userMapper;
    private final AddressMapper addressMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           AddressRepository addressRepository,
                           UserMapper userMapper,
                           AddressMapper addressMapper,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.addressRepository = addressRepository;
        this.userMapper = userMapper;
        this.addressMapper = addressMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserResponse getProfile(String email) {
        return userMapper.toResponse(getUserByEmail(email));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UserUpdateRequest request) {
        User user = getUserByEmail(email);

        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public List<AddressResponse> getMyAddresses(String email) {
        User user = getUserByEmail(email);
        return addressRepository.findByUser(user).stream().map(addressMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public AddressResponse addAddress(String email, AddressRequest request) {
        User user = getUserByEmail(email);
        if (request.isDefaultAddress()) {
            unsetDefaultAddress(user);
        }

        Address address = new Address();
        mapAddress(address, request);
        address.setUser(user);

        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(String email, UUID addressId, AddressRequest request) {
        User user = getUserByEmail(email);
        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (request.isDefaultAddress()) {
            unsetDefaultAddress(user);
        }

        mapAddress(address, request);
        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void deleteAddress(String email, UUID addressId) {
        User user = getUserByEmail(email);
        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        addressRepository.delete(address);
    }

    @Override
    public Page<UserResponse> getUsers(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users;

        if (keyword == null || keyword.isBlank()) {
            users = userRepository.findByDeletedFalse(pageable);
        } else {
            users = userRepository.findByDeletedFalseAndFullNameContainingIgnoreCase(keyword, pageable);
        }

        return users.map(userMapper::toResponse);
    }

    @Override
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request, boolean adminRole) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Role role = roleRepository.findByName(adminRole ? RoleName.ROLE_ADMIN : RoleName.ROLE_USER)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        user.getRoles().add(role);

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateUser(UUID id, UserUpdateRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void lockUser(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEnabled(false);
        user.setStatus(UserStatus.LOCKED);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setDeleted(true);
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void resetUserPassword(UUID id, String newPassword) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void unsetDefaultAddress(User user) {
        List<Address> addresses = addressRepository.findByUser(user);
        addresses.forEach(a -> a.setDefaultAddress(false));
        addressRepository.saveAll(addresses);
    }

    private void mapAddress(Address address, AddressRequest request) {
        address.setReceiverName(request.getReceiverName());
        address.setReceiverPhone(request.getReceiverPhone());
        address.setLine1(request.getLine1());
        address.setLine2(request.getLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry() == null || request.getCountry().isBlank() ? "Vietnam" : request.getCountry());
        address.setDefaultAddress(request.isDefaultAddress());
    }
}
