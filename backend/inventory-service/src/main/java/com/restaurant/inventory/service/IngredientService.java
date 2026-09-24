package com.restaurant.inventory.service;

import com.restaurant.inventory.dto.*;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IngredientService {
    PageResponse<IngredientResponse> getIngredients(String search, String category, Pageable pageable);
    IngredientResponse getIngredientById(Long id);
    IngredientStockDto getStockByIngredientId(Long id);
    IngredientResponse createIngredient(IngredientRequest request);
    IngredientResponse updateIngredient(Long id, IngredientRequest request);
    void deleteIngredient(Long id);
    List<IngredientResponse> getLowStockIngredients();
}
