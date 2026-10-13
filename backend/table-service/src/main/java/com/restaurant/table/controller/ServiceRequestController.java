package com.restaurant.table.controller;

import com.restaurant.table.dto.ApiResponse;
import com.restaurant.table.dto.ServiceRequestCreateDto;
import com.restaurant.table.dto.ServiceRequestDto;
import com.restaurant.table.service.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/service-requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService service;

    /**
     * PUBLIC endpoint – QR page gọi để gửi yêu cầu phụ (không cần auth)
     */
    @PostMapping("/public")
    public ResponseEntity<ApiResponse<ServiceRequestDto>> createPublic(
            @RequestBody ServiceRequestCreateDto dto) {
        ServiceRequestDto result = service.create(dto);
        return ResponseEntity.ok(ApiResponse.ok(result, "Yêu cầu đã được gửi tới nhân viên!"));
    }

    /**
     * STAFF endpoint – Lấy danh sách yêu cầu đang chờ (PENDING)
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ServiceRequestDto>>> getPending() {
        return ResponseEntity.ok(ApiResponse.ok(service.getAllPending(), "OK"));
    }

    /**
     * STAFF endpoint – Lấy tất cả yêu cầu
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceRequestDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(service.getAll(), "OK"));
    }

    /**
     * STAFF endpoint – Đếm số yêu cầu đang chờ (badge count)
     */
    @GetMapping("/count-pending")
    public ResponseEntity<ApiResponse<Map<String, Long>>> countPending() {
        long count = service.countPending();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("count", count), "OK"));
    }

    /**
     * STAFF endpoint – Đánh dấu đã xử lý
     */
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<ServiceRequestDto>> resolve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.resolve(id), "Đã xử lý yêu cầu!"));
    }

    /**
     * STAFF endpoint – Bỏ qua yêu cầu
     */
    @PatchMapping("/{id}/dismiss")
    public ResponseEntity<ApiResponse<ServiceRequestDto>> dismiss(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.dismiss(id), "Đã bỏ qua yêu cầu."));
    }
}
