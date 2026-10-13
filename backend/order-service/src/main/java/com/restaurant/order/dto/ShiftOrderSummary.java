package com.restaurant.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftOrderSummary {
    private Long orderId;
    private String tableNumber;
    private String customerName;
    private BigDecimal totalAmount;
    private LocalDateTime paidAt;
    private String source;
}
