package com.restaurant.table.service.impl;

import com.restaurant.table.constant.TableConstants;
import com.restaurant.table.dto.ReservationRequest;
import com.restaurant.table.dto.ReservationResponse;
import com.restaurant.table.entity.Reservation;
import com.restaurant.table.entity.RestaurantTable;
import com.restaurant.table.enums.ReservationStatus;
import com.restaurant.table.enums.TableStatus;
import com.restaurant.table.exception.BadRequestException;
import com.restaurant.table.exception.ConflictException;
import com.restaurant.table.exception.ResourceNotFoundException;
import com.restaurant.table.repository.ReservationRepository;
import com.restaurant.table.repository.RestaurantTableRepository;
import com.restaurant.table.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllReservations(Long tableId) {
        List<Reservation> list = (tableId != null) ?
                reservationRepository.findByTableIdOrderByStartTimeDesc(tableId) :
                reservationRepository.findAll();

        return list.stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(Long id) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(TableConstants.MSG_RESERVATION_NOT_FOUND + id));
        return mapToResponse(r);
    }

    @Override
    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {
        if (!tableRepository.existsById(request.getTableId())) {
            throw new ResourceNotFoundException(TableConstants.MSG_TABLE_NOT_FOUND + request.getTableId());
        }

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new BadRequestException(TableConstants.MSG_INVALID_TIME_RANGE);
        }

        if (request.getStartTime().isBefore(LocalDateTime.now().minusMinutes(5))) {
            throw new BadRequestException(TableConstants.MSG_START_TIME_PAST);
        }

        // Check for overlapping reservations
        List<Reservation> overlaps = reservationRepository.findOverlappingReservations(
                request.getTableId(), ReservationStatus.CANCELLED, request.getStartTime(), request.getEndTime());
        if (!overlaps.isEmpty()) {
            throw new ConflictException(TableConstants.MSG_RESERVATION_OVERLAP);
        }

        Reservation reservation = Reservation.builder()
                .tableId(request.getTableId())
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .partySize(request.getPartySize())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(request.getStatus() != null ? request.getStatus() : ReservationStatus.PENDING)
                .createdBy(request.getCreatedBy())
                .note(request.getNote())
                .build();

        Reservation saved = reservationRepository.save(reservation);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ReservationResponse updateReservation(Long id, ReservationRequest request) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(TableConstants.MSG_RESERVATION_NOT_FOUND + id));

        if (!tableRepository.existsById(request.getTableId())) {
            throw new ResourceNotFoundException(TableConstants.MSG_TABLE_NOT_FOUND + request.getTableId());
        }

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new BadRequestException(TableConstants.MSG_INVALID_TIME_RANGE);
        }

        // Check for overlaps excluding self
        List<Reservation> overlaps = reservationRepository.findOverlappingReservationsExcludingId(
                request.getTableId(), id, ReservationStatus.CANCELLED, request.getStartTime(), request.getEndTime());
        if (!overlaps.isEmpty()) {
            throw new ConflictException(TableConstants.MSG_RESERVATION_OVERLAP);
        }

        r.setTableId(request.getTableId());
        r.setCustomerName(request.getCustomerName());
        r.setCustomerPhone(request.getCustomerPhone());
        r.setPartySize(request.getPartySize());
        r.setStartTime(request.getStartTime());
        r.setEndTime(request.getEndTime());
        r.setStatus(request.getStatus());
        r.setNote(request.getNote());

        Reservation updated = reservationRepository.save(r);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteReservation(Long id) {
        if (!reservationRepository.existsById(id)) {
            throw new ResourceNotFoundException(TableConstants.MSG_RESERVATION_NOT_FOUND + id);
        }
        reservationRepository.deleteById(id);
    }

    private ReservationResponse mapToResponse(Reservation r) {
        RestaurantTable table = tableRepository.findById(r.getTableId()).orElse(null);
        return ReservationResponse.builder()
                .id(r.getId())
                .tableId(r.getTableId())
                .tableNumber(table != null ? table.getNumber() : "")
                .customerName(r.getCustomerName())
                .customerPhone(r.getCustomerPhone())
                .partySize(r.getPartySize())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .status(r.getStatus())
                .createdBy(r.getCreatedBy())
                .note(r.getNote())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
