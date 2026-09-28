package com.restaurant.order.controller;

import com.restaurant.order.dto.ApiResponse;
import com.restaurant.order.dto.OrderResponse;
import com.restaurant.order.dto.PublicOrderStartResponse;
import com.restaurant.order.dto.PublicOrderSubmitRequest;
import com.restaurant.order.service.PublicOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public-order")
@RequiredArgsConstructor
public class PublicOrderController {

    private final PublicOrderService publicOrderService;

    @GetMapping("/start")
    public ResponseEntity<ApiResponse<PublicOrderStartResponse>> start(@RequestParam String token) {
        PublicOrderStartResponse response = publicOrderService.startOrderByToken(token);
        return ResponseEntity.ok(ApiResponse.ok(response, "Table order session started"));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<OrderResponse>> submit(@Valid @RequestBody PublicOrderSubmitRequest request) {
        OrderResponse response = publicOrderService.submitPublicOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Order submitted from QR"));
    }
}
