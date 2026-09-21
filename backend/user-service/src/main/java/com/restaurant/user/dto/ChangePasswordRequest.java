package com.restaurant.user.dto;

import com.restaurant.user.constant.UserConstants;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = UserConstants.MIN_PASSWORD_LENGTH, max = UserConstants.MAX_PASSWORD_LENGTH,
            message = "Password must be between {min} and {max} characters")
    private String newPassword;
}
