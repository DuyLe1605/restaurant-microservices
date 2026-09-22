package com.restaurant.menu.client;

import com.restaurant.menu.dto.ApiResponse;
import com.restaurant.menu.dto.IngredientStockDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "inventory-service")
public interface InventoryClient {

    @GetMapping("/api/ingredients/{id}/stock")
    ApiResponse<IngredientStockDto> getIngredientStock(@PathVariable("id") Long id);
}
