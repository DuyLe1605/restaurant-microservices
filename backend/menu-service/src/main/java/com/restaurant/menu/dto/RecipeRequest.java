package com.restaurant.menu.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeRequest {

    @NotNull(message = "Menu ID is required")
    private Long menuId;

    @NotEmpty(message = "Recipe items must not be empty")
    @Valid
    private List<RecipeItemDto> items;
}
