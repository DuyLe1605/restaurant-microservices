package com.restaurant.auth.messaging;

import com.restaurant.auth.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEventDto implements Serializable {
    private Long id;
    private String username;
    private String fullname;
    private Role role;
    private Boolean active;
    private String eventType;
}
