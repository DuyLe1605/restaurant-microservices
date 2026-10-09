package com.restaurant.user.controller;

import com.restaurant.user.constant.UserConstants;
import com.restaurant.user.dto.*;
import com.restaurant.user.enums.Role;
import com.restaurant.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<UserResponse> response = userService.getUsers(search, role, active, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response, "Fetched users successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @RequestHeader(value = UserConstants.HEADER_USER_ID) String currentUserId) {
        UserResponse response = userService.getUserById(Long.parseLong(currentUserId));
        return ResponseEntity.ok(ApiResponse.ok(response, "Current user found"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @PathVariable Long id,
            @RequestHeader(value = UserConstants.HEADER_USER_ID, required = false) String currentUserIdHeader,
            @RequestHeader(value = UserConstants.HEADER_USER_ROLE, required = false) String currentUserRole) {
        // IDOR protection: non-admin users cannot access other users' data
        if (currentUserRole != null && !"ADMIN".equalsIgnoreCase(currentUserRole)) {
            if (currentUserIdHeader == null || !id.toString().equals(currentUserIdHeader)) {
                throw new com.restaurant.user.exception.ForbiddenException("Bạn không có quyền truy cập thông tin của tài khoản khác.");
            }
        }
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "User found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody UserCreateRequest request,
            @RequestHeader(value = UserConstants.HEADER_USER_ROLE, required = false) String currentUserRole) {
        if (currentUserRole != null && !"ADMIN".equalsIgnoreCase(currentUserRole)) {
            throw new com.restaurant.user.exception.ForbiddenException("Chỉ Quản trị viên (ADMIN) mới có quyền tạo người dùng.");
        }
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, UserConstants.MSG_USER_CREATED));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request,
            @RequestHeader(value = UserConstants.HEADER_USER_ROLE, required = false) String currentUserRole) {
        if (currentUserRole != null && !"ADMIN".equalsIgnoreCase(currentUserRole)) {
            throw new com.restaurant.user.exception.ForbiddenException("Chỉ Quản trị viên (ADMIN) mới có quyền cập nhật người dùng.");
        }
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, UserConstants.MSG_USER_UPDATED));
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable Long id,
            @RequestHeader(value = UserConstants.HEADER_USER_ROLE, required = false) String currentUserRole,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(id, request, currentUserRole);
        return ResponseEntity.ok(ApiResponse.ok(UserConstants.MSG_PASSWORD_CHANGED));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            @RequestHeader(value = UserConstants.HEADER_USER_ID, required = false) String currentUserIdHeader,
            @RequestHeader(value = UserConstants.HEADER_USER_ROLE, required = false) String currentUserRole) {
        if (currentUserRole != null && !"ADMIN".equalsIgnoreCase(currentUserRole)) {
            throw new com.restaurant.user.exception.ForbiddenException("Chỉ Quản trị viên (ADMIN) mới có quyền xóa tài khoản.");
        }
        Long currentUserId = currentUserIdHeader != null ? Long.parseLong(currentUserIdHeader) : -1L;
        userService.deleteUser(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(UserConstants.MSG_USER_DELETED));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countActiveUsers() {
        long count = userService.countActiveUsers();
        return ResponseEntity.ok(ApiResponse.ok(count, "Active users counted"));
    }
}
