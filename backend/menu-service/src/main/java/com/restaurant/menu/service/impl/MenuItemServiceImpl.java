package com.restaurant.menu.service.impl;

import com.restaurant.menu.constant.MenuConstants;
import com.restaurant.menu.dto.MenuItemRequest;
import com.restaurant.menu.dto.MenuItemResponse;
import com.restaurant.menu.dto.PageResponse;
import com.restaurant.menu.entity.MenuItem;
import com.restaurant.menu.exception.ConflictException;
import com.restaurant.menu.exception.ResourceNotFoundException;
import com.restaurant.menu.repository.MenuItemRepository;
import com.restaurant.menu.repository.RecipeRepository;
import com.restaurant.menu.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MenuItemServiceImpl implements MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RecipeRepository recipeRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MenuItemResponse> getMenuItems(String search, String category, Boolean active, Pageable pageable) {
        Page<MenuItem> page = menuItemRepository.searchMenuItems(search, category, active, pageable);
        List<MenuItemResponse> list = page.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<MenuItemResponse>builder()
                .content(list)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public MenuItemResponse getMenuItemById(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MenuConstants.MSG_ITEM_NOT_FOUND + id));
        return mapToResponse(item);
    }

    @Override
    @Transactional(readOnly = true)
    public MenuItemResponse getMenuItemByCode(String code) {
        MenuItem item = menuItemRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException(MenuConstants.MSG_ITEM_NOT_FOUND + code));
        return mapToResponse(item);
    }

    @Override
    @Transactional
    public MenuItemResponse createMenuItem(MenuItemRequest request) {
        if (menuItemRepository.existsByCode(request.getCode())) {
            throw new ConflictException(MenuConstants.MSG_CODE_EXISTS + request.getCode());
        }

        MenuItem item = MenuItem.builder()
                .code(request.getCode())
                .name(request.getName())
                .price(request.getPrice())
                .category(request.getCategory())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        MenuItem saved = menuItemRepository.save(item);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public MenuItemResponse updateMenuItem(Long id, MenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MenuConstants.MSG_ITEM_NOT_FOUND + id));

        if (!item.getCode().equalsIgnoreCase(request.getCode()) && menuItemRepository.existsByCode(request.getCode())) {
            throw new ConflictException(MenuConstants.MSG_CODE_EXISTS + request.getCode());
        }

        item.setCode(request.getCode());
        item.setName(request.getName());
        item.setPrice(request.getPrice());
        item.setCategory(request.getCategory());
        item.setDescription(request.getDescription());
        item.setImageUrl(request.getImageUrl());
        item.setActive(request.getActive());

        MenuItem updated = menuItemRepository.save(item);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteMenuItem(Long id) {
        if (!menuItemRepository.existsById(id)) {
            throw new ResourceNotFoundException(MenuConstants.MSG_ITEM_NOT_FOUND + id);
        }
        recipeRepository.deleteByMenuId(id);
        menuItemRepository.deleteById(id);
    }

    private MenuItemResponse mapToResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .code(item.getCode())
                .name(item.getName())
                .price(item.getPrice())
                .category(item.getCategory())
                .description(item.getDescription())
                .imageUrl(item.getImageUrl())
                .active(item.getActive())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
