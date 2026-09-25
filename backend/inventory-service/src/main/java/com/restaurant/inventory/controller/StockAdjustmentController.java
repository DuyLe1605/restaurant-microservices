package com.restaurant.inventory.controller;

import com.restaurant.inventory.dto.ApiResponse;
import com.restaurant.inventory.dto.StockAdjustmentRequest;
import com.restaurant.inventory.entity.StockAdjustment;
import com.restaurant.inventory.service.StockAdjustmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/adjustments")
@RequiredArgsConstructor
public class StockAdjustmentController {

    private final StockAdjustmentService adjustmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<StockAdjustment>> adjustStock(
            @Valid @RequestBody StockAdjustmentRequest request) {
        StockAdjustment adj = adjustmentService.adjustStock(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(adj, "Stock adjusted successfully"));
    }

    @GetMapping("/ingredient/{ingredientId}")
    public ResponseEntity<ApiResponse<List<StockAdjustment>>> getAdjustments(@PathVariable Long ingredientId) {
        List<StockAdjustment> list = adjustmentService.getAdjustmentsByIngredient(ingredientId);
        return ResponseEntity.ok(ApiResponse.ok(list, "Adjustment history retrieved"));
    }
}
