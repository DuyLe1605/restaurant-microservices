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

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "User found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, UserConstants.MSG_USER_CREATED));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, UserConstants.MSG_USER_UPDATED));
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(id, request);
        return ResponseEntity.ok(ApiResponse.ok(UserConstants.MSG_PASSWORD_CHANGED));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            @RequestHeader(value = UserConstants.HEADER_USER_ID, required = false) String currentUserIdHeader) {
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
