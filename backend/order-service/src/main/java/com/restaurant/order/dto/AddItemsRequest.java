package com.restaurant.order.dto;

import jakarta.validation.Valid;
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
public class AddItemsRequest {
    @NotEmpty(message = "Items to add cannot be empty")
    @Valid
    private List<OrderItemRequest> items;
}
