package com.restaurant.table.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrTokenResponse {
    private Long tableId;
    private String tableNumber;
    private String orderToken;
    private String qrUrl;
}
