package com.restaurant.inventory.repository;

import com.restaurant.inventory.entity.InventoryReceipt;
import com.restaurant.inventory.enums.ReceiptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryReceiptRepository extends JpaRepository<InventoryReceipt, Long> {
    Page<InventoryReceipt> findByStatus(ReceiptStatus status, Pageable pageable);
}
