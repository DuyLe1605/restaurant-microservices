package com.restaurant.order.controller;

import com.restaurant.order.dto.*;
import com.restaurant.order.service.WorkShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
public class WorkShiftController {

    private final WorkShiftService shiftService;

    /** Lấy ca đang mở (nếu có) */
    @GetMapping("/current")
    public ResponseEntity<ApiResponse<WorkShiftDto>> getCurrent() {
        WorkShiftDto shift = shiftService.getCurrentShift();
        return ResponseEntity.ok(ApiResponse.ok(shift, shift != null ? "Current shift found" : "No open shift"));
    }

    /** Lấy toàn bộ lịch sử ca */
    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkShiftDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(shiftService.getAllShifts(), "OK"));
    }

    /** Chi tiết 1 ca + danh sách đơn hàng trong ca */
    @GetMapping("/{id}/detail")
    public ResponseEntity<ApiResponse<ShiftDetailDto>> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(shiftService.getShiftDetail(id), "OK"));
    }

    /** ADMIN: Lọc ca theo cashier */
    @GetMapping("/by-cashier/{cashierId}")
    public ResponseEntity<ApiResponse<List<WorkShiftDto>>> getByCashier(@PathVariable Long cashierId) {
        return ResponseEntity.ok(ApiResponse.ok(shiftService.getShiftsByCashier(cashierId), "OK"));
    }

    /** Mở ca mới */
    @PostMapping("/open")
    public ResponseEntity<ApiResponse<WorkShiftDto>> open(
            @RequestBody OpenShiftRequest req,
            @RequestHeader(value = "X-User-Fullname", defaultValue = "Staff") String fullname) {
        WorkShiftDto result = shiftService.openShift(req, fullname);
        return ResponseEntity.ok(ApiResponse.ok(result, "Ca làm việc đã được mở!"));
    }

    /** Chốt két đóng ca */
    @PostMapping("/close")
    public ResponseEntity<ApiResponse<WorkShiftDto>> close(@RequestBody CloseShiftRequest req) {
        WorkShiftDto result = shiftService.closeShift(req);
        return ResponseEntity.ok(ApiResponse.ok(result, "Đã chốt két và đóng ca thành công!"));
    }
}
