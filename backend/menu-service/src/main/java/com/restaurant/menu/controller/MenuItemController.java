package com.restaurant.menu.controller;

import com.restaurant.menu.constant.MenuConstants;
import com.restaurant.menu.dto.ApiResponse;
import com.restaurant.menu.dto.MenuItemRequest;
import com.restaurant.menu.dto.MenuItemResponse;
import com.restaurant.menu.dto.PageResponse;
import com.restaurant.menu.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MenuItemResponse>>> getMenuItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<MenuItemResponse> response = menuItemService.getMenuItems(search, category, active, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response, "Fetched menu items successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getMenuItemById(@PathVariable Long id) {
        MenuItemResponse response = menuItemService.getMenuItemById(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Menu item found"));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getMenuItemByCode(@PathVariable String code) {
        MenuItemResponse response = menuItemService.getMenuItemByCode(code);
        return ResponseEntity.ok(ApiResponse.ok(response, "Menu item found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MenuItemResponse>> createMenuItem(
            @Valid @RequestBody MenuItemRequest request) {
        MenuItemResponse response = menuItemService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, MenuConstants.MSG_ITEM_CREATED));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemRequest request) {
        MenuItemResponse response = menuItemService.updateMenuItem(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, MenuConstants.MSG_ITEM_UPDATED));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable Long id) {
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.ok(ApiResponse.ok(MenuConstants.MSG_ITEM_DELETED));
    }
}
