package com.restaurant.inventory.repository;

import com.restaurant.inventory.entity.StockAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {
    List<StockAdjustment> findByIngredientIdOrderByCreatedAtDesc(Long ingredientId);
}
