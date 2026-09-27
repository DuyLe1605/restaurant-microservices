package com.restaurant.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicOrderStartResponse {
    private Long tableId;
    private String tableNumber;
    private Integer capacity;
    private String tableStatus;
    private OrderResponse activeOrder;
}
