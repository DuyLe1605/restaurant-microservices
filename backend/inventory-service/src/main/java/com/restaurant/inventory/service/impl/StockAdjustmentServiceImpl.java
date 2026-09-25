package com.restaurant.inventory.service.impl;

import com.restaurant.inventory.constant.InventoryConstants;
import com.restaurant.inventory.dto.StockAdjustmentRequest;
import com.restaurant.inventory.dto.StockSnapshotEventDto;
import com.restaurant.inventory.entity.Ingredient;
import com.restaurant.inventory.entity.InventoryLog;
import com.restaurant.inventory.entity.StockAdjustment;
import com.restaurant.inventory.enums.InventoryLogType;
import com.restaurant.inventory.exception.ResourceNotFoundException;
import com.restaurant.inventory.messaging.InventoryEventPublisher;
import com.restaurant.inventory.repository.IngredientRepository;
import com.restaurant.inventory.repository.InventoryLogRepository;
import com.restaurant.inventory.repository.StockAdjustmentRepository;
import com.restaurant.inventory.service.StockAdjustmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockAdjustmentServiceImpl implements StockAdjustmentService {

    private final StockAdjustmentRepository adjustmentRepository;
    private final InventoryLogRepository logRepository;
    private final IngredientRepository ingredientRepository;
    private final InventoryEventPublisher eventPublisher;

    @Override
    @Transactional
    public StockAdjustment adjustStock(StockAdjustmentRequest request) {
        Ingredient ing = ingredientRepository.findById(request.getIngredientId())
                .orElseThrow(() -> new ResourceNotFoundException(InventoryConstants.MSG_INGREDIENT_NOT_FOUND + request.getIngredientId()));

        BigDecimal currentStock = logRepository.calculateStock(ing.getId());
        BigDecimal diff = request.getNewQty().subtract(currentStock);

        StockAdjustment adj = StockAdjustment.builder()
                .ingredientId(ing.getId())
                .oldQty(currentStock)
                .newQty(request.getNewQty())
                .adjustDate(request.getAdjustDate())
                .reason(request.getReason())
                .note(request.getNote())
                .adjustedBy(request.getAdjustedBy())
                .build();
        StockAdjustment saved = adjustmentRepository.save(adj);

        if (diff.compareTo(BigDecimal.ZERO) != 0) {
            InventoryLog invLog = InventoryLog.builder()
                    .ingredientId(ing.getId())
                    .qtyChange(diff)
                    .type(InventoryLogType.ADJUST)
                    .relatedId(saved.getId())
                    .note("Stock adjustment #" + saved.getId() + ": " + request.getReason())
                    .createdBy(request.getAdjustedBy())
                    .build();
            logRepository.save(invLog);

            eventPublisher.publishStockUpdated(StockSnapshotEventDto.builder()
                    .ingredientId(ing.getId())
                    .ingredientName(ing.getName())
                    .currentQty(request.getNewQty())
                    .minStock(ing.getMinStock())
                    .unit(ing.getUnit())
                    .snapshotDate(LocalDate.now())
                    .build());
        }

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockAdjustment> getAdjustmentsByIngredient(Long ingredientId) {
        return adjustmentRepository.findByIngredientIdOrderByCreatedAtDesc(ingredientId);
    }
}
