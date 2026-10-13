package com.restaurant.order.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CloseShiftRequest {
    private BigDecimal actualCash;
    private String handoverNote;
}
