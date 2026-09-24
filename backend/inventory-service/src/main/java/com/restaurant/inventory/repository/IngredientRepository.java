package com.restaurant.inventory.repository;

import com.restaurant.inventory.entity.Ingredient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    Optional<Ingredient> findByCode(String code);
    boolean existsByCode(String code);

    @Query("SELECT i FROM Ingredient i WHERE " +
           "(:search IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.code) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:category IS NULL OR i.category = :category)")
    Page<Ingredient> searchIngredients(@Param("search") String search,
                                       @Param("category") String category,
                                       Pageable pageable);
}
