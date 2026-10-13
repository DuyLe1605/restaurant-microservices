package com.restaurant.table.service;

import com.restaurant.table.dto.ServiceRequestCreateDto;
import com.restaurant.table.dto.ServiceRequestDto;
import com.restaurant.table.entity.ServiceRequest;
import com.restaurant.table.enums.ServiceRequestStatus;
import com.restaurant.table.enums.ServiceRequestType;
import com.restaurant.table.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {

    private final ServiceRequestRepository repository;

    private static final Map<ServiceRequestType, String> TYPE_LABELS = Map.of(
        ServiceRequestType.WATER,         "Thêm nước",
        ServiceRequestType.TOWEL,         "Gọi khăn",
        ServiceRequestType.CALL_STAFF,    "Gọi phục vụ",
        ServiceRequestType.EXTRA_UTENSIL, "Thêm dụng cụ ăn",
        ServiceRequestType.OTHER,         "Yêu cầu khác"
    );

    @Transactional
    public ServiceRequestDto create(ServiceRequestCreateDto dto) {
        ServiceRequest req = ServiceRequest.builder()
            .tableNumber(dto.getTableNumber())
            .type(dto.getType())
            .note(dto.getNote())
            .status(ServiceRequestStatus.PENDING)
            .build();
        repository.save(req);
        return toDto(req);
    }

    public List<ServiceRequestDto> getAllPending() {
        return repository.findByStatusOrderByCreatedAtDesc(ServiceRequestStatus.PENDING)
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ServiceRequestDto> getAll() {
        return repository.findAllByOrderByCreatedAtDesc()
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    public long countPending() {
        return repository.countByStatus(ServiceRequestStatus.PENDING);
    }

    @Transactional
    public ServiceRequestDto resolve(Long id) {
        ServiceRequest req = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Request not found: " + id));
        req.setStatus(ServiceRequestStatus.RESOLVED);
        req.setResolvedAt(LocalDateTime.now());
        repository.save(req);
        return toDto(req);
    }

    @Transactional
    public ServiceRequestDto dismiss(Long id) {
        ServiceRequest req = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Request not found: " + id));
        req.setStatus(ServiceRequestStatus.DISMISSED);
        req.setResolvedAt(LocalDateTime.now());
        repository.save(req);
        return toDto(req);
    }

    private ServiceRequestDto toDto(ServiceRequest r) {
        return ServiceRequestDto.builder()
            .id(r.getId())
            .tableNumber(r.getTableNumber())
            .type(r.getType())
            .typeLabel(TYPE_LABELS.getOrDefault(r.getType(), r.getType().name()))
            .note(r.getNote())
            .status(r.getStatus())
            .createdAt(r.getCreatedAt())
            .resolvedAt(r.getResolvedAt())
            .build();
    }
}
