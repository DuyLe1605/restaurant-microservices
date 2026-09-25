package com.restaurant.inventory.repository;

import com.restaurant.inventory.entity.IngredientCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IngredientCategoryRepository extends JpaRepository<IngredientCategory, Long> {
    Optional<IngredientCategory> findByName(String name);
    boolean existsByName(String name);
}
