package com.restaurant.inventory.client;

import com.restaurant.inventory.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "menu-service")
public interface MenuClient {

    @GetMapping("/api/recipes")
    ApiResponse<List<RecipeResponseDto>> getRecipesByMenuId(@RequestParam("menuId") Long menuId);
}
