package com.restaurant.user.dto;

import com.restaurant.user.constant.UserConstants;
import com.restaurant.user.enums.Role;
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
public class UserCreateRequest {

    @NotBlank(message = "Username is required")
    @Size(min = UserConstants.MIN_USERNAME_LENGTH, max = UserConstants.MAX_USERNAME_LENGTH,
            message = "Username must be between {min} and {max} characters")
    @Pattern(regexp = UserConstants.USERNAME_REGEX, message = UserConstants.USERNAME_REGEX_MSG)
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = UserConstants.MIN_PASSWORD_LENGTH, max = UserConstants.MAX_PASSWORD_LENGTH,
            message = "Password must be between {min} and {max} characters")
    private String password;

    @NotBlank(message = "Fullname is required")
    @Size(max = UserConstants.MAX_FULLNAME_LENGTH, message = "Fullname cannot exceed {max} characters")
    private String fullname;

    @NotNull(message = "Role is required")
    private Role role;

    @Builder.Default
    private Boolean active = true;
}
