package com.restaurant.inventory.repository;

import com.restaurant.inventory.entity.InventoryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface InventoryLogRepository extends JpaRepository<InventoryLog, Long> {

    @Query("SELECT COALESCE(SUM(l.qtyChange), 0) FROM InventoryLog l WHERE l.ingredientId = :ingredientId")
    BigDecimal calculateStock(@Param("ingredientId") Long ingredientId);

    List<InventoryLog> findByIngredientIdOrderByCreatedAtDesc(Long ingredientId);
}
