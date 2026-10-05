package com.restaurant.inventory.repository;

import com.restaurant.inventory.entity.InventoryIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryIssueRepository extends JpaRepository<InventoryIssue, Long> {
    @Query("SELECT COUNT(i) > 0 FROM InventoryIssue i WHERE i.note LIKE %:orderTag%")
    boolean existsByOrderTag(@Param("orderTag") String orderTag);
}
