package com.restaurant.order.repository;

import com.restaurant.order.entity.SaleOrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleOrderDetailRepository extends JpaRepository<SaleOrderDetail, Long> {
    List<SaleOrderDetail> findBySaleOrderId(Long saleOrderId);
    void deleteBySaleOrderId(Long saleOrderId);
}
