package com.restaurant.order.dto;

import com.restaurant.order.enums.OrderSource;
import com.restaurant.order.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long tableId;
    private String tableNumber;
    private Long waiterId;
    private Long cashierId;
    private LocalDateTime orderTime;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal vatRate;
    private BigDecimal totalAmount;
    private OrderSource source;
    private String customerName;
    private String customerPhone;
    private String note;
    private List<OrderDetailResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
