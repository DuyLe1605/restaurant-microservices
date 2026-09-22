package com.restaurant.menu.controller;

import com.restaurant.menu.constant.MenuConstants;
import com.restaurant.menu.dto.*;
import com.restaurant.menu.service.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecipeResponse>>> getRecipes(@RequestParam Long menuId) {
        List<RecipeResponse> response = recipeService.getRecipesByMenuId(menuId);
        return ResponseEntity.ok(ApiResponse.ok(response, "Fetched recipes for menu item"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<List<RecipeResponse>>> saveRecipe(
            @Valid @RequestBody RecipeRequest request) {
        List<RecipeResponse> response = recipeService.saveRecipe(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, MenuConstants.MSG_RECIPE_SAVED));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.ok(ApiResponse.ok(MenuConstants.MSG_RECIPE_DELETED));
    }

    @PostMapping("/check-inventory")
    public ResponseEntity<ApiResponse<CheckInventoryResponse>> checkInventory(
            @Valid @RequestBody CheckInventoryRequest request) {
        CheckInventoryResponse response = recipeService.checkInventory(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Inventory availability checked"));
    }
}
