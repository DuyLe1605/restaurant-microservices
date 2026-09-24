package com.restaurant.inventory.repository;

import com.restaurant.inventory.entity.InventoryIssue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryIssueRepository extends JpaRepository<InventoryIssue, Long> {
}
