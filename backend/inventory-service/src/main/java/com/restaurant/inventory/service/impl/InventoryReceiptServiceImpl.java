package com.restaurant.inventory.service.impl;

import com.restaurant.inventory.constant.InventoryConstants;
import com.restaurant.inventory.dto.*;
import com.restaurant.inventory.entity.*;
import com.restaurant.inventory.enums.InventoryLogType;
import com.restaurant.inventory.enums.ReceiptStatus;
import com.restaurant.inventory.exception.BadRequestException;
import com.restaurant.inventory.exception.ResourceNotFoundException;
import com.restaurant.inventory.messaging.InventoryEventPublisher;
import com.restaurant.inventory.repository.*;
import com.restaurant.inventory.service.InventoryReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryReceiptServiceImpl implements InventoryReceiptService {

    private final InventoryReceiptRepository receiptRepository;
    private final InventoryReceiptDetailRepository detailRepository;
    private final InventoryLogRepository logRepository;
    private final IngredientRepository ingredientRepository;
    private final InventoryEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReceiptResponse> getReceipts(ReceiptStatus status, Pageable pageable) {
        Page<InventoryReceipt> page = (status != null) ?
                receiptRepository.findByStatus(status, pageable) : receiptRepository.findAll(pageable);

        List<ReceiptResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<ReceiptResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ReceiptResponse getReceiptById(Long id) {
        InventoryReceipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(InventoryConstants.MSG_RECEIPT_NOT_FOUND + id));
        return mapToResponse(receipt);
    }

    @Override
    @Transactional
    public ReceiptResponse createReceipt(ReceiptRequest request) {
        InventoryReceipt receipt = InventoryReceipt.builder()
                .createdBy(request.getCreatedBy())
                .supplier(request.getSupplier())
                .receiptDate(request.getReceiptDate())
                .status(ReceiptStatus.PENDING)
                .note(request.getNote())
                .build();

        InventoryReceipt saved = receiptRepository.save(receipt);

        List<InventoryReceiptDetail> details = request.getItems().stream()
                .map(item -> InventoryReceiptDetail.builder()
                        .receiptId(saved.getId())
                        .ingredientId(item.getIngredientId())
                        .qty(item.getQty())
                        .unitPrice(item.getUnitPrice())
                        .build())
                .toList();

        detailRepository.saveAll(details);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ReceiptResponse updateReceipt(Long id, ReceiptRequest request) {
        InventoryReceipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(InventoryConstants.MSG_RECEIPT_NOT_FOUND + id));

        if (receipt.getStatus() == ReceiptStatus.COMPLETED) {
            throw new BadRequestException(InventoryConstants.MSG_RECEIPT_ALREADY_COMPLETED);
        }

        receipt.setSupplier(request.getSupplier());
        receipt.setReceiptDate(request.getReceiptDate());
        receipt.setNote(request.getNote());
        receiptRepository.save(receipt);

        detailRepository.deleteByReceiptId(id);

        List<InventoryReceiptDetail> details = request.getItems().stream()
                .map(item -> InventoryReceiptDetail.builder()
                        .receiptId(id)
                        .ingredientId(item.getIngredientId())
                        .qty(item.getQty())
                        .unitPrice(item.getUnitPrice())
                        .build())
                .toList();

        detailRepository.saveAll(details);
        return mapToResponse(receipt);
    }

    @Override
    @Transactional
    public void deleteReceipt(Long id) {
        InventoryReceipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(InventoryConstants.MSG_RECEIPT_NOT_FOUND + id));

        if (receipt.getStatus() == ReceiptStatus.COMPLETED) {
            throw new BadRequestException(InventoryConstants.MSG_RECEIPT_ALREADY_COMPLETED);
        }

        detailRepository.deleteByReceiptId(id);
        receiptRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ReceiptResponse completeReceipt(Long id) {
        InventoryReceipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(InventoryConstants.MSG_RECEIPT_NOT_FOUND + id));

        if (receipt.getStatus() == ReceiptStatus.COMPLETED) {
            throw new BadRequestException(InventoryConstants.MSG_RECEIPT_ALREADY_COMPLETED);
        }

        List<InventoryReceiptDetail> details = detailRepository.findByReceiptId(id);

        for (InventoryReceiptDetail d : details) {
            // Add to InventoryLog (+qty)
            InventoryLog invLog = InventoryLog.builder()
                    .ingredientId(d.getIngredientId())
                    .qtyChange(d.getQty())
                    .type(InventoryLogType.RECEIPT)
                    .relatedId(receipt.getId())
                    .note("Receipt #" + receipt.getId() + " completed")
                    .createdBy(receipt.getCreatedBy())
                    .build();
            logRepository.save(invLog);

            // Update latest purchase price of ingredient
            ingredientRepository.findById(d.getIngredientId()).ifPresent(ing -> {
                ing.setPurchasePrice(d.getUnitPrice());
                ingredientRepository.save(ing);

                // Broadcast stock snapshot
                BigDecimal currentStock = logRepository.calculateStock(ing.getId());
                eventPublisher.publishStockUpdated(StockSnapshotEventDto.builder()
                        .ingredientId(ing.getId())
                        .ingredientName(ing.getName())
                        .currentQty(currentStock)
                        .minStock(ing.getMinStock())
                        .unit(ing.getUnit())
                        .snapshotDate(LocalDate.now())
                        .build());
            });
        }

        receipt.setStatus(ReceiptStatus.COMPLETED);
        receiptRepository.save(receipt);

        return mapToResponse(receipt);
    }

    private ReceiptResponse mapToResponse(InventoryReceipt receipt) {
        List<InventoryReceiptDetail> details = detailRepository.findByReceiptId(receipt.getId());
        BigDecimal totalAmount = BigDecimal.ZERO;

        List<ReceiptDetailDto> itemDtos = details.stream().map(d -> {
            Ingredient ing = ingredientRepository.findById(d.getIngredientId()).orElse(null);
            return ReceiptDetailDto.builder()
                    .id(d.getId())
                    .ingredientId(d.getIngredientId())
                    .ingredientName(ing != null ? ing.getName() : "Unknown")
                    .unit(ing != null ? ing.getUnit() : "")
                    .qty(d.getQty())
                    .unitPrice(d.getUnitPrice())
                    .build();
        }).toList();

        for (ReceiptDetailDto dto : itemDtos) {
            totalAmount = totalAmount.add(dto.getQty().multiply(dto.getUnitPrice()));
        }

        return ReceiptResponse.builder()
                .id(receipt.getId())
                .createdBy(receipt.getCreatedBy())
                .supplier(receipt.getSupplier())
                .receiptDate(receipt.getReceiptDate())
                .status(receipt.getStatus())
                .note(receipt.getNote())
                .totalAmount(totalAmount)
                .items(itemDtos)
                .createdAt(receipt.getCreatedAt())
                .build();
    }
}
