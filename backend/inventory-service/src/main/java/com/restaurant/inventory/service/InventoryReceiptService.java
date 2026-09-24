package com.restaurant.inventory.service;

import com.restaurant.inventory.dto.*;
import com.restaurant.inventory.enums.ReceiptStatus;
import org.springframework.data.domain.Pageable;

public interface InventoryReceiptService {
    PageResponse<ReceiptResponse> getReceipts(ReceiptStatus status, Pageable pageable);
    ReceiptResponse getReceiptById(Long id);
    ReceiptResponse createReceipt(ReceiptRequest request);
    ReceiptResponse updateReceipt(Long id, ReceiptRequest request);
    void deleteReceipt(Long id);
    ReceiptResponse completeReceipt(Long id);
}
