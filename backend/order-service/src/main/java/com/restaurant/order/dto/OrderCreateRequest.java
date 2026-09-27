package com.restaurant.order.dto;

import com.restaurant.order.enums.OrderSource;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequest {

    private Long tableId;
    private Long waiterId;

    @DecimalMin(value = "0.0", message = "Discount must be non-negative")
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "VAT rate must be non-negative")
    @DecimalMax(value = "100.0", message = "VAT rate cannot exceed 100%")
    @Builder.Default
    private BigDecimal vatRate = BigDecimal.ZERO;

    @Builder.Default
    private OrderSource source = OrderSource.INTERNAL;

    private String customerName;
    private String customerPhone;
    private String note;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequest> items;
}
