package com.restaurant.menu.service;

import com.restaurant.menu.dto.MenuItemRequest;
import com.restaurant.menu.dto.MenuItemResponse;
import com.restaurant.menu.dto.PageResponse;
import org.springframework.data.domain.Pageable;

public interface MenuItemService {
    PageResponse<MenuItemResponse> getMenuItems(String search, String category, Boolean active, Pageable pageable);
    MenuItemResponse getMenuItemById(Long id);
    MenuItemResponse getMenuItemByCode(String code);
    MenuItemResponse createMenuItem(MenuItemRequest request);
    MenuItemResponse updateMenuItem(Long id, MenuItemRequest request);
    void deleteMenuItem(Long id);
}
