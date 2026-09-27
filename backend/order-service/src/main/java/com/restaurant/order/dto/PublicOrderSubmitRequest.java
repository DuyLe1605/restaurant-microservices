package com.restaurant.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicOrderSubmitRequest {

    @NotBlank(message = "Order token is required")
    private String token;

    private String customerName;
    private String customerPhone;
    private String note;

    @NotEmpty(message = "Order must have items")
    @Valid
    private List<OrderItemRequest> items;
}
