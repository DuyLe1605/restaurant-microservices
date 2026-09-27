package com.restaurant.order.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateRequest {

    private Long tableId;
    private Long waiterId;

    @DecimalMin(value = "0.0", message = "Discount must be non-negative")
    private BigDecimal discount;

    @DecimalMin(value = "0.0", message = "VAT rate must be non-negative")
    @DecimalMax(value = "100.0", message = "VAT rate cannot exceed 100%")
    private BigDecimal vatRate;

    private String customerName;
    private String customerPhone;
    private String note;
}
