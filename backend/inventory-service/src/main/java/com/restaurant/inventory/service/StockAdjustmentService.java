package com.restaurant.inventory.service;

import com.restaurant.inventory.dto.StockAdjustmentRequest;
import com.restaurant.inventory.entity.StockAdjustment;
import java.util.List;

public interface StockAdjustmentService {
    StockAdjustment adjustStock(StockAdjustmentRequest request);
    List<StockAdjustment> getAdjustmentsByIngredient(Long ingredientId);
}
