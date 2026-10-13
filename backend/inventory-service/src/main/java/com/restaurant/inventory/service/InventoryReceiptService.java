package com.restaurant.inventory.service;

import com.restaurant.inventory.dto.*;
import com.restaurant.inventory.enums.ReceiptStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface InventoryReceiptService {
    PageResponse<ReceiptResponse> getReceipts(ReceiptStatus status, Pageable pageable);
    PageResponse<ReceiptResponse> getReceipts(ReceiptStatus status, String supplier, LocalDate startDate, LocalDate endDate, Pageable pageable);
    ReceiptResponse getReceiptById(Long id);
    ReceiptResponse createReceipt(ReceiptRequest request);
    ReceiptResponse updateReceipt(Long id, ReceiptRequest request);
    void deleteReceipt(Long id);
    ReceiptResponse completeReceipt(Long id);
}
