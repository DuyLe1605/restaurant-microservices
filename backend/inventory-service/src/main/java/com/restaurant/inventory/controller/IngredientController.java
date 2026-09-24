package com.restaurant.inventory.controller;

import com.restaurant.inventory.dto.*;
import com.restaurant.inventory.service.IngredientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingredients")
@RequiredArgsConstructor
public class IngredientController {

    private final IngredientService ingredientService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<IngredientResponse>>> getIngredients(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<IngredientResponse> response = ingredientService.getIngredients(search, category, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response, "Fetched ingredients successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IngredientResponse>> getIngredientById(@PathVariable Long id) {
        IngredientResponse response = ingredientService.getIngredientById(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Ingredient found"));
    }

    @GetMapping("/{id}/stock")
    public ResponseEntity<ApiResponse<IngredientStockDto>> getStock(@PathVariable Long id) {
        IngredientStockDto response = ingredientService.getStockByIngredientId(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Stock retrieved"));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<IngredientResponse>>> getLowStock() {
        List<IngredientResponse> response = ingredientService.getLowStockIngredients();
        return ResponseEntity.ok(ApiResponse.ok(response, "Low stock ingredients retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<IngredientResponse>> createIngredient(
            @Valid @RequestBody IngredientRequest request) {
        IngredientResponse response = ingredientService.createIngredient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Ingredient created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IngredientResponse>> updateIngredient(
            @PathVariable Long id,
            @Valid @RequestBody IngredientRequest request) {
        IngredientResponse response = ingredientService.updateIngredient(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Ingredient updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteIngredient(@PathVariable Long id) {
        ingredientService.deleteIngredient(id);
        return ResponseEntity.ok(ApiResponse.ok("Ingredient deleted"));
    }
}
