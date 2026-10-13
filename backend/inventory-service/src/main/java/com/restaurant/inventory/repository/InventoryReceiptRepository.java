package com.restaurant.inventory.repository;

import com.restaurant.inventory.entity.InventoryReceipt;
import com.restaurant.inventory.enums.ReceiptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

@Repository
public interface InventoryReceiptRepository extends JpaRepository<InventoryReceipt, Long> {
    Page<InventoryReceipt> findByStatus(ReceiptStatus status, Pageable pageable);

    @Query("SELECT r FROM InventoryReceipt r WHERE " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:supplier IS NULL OR :supplier = '' OR LOWER(r.supplier) LIKE LOWER(CONCAT('%', :supplier, '%'))) AND " +
            "(:startDate IS NULL OR r.receiptDate >= :startDate) AND " +
            "(:endDate IS NULL OR r.receiptDate <= :endDate)")
    Page<InventoryReceipt> findFiltered(
            @Param("status") ReceiptStatus status,
            @Param("supplier") String supplier,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);
}
