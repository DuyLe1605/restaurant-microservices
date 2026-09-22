package com.restaurant.menu.service.impl;

import com.restaurant.menu.client.InventoryClient;
import com.restaurant.menu.constant.MenuConstants;
import com.restaurant.menu.dto.*;
import com.restaurant.menu.entity.Recipe;
import com.restaurant.menu.exception.ResourceNotFoundException;
import com.restaurant.menu.repository.MenuItemRepository;
import com.restaurant.menu.repository.RecipeRepository;
import com.restaurant.menu.service.RecipeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeServiceImpl implements RecipeService {

    private final RecipeRepository recipeRepository;
    private final MenuItemRepository menuItemRepository;
    private final InventoryClient inventoryClient;

    @Override
    @Transactional(readOnly = true)
    public List<RecipeResponse> getRecipesByMenuId(Long menuId) {
        if (!menuItemRepository.existsById(menuId)) {
            throw new ResourceNotFoundException(MenuConstants.MSG_ITEM_NOT_FOUND + menuId);
        }

        List<Recipe> recipes = recipeRepository.findByMenuId(menuId);
        return recipes.stream()
                .map(r -> RecipeResponse.builder()
                        .id(r.getId())
                        .menuId(r.getMenuId())
                        .ingredientId(r.getIngredientId())
                        .qty(r.getQty())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public List<RecipeResponse> saveRecipe(RecipeRequest request) {
        Long menuId = request.getMenuId();
        if (!menuItemRepository.existsById(menuId)) {
            throw new ResourceNotFoundException(MenuConstants.MSG_ITEM_NOT_FOUND + menuId);
        }

        // Delete existing recipes for this menu item (replace all pattern)
        recipeRepository.deleteByMenuId(menuId);

        List<Recipe> toSave = request.getItems().stream()
                .map(item -> Recipe.builder()
                        .menuId(menuId)
                        .ingredientId(item.getIngredientId())
                        .qty(item.getQty())
                        .build())
                .toList();

        List<Recipe> saved = recipeRepository.saveAll(toSave);

        return saved.stream()
                .map(r -> RecipeResponse.builder()
                        .id(r.getId())
                        .menuId(r.getMenuId())
                        .ingredientId(r.getIngredientId())
                        .qty(r.getQty())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public void deleteRecipe(Long id) {
        if (!recipeRepository.existsById(id)) {
            throw new ResourceNotFoundException(MenuConstants.MSG_RECIPE_NOT_FOUND + id);
        }
        recipeRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public CheckInventoryResponse checkInventory(CheckInventoryRequest request) {
        // Aggregate required ingredients: ingredientId -> totalNeeded
        Map<Long, BigDecimal> aggregatedNeeds = new HashMap<>();

        for (CheckInventoryItem item : request.getItems()) {
            List<Recipe> recipes = recipeRepository.findByMenuId(item.getMenuId());
            for (Recipe recipe : recipes) {
                BigDecimal neededForThisItem = recipe.getQty().multiply(BigDecimal.valueOf(item.getQty()));
                aggregatedNeeds.merge(recipe.getIngredientId(), neededForThisItem, BigDecimal::add);
            }
        }

        List<MissingIngredientDto> missingList = new ArrayList<>();

        for (Map.Entry<Long, BigDecimal> entry : aggregatedNeeds.entrySet()) {
            Long ingredientId = entry.getKey();
            BigDecimal needed = entry.getValue();

            BigDecimal available = BigDecimal.ZERO;
            String ingredientName = "Ingredient #" + ingredientId;
            String unit = "unit";

            try {
                ApiResponse<IngredientStockDto> stockResponse = inventoryClient.getIngredientStock(ingredientId);
                if (stockResponse != null && stockResponse.getData() != null) {
                    available = stockResponse.getData().getStock();
                    ingredientName = stockResponse.getData().getIngredientName();
                    unit = stockResponse.getData().getUnit();
                }
            } catch (Exception e) {
                log.warn("Failed to fetch stock from inventory-service for ingredient {}: {}", ingredientId, e.getMessage());
            }

            if (available.compareTo(needed) < 0) {
                missingList.add(MissingIngredientDto.builder()
                        .ingredientId(ingredientId)
                        .ingredientName(ingredientName)
                        .needed(needed)
                        .available(available)
                        .unit(unit)
                        .build());
            }
        }

        return CheckInventoryResponse.builder()
                .sufficient(missingList.isEmpty())
                .missing(missingList)
                .build();
    }
}
