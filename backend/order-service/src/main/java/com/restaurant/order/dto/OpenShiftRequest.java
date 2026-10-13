package com.restaurant.order.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OpenShiftRequest {
    private String cashierName;
    private Long cashierId;
    private BigDecimal openingCash;
}
