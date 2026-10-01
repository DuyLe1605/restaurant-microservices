package com.restaurant.report.repository;

import com.restaurant.report.entity.ReportOrderSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReportOrderSummaryRepository extends JpaRepository<ReportOrderSummary, Long> {

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM ReportOrderSummary o WHERE o.orderDate = :date")
    BigDecimal sumTotalByOrderDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(o) FROM ReportOrderSummary o WHERE o.orderDate = :date")
    long countByOrderDate(@Param("date") LocalDate date);

    List<ReportOrderSummary> findByOrderDateBetweenOrderByOrderDateAsc(LocalDate start, LocalDate end);

    List<ReportOrderSummary> findByOrderDateOrderBySyncedAtDesc(LocalDate date);

    List<ReportOrderSummary> findTop5ByOrderBySyncedAtDesc();
}
