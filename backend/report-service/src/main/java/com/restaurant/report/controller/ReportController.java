package com.restaurant.report.controller;

import com.restaurant.report.dto.*;
import com.restaurant.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueReportResponse>> getRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        RevenueReportResponse response = reportService.getRevenueReport(start, end);
        return ResponseEntity.ok(ApiResponse.ok(response, "Revenue report retrieved"));
    }

    @GetMapping("/revenue/{day}")
    public ResponseEntity<ApiResponse<List<OrderSummaryDto>>> getRevenueByDay(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate day) {
        List<OrderSummaryDto> response = reportService.getDailyOrderDetails(day);
        return ResponseEntity.ok(ApiResponse.ok(response, "Orders for day retrieved"));
    }

    @GetMapping("/stock")
    public ResponseEntity<ApiResponse<List<StockStatusDto>>> getStockReport() {
        List<StockStatusDto> response = reportService.getStockReport();
        return ResponseEntity.ok(ApiResponse.ok(response, "Stock status report retrieved"));
    }
}
