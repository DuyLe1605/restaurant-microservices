package com.restaurant.report.service;

import com.restaurant.report.dto.*;
import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    DashboardResponse getDashboard();
    RevenueReportResponse getRevenueReport(LocalDate start, LocalDate end);
    List<OrderSummaryDto> getDailyOrderDetails(LocalDate date);
    List<StockStatusDto> getStockReport();
}
