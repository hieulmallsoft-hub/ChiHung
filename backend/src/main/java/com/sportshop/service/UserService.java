package com.sportshop.service;

import com.sportshop.dto.user.*;
import com.sportshop.dto.auth.RegisterRequest;
import com.sportshop.dto.user.UserCreateRequest;
import com.sportshop.dto.user.UserResponse;
import com.sportshop.dto.user.UserUpdateRequest;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserResponse getProfile(String email);

    UserResponse updateProfile(String email, UserUpdateRequest request);

    List<AddressResponse> getMyAddresses(String email);

    AddressResponse addAddress(String email, AddressRequest request);

    AddressResponse updateAddress(String email, UUID addressId, AddressRequest request);

    void deleteAddress(String email, UUID addressId);

    Page<UserResponse> getUsers(String keyword, int page, int size);

    UserResponse getUserById(UUID id);

    UserResponse createUser(UserCreateRequest request, boolean adminRole);

    UserResponse updateUser(UUID id, UserUpdateRequest request);

    void lockUser(UUID id);

    void deleteUser(UUID id);

    void resetUserPassword(UUID id, String newPassword);
}
