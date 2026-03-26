package com.sportshop.controller.admin;

import com.sportshop.dto.common.ApiResponse;
import com.sportshop.dto.user.AdminResetPasswordRequest;
import com.sportshop.dto.user.UserCreateRequest;
import com.sportshop.dto.user.UserResponse;
import com.sportshop.dto.user.UserUpdateRequest;
import com.sportshop.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success("User list", userService.getUsers(keyword, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("User detail", userService.getUserById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserCreateRequest request,
                                                                @RequestParam(defaultValue = "false") boolean admin) {
        return ResponseEntity.ok(ApiResponse.success("User created", userService.createUser(request, admin)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable UUID id,
                                                                @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User updated", userService.updateUser(id, request)));
    }

    @PostMapping("/{id}/lock")
    public ResponseEntity<ApiResponse<Void>> lockUser(@PathVariable UUID id) {
        userService.lockUser(id);
        return ResponseEntity.ok(ApiResponse.success("User locked", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable UUID id,
                                                           @Valid @RequestBody AdminResetPasswordRequest request) {
        userService.resetUserPassword(id, request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset", null));
    }
}
