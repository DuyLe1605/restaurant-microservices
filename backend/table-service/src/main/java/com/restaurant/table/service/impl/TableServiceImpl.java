package com.restaurant.table.service.impl;

import com.restaurant.table.constant.TableConstants;
import com.restaurant.table.dto.TableRequest;
import com.restaurant.table.dto.TableResponse;
import com.restaurant.table.entity.RestaurantTable;
import com.restaurant.table.enums.TableStatus;
import com.restaurant.table.exception.ConflictException;
import com.restaurant.table.exception.ResourceNotFoundException;
import com.restaurant.table.repository.RestaurantTableRepository;
import com.restaurant.table.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TableServiceImpl implements TableService {

    private final RestaurantTableRepository tableRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getAllTables() {
        return tableRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TableResponse getTableById(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(TableConstants.MSG_TABLE_NOT_FOUND + id));
        return mapToResponse(table);
    }

    @Override
    @Transactional(readOnly = true)
    public TableResponse getTableByToken(String token) {
        RestaurantTable table = tableRepository.findByOrderToken(token)
                .orElseThrow(() -> new ResourceNotFoundException(TableConstants.MSG_TABLE_TOKEN_NOT_FOUND + token));
        return mapToResponse(table);
    }

    @Override
    @Transactional
    public TableResponse createTable(TableRequest request) {
        if (tableRepository.existsByNumber(request.getNumber())) {
            throw new ConflictException(TableConstants.MSG_TABLE_NUMBER_EXISTS + request.getNumber());
        }

        RestaurantTable table = RestaurantTable.builder()
                .number(request.getNumber())
                .capacity(request.getCapacity())
                .status(request.getStatus() != null ? request.getStatus() : TableStatus.FREE)
                .build();

        RestaurantTable saved = tableRepository.save(table);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public TableResponse updateTable(Long id, TableRequest request) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(TableConstants.MSG_TABLE_NOT_FOUND + id));

        if (!table.getNumber().equalsIgnoreCase(request.getNumber()) && tableRepository.existsByNumber(request.getNumber())) {
            throw new ConflictException(TableConstants.MSG_TABLE_NUMBER_EXISTS + request.getNumber());
        }

        table.setNumber(request.getNumber());
        table.setCapacity(request.getCapacity());
        if (request.getStatus() != null) {
            table.setStatus(request.getStatus());
        }

        RestaurantTable updated = tableRepository.save(table);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public TableResponse updateTableStatus(Long id, TableStatus status) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(TableConstants.MSG_TABLE_NOT_FOUND + id));

        // Idempotent check
        if (table.getStatus() == status) {
            return mapToResponse(table);
        }

        table.setStatus(status);
        RestaurantTable updated = tableRepository.save(table);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTable(Long id) {
        if (!tableRepository.existsById(id)) {
            throw new ResourceNotFoundException(TableConstants.MSG_TABLE_NOT_FOUND + id);
        }
        tableRepository.deleteById(id);
    }

    private TableResponse mapToResponse(RestaurantTable table) {
        return TableResponse.builder()
                .id(table.getId())
                .number(table.getNumber())
                .capacity(table.getCapacity())
                .status(table.getStatus())
                .orderToken(table.getOrderToken())
                .createdAt(table.getCreatedAt())
                .build();
    }
}
