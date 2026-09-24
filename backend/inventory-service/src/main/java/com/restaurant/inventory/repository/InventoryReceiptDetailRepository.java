package com.restaurant.inventory.repository;

import com.restaurant.inventory.entity.InventoryReceiptDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryReceiptDetailRepository extends JpaRepository<InventoryReceiptDetail, Long> {
    List<InventoryReceiptDetail> findByReceiptId(Long receiptId);
    void deleteByReceiptId(Long receiptId);
}
