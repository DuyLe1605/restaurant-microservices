package com.restaurant.inventory.service.impl;

import com.restaurant.inventory.constant.InventoryConstants;
import com.restaurant.inventory.dto.IngredientCategoryDto;
import com.restaurant.inventory.entity.IngredientCategory;
import com.restaurant.inventory.exception.ConflictException;
import com.restaurant.inventory.exception.ResourceNotFoundException;
import com.restaurant.inventory.repository.IngredientCategoryRepository;
import com.restaurant.inventory.service.IngredientCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IngredientCategoryServiceImpl implements IngredientCategoryService {

    private final IngredientCategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<IngredientCategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> IngredientCategoryDto.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .description(c.getDescription())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public IngredientCategoryDto getCategoryById(Long id) {
        IngredientCategory c = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(InventoryConstants.MSG_CATEGORY_NOT_FOUND + id));
        return IngredientCategoryDto.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .build();
    }

    @Override
    @Transactional
    public IngredientCategoryDto createCategory(IngredientCategoryDto dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new ConflictException("Category already exists with name: " + dto.getName());
        }
        IngredientCategory c = IngredientCategory.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
        IngredientCategory saved = categoryRepository.save(c);
        dto.setId(saved.getId());
        return dto;
    }

    @Override
    @Transactional
    public IngredientCategoryDto updateCategory(Long id, IngredientCategoryDto dto) {
        IngredientCategory c = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(InventoryConstants.MSG_CATEGORY_NOT_FOUND + id));

        if (!c.getName().equalsIgnoreCase(dto.getName()) && categoryRepository.existsByName(dto.getName())) {
            throw new ConflictException("Category already exists with name: " + dto.getName());
        }

        c.setName(dto.getName());
        c.setDescription(dto.getDescription());
        categoryRepository.save(c);

        dto.setId(id);
        return dto;
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException(InventoryConstants.MSG_CATEGORY_NOT_FOUND + id);
        }
        categoryRepository.deleteById(id);
    }
}
