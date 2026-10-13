package com.restaurant.table.repository;

import com.restaurant.table.entity.ServiceRequest;
import com.restaurant.table.enums.ServiceRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByStatusOrderByCreatedAtDesc(ServiceRequestStatus status);
    List<ServiceRequest> findAllByOrderByCreatedAtDesc();
    List<ServiceRequest> findByTableNumberOrderByCreatedAtDesc(String tableNumber);
    long countByStatus(ServiceRequestStatus status);
}
