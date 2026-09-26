package com.restaurant.table.controller;

import com.restaurant.table.constant.TableConstants;
import com.restaurant.table.dto.ApiResponse;
import com.restaurant.table.dto.QrTokenResponse;
import com.restaurant.table.service.QrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
public class QrController {

    private final QrService qrService;

    @PostMapping("/{tableId}/generate")
    public ResponseEntity<ApiResponse<QrTokenResponse>> generateToken(@PathVariable Long tableId) {
        QrTokenResponse response = qrService.generateQrToken(tableId);
        return ResponseEntity.ok(ApiResponse.ok(response, TableConstants.MSG_TOKEN_GENERATED));
    }

    @DeleteMapping("/{tableId}/clear")
    public ResponseEntity<ApiResponse<Void>> clearToken(@PathVariable Long tableId) {
        qrService.clearQrToken(tableId);
        return ResponseEntity.ok(ApiResponse.ok(TableConstants.MSG_TOKEN_CLEARED));
    }

    @GetMapping("/{tableId}")
    public ResponseEntity<ApiResponse<QrTokenResponse>> getQrDetails(@PathVariable Long tableId) {
        QrTokenResponse response = qrService.getQrDetails(tableId);
        return ResponseEntity.ok(ApiResponse.ok(response, "QR token retrieved"));
    }
}
