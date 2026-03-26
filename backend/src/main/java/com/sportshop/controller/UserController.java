package com.sportshop.controller;

import com.sportshop.dto.auth.ChangePasswordRequest;
import com.sportshop.dto.common.ApiResponse;
import com.sportshop.dto.user.AddressRequest;
import com.sportshop.dto.user.AddressResponse;
import com.sportshop.dto.user.UserResponse;
import com.sportshop.dto.user.UserUpdateRequest;
import com.sportshop.service.AuthService;
import com.sportshop.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Profile", userService.getProfile(authentication.getName())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateMe(Authentication authentication,
                                                              @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userService.updateProfile(authentication.getName(), request)));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(Authentication authentication,
                                                            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed", null));
    }

    @GetMapping("/me/addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> myAddresses(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Address list", userService.getMyAddresses(authentication.getName())));
    }

    @PostMapping("/me/addresses")
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(Authentication authentication,
                                                                   @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Address created", userService.addAddress(authentication.getName(), request)));
    }

    @PutMapping("/me/addresses/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(Authentication authentication,
                                                                      @PathVariable UUID id,
                                                                      @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Address updated", userService.updateAddress(authentication.getName(), id, request)));
    }

    @DeleteMapping("/me/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(Authentication authentication,
                                                           @PathVariable UUID id) {
        userService.deleteAddress(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted", null));
    }
}
