package com.restaurant.report.config;

import com.restaurant.report.entity.ReportExpenseSummary;
import com.restaurant.report.entity.ReportOrderSummary;
import com.restaurant.report.entity.ReportStockSnapshot;
import com.restaurant.report.repository.ReportExpenseSummaryRepository;
import com.restaurant.report.repository.ReportOrderSummaryRepository;
import com.restaurant.report.repository.ReportStockSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ReportOrderSummaryRepository orderSummaryRepository;
    private final ReportExpenseSummaryRepository expenseSummaryRepository;
    private final ReportStockSnapshotRepository stockSnapshotRepository;

    @Override
    public void run(String... args) {
        if (orderSummaryRepository.count() == 0) {
            log.info("Seeding initial report summaries for report-service...");

            LocalDate today = LocalDate.now();

            // Daily historical orders for revenue charts
            ReportOrderSummary o1 = ReportOrderSummary.builder().id(101L).orderDate(today.minusDays(6)).totalAmount(new BigDecimal("22000000")).status("PAID").tableNumber("B-01").source("INTERNAL").build();
            ReportOrderSummary o2 = ReportOrderSummary.builder().id(102L).orderDate(today.minusDays(5)).totalAmount(new BigDecimal("25500000")).status("PAID").tableNumber("B-02").source("INTERNAL").build();
            ReportOrderSummary o3 = ReportOrderSummary.builder().id(103L).orderDate(today.minusDays(4)).totalAmount(new BigDecimal("28000000")).status("PAID").tableNumber("VIP-01").source("INTERNAL").build();
            ReportOrderSummary o4 = ReportOrderSummary.builder().id(104L).orderDate(today.minusDays(3)).totalAmount(new BigDecimal("32000000")).status("PAID").tableNumber("B-03").source("INTERNAL").build();
            ReportOrderSummary o5 = ReportOrderSummary.builder().id(105L).orderDate(today.minusDays(2)).totalAmount(new BigDecimal("38500000")).status("PAID").tableNumber("VIP-02").source("INTERNAL").build();
            ReportOrderSummary o6 = ReportOrderSummary.builder().id(106L).orderDate(today.minusDays(1)).totalAmount(new BigDecimal("41000000")).status("PAID").tableNumber("B-04").source("INTERNAL").build();
            ReportOrderSummary o7 = ReportOrderSummary.builder().id(107L).orderDate(today).totalAmount(new BigDecimal("28450000")).status("PAID").tableNumber("VIP-02").source("INTERNAL").build();
            orderSummaryRepository.saveAll(List.of(o1, o2, o3, o4, o5, o6, o7));

            // Expenses summary
            ReportExpenseSummary e1 = ReportExpenseSummary.builder().id(201L).expenseDate(today.minusDays(6)).expenseType("Tiêu hao thực phẩm").amount(new BigDecimal("7000000")).build();
            ReportExpenseSummary e2 = ReportExpenseSummary.builder().id(202L).expenseDate(today.minusDays(5)).expenseType("Tiêu hao thực phẩm").amount(new BigDecimal("8500000")).build();
            ReportExpenseSummary e3 = ReportExpenseSummary.builder().id(203L).expenseDate(today.minusDays(4)).expenseType("Tiêu hao thực phẩm").amount(new BigDecimal("9000000")).build();
            ReportExpenseSummary e4 = ReportExpenseSummary.builder().id(204L).expenseDate(today.minusDays(3)).expenseType("Điện nước EVN").amount(new BigDecimal("12000000")).build();
            ReportExpenseSummary e5 = ReportExpenseSummary.builder().id(205L).expenseDate(today.minusDays(2)).expenseType("Tiêu hao thực phẩm").amount(new BigDecimal("14000000")).build();
            ReportExpenseSummary e6 = ReportExpenseSummary.builder().id(206L).expenseDate(today.minusDays(1)).expenseType("Tiêu hao thực phẩm").amount(new BigDecimal("15000000")).build();
            ReportExpenseSummary e7 = ReportExpenseSummary.builder().id(207L).expenseDate(today).expenseType("Chi phí vận hành ngày").amount(new BigDecimal("8200000")).build();
            expenseSummaryRepository.saveAll(List.of(e1, e2, e3, e4, e5, e6, e7));

            // Stock snapshots
            ReportStockSnapshot s1 = ReportStockSnapshot.builder().ingredientId(1L).ingredientName("Bò Wagyu A5 Ribeye").currentQty(new BigDecimal("8.500")).minStock(5).unit("kg").snapshotDate(today).build();
            ReportStockSnapshot s2 = ReportStockSnapshot.builder().ingredientId(2L).ingredientName("Cua King Crab Sống").currentQty(new BigDecimal("6.200")).minStock(10).unit("kg").snapshotDate(today).build();
            ReportStockSnapshot s3 = ReportStockSnapshot.builder().ingredientId(3L).ingredientName("Cá Hồi Tươi Na Uy").currentQty(new BigDecimal("12.000")).minStock(8).unit("kg").snapshotDate(today).build();
            ReportStockSnapshot s4 = ReportStockSnapshot.builder().ingredientId(4L).ingredientName("Nấm Truffle Đen Pháp").currentQty(new BigDecimal("2.000")).minStock(4).unit("hộp 100g").snapshotDate(today).build();
            stockSnapshotRepository.saveAll(List.of(s1, s2, s3, s4));

            log.info("Seeded 7 report orders, 7 report expenses, and 4 stock snapshots successfully!");
        }
    }
}
