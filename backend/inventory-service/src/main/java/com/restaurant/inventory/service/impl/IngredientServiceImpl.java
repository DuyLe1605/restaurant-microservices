package com.restaurant.inventory.service.impl;

import com.restaurant.inventory.constant.InventoryConstants;
import com.restaurant.inventory.dto.*;
import com.restaurant.inventory.entity.Ingredient;
import com.restaurant.inventory.exception.ConflictException;
import com.restaurant.inventory.exception.ResourceNotFoundException;
import com.restaurant.inventory.repository.IngredientRepository;
import com.restaurant.inventory.repository.InventoryLogRepository;
import com.restaurant.inventory.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IngredientServiceImpl implements IngredientService {

    private final IngredientRepository ingredientRepository;
    private final InventoryLogRepository logRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<IngredientResponse> getIngredients(String search, String category, Pageable pageable) {
        Page<Ingredient> page = ingredientRepository.searchIngredients(search, category, pageable);
        List<IngredientResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<IngredientResponse>builder()
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
    public IngredientResponse getIngredientById(Long id) {
        Ingredient ing = ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(InventoryConstants.MSG_INGREDIENT_NOT_FOUND + id));
        return mapToResponse(ing);
    }

    @Override
    @Transactional(readOnly = true)
    public IngredientStockDto getStockByIngredientId(Long id) {
        Ingredient ing = ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(InventoryConstants.MSG_INGREDIENT_NOT_FOUND + id));
        BigDecimal stock = logRepository.calculateStock(id);
        return IngredientStockDto.builder()
                .ingredientId(ing.getId())
                .ingredientName(ing.getName())
                .stock(stock)
                .unit(ing.getUnit())
                .build();
    }

    @Override
    @Transactional
    public IngredientResponse createIngredient(IngredientRequest request) {
        if (ingredientRepository.existsByCode(request.getCode())) {
            throw new ConflictException(InventoryConstants.MSG_DUPLICATE_CODE + request.getCode());
        }

        Ingredient ing = Ingredient.builder()
                .code(request.getCode())
                .name(request.getName())
                .category(request.getCategory())
                .unit(request.getUnit())
                .purchasePrice(request.getPurchasePrice())
                .minStock(request.getMinStock())
                .description(request.getDescription())
                .mainSupplier(request.getMainSupplier())
                .build();

        Ingredient saved = ingredientRepository.save(ing);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public IngredientResponse updateIngredient(Long id, IngredientRequest request) {
        Ingredient ing = ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(InventoryConstants.MSG_INGREDIENT_NOT_FOUND + id));

        if (!ing.getCode().equalsIgnoreCase(request.getCode()) && ingredientRepository.existsByCode(request.getCode())) {
            throw new ConflictException(InventoryConstants.MSG_DUPLICATE_CODE + request.getCode());
        }

        ing.setCode(request.getCode());
        ing.setName(request.getName());
        ing.setCategory(request.getCategory());
        ing.setUnit(request.getUnit());
        ing.setPurchasePrice(request.getPurchasePrice());
        ing.setMinStock(request.getMinStock());
        ing.setDescription(request.getDescription());
        ing.setMainSupplier(request.getMainSupplier());

        Ingredient updated = ingredientRepository.save(ing);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteIngredient(Long id) {
        if (!ingredientRepository.existsById(id)) {
            throw new ResourceNotFoundException(InventoryConstants.MSG_INGREDIENT_NOT_FOUND + id);
        }
        ingredientRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredientResponse> getLowStockIngredients() {
        return ingredientRepository.findAll().stream()
                .map(this::mapToResponse)
                .filter(res -> res.getCurrentStock().compareTo(BigDecimal.valueOf(res.getMinStock())) <= 0)
                .toList();
    }

    private IngredientResponse mapToResponse(Ingredient ing) {
        BigDecimal stock = logRepository.calculateStock(ing.getId());
        return IngredientResponse.builder()
                .id(ing.getId())
                .code(ing.getCode())
                .name(ing.getName())
                .category(ing.getCategory())
                .unit(ing.getUnit())
                .purchasePrice(ing.getPurchasePrice())
                .minStock(ing.getMinStock())
                .currentStock(stock)
                .description(ing.getDescription())
                .mainSupplier(ing.getMainSupplier())
                .createdAt(ing.getCreatedAt())
                .build();
    }
}
