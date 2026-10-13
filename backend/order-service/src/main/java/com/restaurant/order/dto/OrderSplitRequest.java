package com.restaurant.order.dto;

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
public class OrderSplitRequest {

    private String customerName;
    private String customerPhone;

    @DecimalMin(value = "0.0", message = "Discount must be non-negative")
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "VAT rate must be non-negative")
    @DecimalMax(value = "100.0", message = "VAT rate cannot exceed 100%")
    @Builder.Default
    private BigDecimal vatRate = BigDecimal.ZERO;

    private String note;
    private Long tableId;

    @NotEmpty(message = "Split order must contain at least one item")
    @Valid
    private List<OrderItemRequest> items;
}
