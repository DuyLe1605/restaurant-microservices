package com.restaurant.table.repository;

import com.restaurant.table.entity.Reservation;
import com.restaurant.table.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByTableIdOrderByStartTimeDesc(Long tableId);

    @Query("SELECT r FROM Reservation r WHERE r.tableId = :tableId AND r.status != :cancelledStatus AND " +
           "r.startTime < :endTime AND r.endTime > :startTime")
    List<Reservation> findOverlappingReservations(
            @Param("tableId") Long tableId,
            @Param("cancelledStatus") ReservationStatus cancelledStatus,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT r FROM Reservation r WHERE r.tableId = :tableId AND r.id != :reservationId AND " +
           "r.status != :cancelledStatus AND r.startTime < :endTime AND r.endTime > :startTime")
    List<Reservation> findOverlappingReservationsExcludingId(
            @Param("tableId") Long tableId,
            @Param("reservationId") Long reservationId,
            @Param("cancelledStatus") ReservationStatus cancelledStatus,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
