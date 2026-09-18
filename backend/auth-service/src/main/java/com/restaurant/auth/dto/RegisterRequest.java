package com.restaurant.auth.dto;

import com.restaurant.auth.constant.AuthConstants;
import com.restaurant.auth.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Fullname is required")
    @Size(max = AuthConstants.MAX_FULLNAME_LENGTH, message = "Fullname cannot exceed {max} characters")
    private String fullname;

    @NotBlank(message = "Username is required")
    @Size(min = AuthConstants.MIN_USERNAME_LENGTH, max = AuthConstants.MAX_USERNAME_LENGTH,
            message = "Username must be between {min} and {max} characters")
    @Pattern(regexp = AuthConstants.USERNAME_REGEX, message = AuthConstants.USERNAME_REGEX_MSG)
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = AuthConstants.MIN_PASSWORD_LENGTH, max = AuthConstants.MAX_PASSWORD_LENGTH,
            message = "Password must be between {min} and {max} characters")
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    @NotNull(message = "Role is required")
    private Role role;
}
