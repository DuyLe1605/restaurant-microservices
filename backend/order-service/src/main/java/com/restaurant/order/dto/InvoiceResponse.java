package com.restaurant.order.dto;

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
public class InvoiceResponse {
    private Long orderId;
    private String restaurantName;
    private String restaurantAddress;
    private String tableNumber;
    private String customerName;
    private String cashierName;
    private LocalDateTime invoiceDate;
    private List<OrderDetailResponse> items;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal vatAmount;
    private BigDecimal totalAmount;
    private String paymentStatus;
}
