package com.restaurant.inventory.service;

import com.restaurant.inventory.dto.IngredientCategoryDto;
import java.util.List;

public interface IngredientCategoryService {
    List<IngredientCategoryDto> getAllCategories();
    IngredientCategoryDto getCategoryById(Long id);
    IngredientCategoryDto createCategory(IngredientCategoryDto dto);
    IngredientCategoryDto updateCategory(Long id, IngredientCategoryDto dto);
    void deleteCategory(Long id);
}
