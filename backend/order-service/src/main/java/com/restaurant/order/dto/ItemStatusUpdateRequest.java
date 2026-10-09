package com.restaurant.order.dto;

import com.restaurant.order.enums.OrderDetailStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemStatusUpdateRequest {

    @NotNull(message = "Item status is required")
    private OrderDetailStatus status;
}
