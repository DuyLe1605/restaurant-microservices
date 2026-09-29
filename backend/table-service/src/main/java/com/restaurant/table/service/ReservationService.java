package com.restaurant.table.service;

import com.restaurant.table.dto.ReservationRequest;
import com.restaurant.table.dto.ReservationResponse;

import java.util.List;

public interface ReservationService {
    List<ReservationResponse> getAllReservations(Long tableId);
    ReservationResponse getReservationById(Long id);
    ReservationResponse createReservation(ReservationRequest request);
    ReservationResponse updateReservation(Long id, ReservationRequest request);
    void deleteReservation(Long id);
}
