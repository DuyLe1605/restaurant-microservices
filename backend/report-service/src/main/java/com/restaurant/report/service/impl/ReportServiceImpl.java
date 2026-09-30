package com.restaurant.report.service.impl;

import com.restaurant.report.constant.ReportConstants;
import com.restaurant.report.dto.*;
import com.restaurant.report.entity.ReportExpenseSummary;
import com.restaurant.report.entity.ReportOrderSummary;
import com.restaurant.report.entity.ReportStockSnapshot;
import com.restaurant.report.repository.ReportExpenseSummaryRepository;
import com.restaurant.report.repository.ReportOrderSummaryRepository;
import com.restaurant.report.repository.ReportStockSnapshotRepository;
import com.restaurant.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportOrderSummaryRepository orderSummaryRepository;
    private final ReportExpenseSummaryRepository expenseSummaryRepository;
    private final ReportStockSnapshotRepository stockSnapshotRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        LocalDate today = LocalDate.now();

        BigDecimal todayRev = orderSummaryRepository.sumTotalByOrderDate(today);
        BigDecimal todayExp = expenseSummaryRepository.sumAmountByExpenseDate(today);
        BigDecimal todayProfit = todayRev.subtract(todayExp);
        long todayOrders = orderSummaryRepository.countByOrderDate(today);

        List<StockStatusDto> lowStock = getStockReport().stream()
                .filter(s -> !ReportConstants.STOCK_STATUS_NORMAL.equals(s.getStatusLevel()))
                .toList();

        List<OrderSummaryDto> recent = orderSummaryRepository.findTop5ByOrderBySyncedAtDesc().stream()
                .map(this::mapOrder)
                .toList();

        return DashboardResponse.builder()
                .todayRevenue(todayRev)
                .todayExpense(todayExp)
                .todayProfit(todayProfit)
                .todayOrderCount(todayOrders)
                .lowStockAlerts(lowStock)
                .recentOrders(recent)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueReport(LocalDate start, LocalDate end) {
        if (start == null) start = LocalDate.now().minusDays(30);
        if (end == null) end = LocalDate.now();

        List<ReportOrderSummary> orders = orderSummaryRepository.findByOrderDateBetweenOrderByOrderDateAsc(start, end);
        List<ReportExpenseSummary> expenses = expenseSummaryRepository.findByExpenseDateBetweenOrderByExpenseDateAsc(start, end);

        Map<LocalDate, BigDecimal> revMap = new TreeMap<>();
        Map<LocalDate, Long> countMap = new HashMap<>();
        Map<LocalDate, BigDecimal> expMap = new HashMap<>();

        for (ReportOrderSummary o : orders) {
            revMap.merge(o.getOrderDate(), o.getTotalAmount(), BigDecimal::add);
            countMap.merge(o.getOrderDate(), 1L, Long::sum);
        }

        for (ReportExpenseSummary e : expenses) {
            expMap.merge(e.getExpenseDate(), e.getAmount(), BigDecimal::add);
        }

        Set<LocalDate> allDates = new TreeSet<>(revMap.keySet());
        allDates.addAll(expMap.keySet());

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        long totalOrders = orders.size();

        List<DailyRevenueDto> dailyList = new ArrayList<>();
        for (LocalDate d : allDates) {
            BigDecimal rev = revMap.getOrDefault(d, BigDecimal.ZERO);
            BigDecimal exp = expMap.getOrDefault(d, BigDecimal.ZERO);
            BigDecimal prof = rev.subtract(exp);
            long count = countMap.getOrDefault(d, 0L);

            totalRevenue = totalRevenue.add(rev);
            totalExpense = totalExpense.add(exp);

            dailyList.add(DailyRevenueDto.builder()
                    .date(d)
                    .revenue(rev)
                    .expense(exp)
                    .profit(prof)
                    .orderCount(count)
                    .build());
        }

        return RevenueReportResponse.builder()
                .startDate(start)
                .endDate(end)
                .totalRevenue(totalRevenue)
                .totalExpense(totalExpense)
                .totalProfit(totalRevenue.subtract(totalExpense))
                .totalOrders(totalOrders)
                .dailyDetails(dailyList)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderSummaryDto> getDailyOrderDetails(LocalDate date) {
        return orderSummaryRepository.findByOrderDateOrderBySyncedAtDesc(date).stream()
                .map(this::mapOrder)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockStatusDto> getStockReport() {
        List<ReportStockSnapshot> snapshots = stockSnapshotRepository.findLatestSnapshotsPerIngredient();
        return snapshots.stream().map(s -> {
            String level = ReportConstants.STOCK_STATUS_NORMAL;
            if (s.getCurrentQty().compareTo(BigDecimal.ZERO) <= 0) {
                level = ReportConstants.STOCK_STATUS_CRITICAL;
            } else if (s.getMinStock() != null && s.getCurrentQty().compareTo(BigDecimal.valueOf(s.getMinStock())) <= 0) {
                level = ReportConstants.STOCK_STATUS_WARNING;
            }

            return StockStatusDto.builder()
                    .ingredientId(s.getIngredientId())
                    .ingredientName(s.getIngredientName())
                    .currentQty(s.getCurrentQty())
                    .minStock(s.getMinStock())
                    .unit(s.getUnit())
                    .statusLevel(level)
                    .build();
        }).toList();
    }

    private OrderSummaryDto mapOrder(ReportOrderSummary o) {
        return OrderSummaryDto.builder()
                .id(o.getId())
                .orderDate(o.getOrderDate())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus())
                .tableNumber(o.getTableNumber())
                .cashierName(o.getCashierName())
                .source(o.getSource())
                .build();
    }
}
