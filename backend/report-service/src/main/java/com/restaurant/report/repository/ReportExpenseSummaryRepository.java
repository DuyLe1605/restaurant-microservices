package com.restaurant.report.repository;

import com.restaurant.report.entity.ReportExpenseSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReportExpenseSummaryRepository extends JpaRepository<ReportExpenseSummary, Long> {

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM ReportExpenseSummary e WHERE e.expenseDate = :date")
    BigDecimal sumAmountByExpenseDate(@Param("date") LocalDate date);

    List<ReportExpenseSummary> findByExpenseDateBetweenOrderByExpenseDateAsc(LocalDate start, LocalDate end);
}
