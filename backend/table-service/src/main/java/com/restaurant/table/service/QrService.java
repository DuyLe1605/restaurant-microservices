package com.restaurant.table.service;

import com.restaurant.table.dto.QrTokenResponse;

public interface QrService {
    QrTokenResponse generateQrToken(Long tableId);
    void clearQrToken(Long tableId);
    QrTokenResponse getQrDetails(Long tableId);
}
