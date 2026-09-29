package com.restaurant.order.dto;

import com.restaurant.order.enums.OrderDetailStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponse {
    private Long id;
    private Long saleOrderId;
    private Long menuId;
    private String menuName;
    private Integer qty;
    private BigDecimal price;
    private BigDecimal subtotal;
    private OrderDetailStatus status;
    private String note;
}
