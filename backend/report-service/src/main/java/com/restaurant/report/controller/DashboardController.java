package com.restaurant.report.controller;

import com.restaurant.report.dto.ApiResponse;
import com.restaurant.report.dto.DashboardResponse;
import com.restaurant.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        DashboardResponse response = reportService.getDashboard();
        return ResponseEntity.ok(ApiResponse.ok(response, "Dashboard metrics retrieved"));
    }
}
