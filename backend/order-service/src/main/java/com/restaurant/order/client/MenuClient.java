package com.restaurant.order.client;

import com.restaurant.order.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "menu-service")
public interface MenuClient {

    @GetMapping("/api/menu/{id}")
    ApiResponse<MenuItemDto> getMenuItemById(@PathVariable("id") Long id);

    @PostMapping("/api/recipes/check-inventory")
    ApiResponse<CheckInventoryDto> checkInventory(@RequestBody Map<String, Object> request);
}
