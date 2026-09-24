package com.restaurant.inventory.controller;

import com.restaurant.inventory.dto.ApiResponse;
import com.restaurant.inventory.dto.IngredientCategoryDto;
import com.restaurant.inventory.service.IngredientCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingredient-categories")
@RequiredArgsConstructor
public class IngredientCategoryController {

    private final IngredientCategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<IngredientCategoryDto>>> getAll() {
        List<IngredientCategoryDto> list = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.ok(list, "Fetched ingredient categories"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IngredientCategoryDto>> getById(@PathVariable Long id) {
        IngredientCategoryDto dto = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.ok(dto, "Category found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<IngredientCategoryDto>> create(@Valid @RequestBody IngredientCategoryDto dto) {
        IngredientCategoryDto created = categoryService.createCategory(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created, "Category created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IngredientCategoryDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody IngredientCategoryDto dto) {
        IngredientCategoryDto updated = categoryService.updateCategory(id, dto);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Category updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Category deleted"));
    }
}
