package com.restaurant.menu.service;

import com.restaurant.menu.dto.*;

import java.util.List;

public interface RecipeService {
    List<RecipeResponse> getRecipesByMenuId(Long menuId);
    List<RecipeResponse> saveRecipe(RecipeRequest request);
    void deleteRecipe(Long id);
    CheckInventoryResponse checkInventory(CheckInventoryRequest request);
}
