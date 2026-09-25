package com.restaurant.inventory.repository;

import com.restaurant.inventory.entity.InventoryIssueDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryIssueDetailRepository extends JpaRepository<InventoryIssueDetail, Long> {
    List<InventoryIssueDetail> findByIssueId(Long issueId);
}
