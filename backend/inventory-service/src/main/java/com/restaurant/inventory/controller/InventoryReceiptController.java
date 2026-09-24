package com.restaurant.inventory.controller;

import com.restaurant.inventory.dto.*;
import com.restaurant.inventory.enums.ReceiptStatus;
import com.restaurant.inventory.service.InventoryReceiptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory/receipts")
@RequiredArgsConstructor
public class InventoryReceiptController {

    private final InventoryReceiptService receiptService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ReceiptResponse>>> getReceipts(
            @RequestParam(required = false) ReceiptStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "receiptDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<ReceiptResponse> response = receiptService.getReceipts(status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response, "Fetched receipts"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReceiptResponse>> getReceiptById(@PathVariable Long id) {
        ReceiptResponse response = receiptService.getReceiptById(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Receipt found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReceiptResponse>> createReceipt(@Valid @RequestBody ReceiptRequest request) {
        ReceiptResponse response = receiptService.createReceipt(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Receipt created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReceiptResponse>> updateReceipt(
            @PathVariable Long id,
            @Valid @RequestBody ReceiptRequest request) {
        ReceiptResponse response = receiptService.updateReceipt(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Receipt updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReceipt(@PathVariable Long id) {
        receiptService.deleteReceipt(id);
        return ResponseEntity.ok(ApiResponse.ok("Receipt deleted"));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<ReceiptResponse>> completeReceipt(@PathVariable Long id) {
        ReceiptResponse response = receiptService.completeReceipt(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Receipt marked as COMPLETED and stock added"));
    }
}
