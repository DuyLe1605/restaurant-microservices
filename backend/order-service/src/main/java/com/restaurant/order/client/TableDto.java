package com.restaurant.order.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableDto {
    private Long id;
    private String number;
    private Integer capacity;
    private String status;
    private String orderToken;
}
