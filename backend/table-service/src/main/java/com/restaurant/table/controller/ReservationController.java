package com.restaurant.table.controller;

import com.restaurant.table.dto.ApiResponse;
import com.restaurant.table.dto.ReservationRequest;
import com.restaurant.table.dto.ReservationResponse;
import com.restaurant.table.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getAll(
            @RequestParam(required = false) Long tableId) {
        List<ReservationResponse> list = reservationService.getAllReservations(tableId);
        return ResponseEntity.ok(ApiResponse.ok(list, "Reservations fetched"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationResponse>> getById(@PathVariable Long id) {
        ReservationResponse res = reservationService.getReservationById(id);
        return ResponseEntity.ok(ApiResponse.ok(res, "Reservation found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReservationResponse>> create(@Valid @RequestBody ReservationRequest request) {
        ReservationResponse created = reservationService.createReservation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created, "Reservation created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ReservationRequest request) {
        ReservationResponse updated = reservationService.updateReservation(id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Reservation updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.ok(ApiResponse.ok("Reservation deleted"));
    }
}
