package com.restaurant.order.repository;

import com.restaurant.order.entity.SaleOrder;
import com.restaurant.order.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SaleOrderRepository extends JpaRepository<SaleOrder, Long> {

    @Query("SELECT o FROM SaleOrder o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:tableId IS NULL OR o.tableId = :tableId)")
    Page<SaleOrder> searchOrders(@Param("status") OrderStatus status,
                                 @Param("tableId") Long tableId,
                                 Pageable pageable);

    Optional<SaleOrder> findFirstByTableIdAndStatus(Long tableId, OrderStatus status);
}
