package com.restaurant.order.repository;

import com.restaurant.order.entity.WorkShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkShiftRepository extends JpaRepository<WorkShift, Long> {
    Optional<WorkShift> findFirstByStatusOrderByStartTimeDesc(String status);

    List<WorkShift> findAllByOrderByStartTimeDesc();

    List<WorkShift> findByCashierIdOrderByStartTimeDesc(Long cashierId);

    List<WorkShift> findByStartTimeBetweenOrderByStartTimeDesc(LocalDateTime from, LocalDateTime to);

    boolean existsByStatus(String status);

    @Query("SELECT COUNT(w) FROM WorkShift w WHERE w.status = 'OPEN'")
    long countOpenShifts();
}
