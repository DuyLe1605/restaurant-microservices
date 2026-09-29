package com.restaurant.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPaidEventDto implements Serializable {
    private Long orderId;
    private LocalDate orderDate;
    private BigDecimal totalAmount;
    private String status;
    private String tableNumber;
    private String cashierName;
    private String source;
}
