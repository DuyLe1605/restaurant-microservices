package com.restaurant.menu.repository;

import com.restaurant.menu.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByMenuId(Long menuId);
    void deleteByMenuId(Long menuId);
    boolean existsByIngredientId(Long ingredientId);
}
