package com.restaurant.table.service;

import com.restaurant.table.dto.TableRequest;
import com.restaurant.table.dto.TableResponse;
import com.restaurant.table.dto.TableStatusUpdateRequest;
import com.restaurant.table.enums.TableStatus;

import java.util.List;

public interface TableService {
    List<TableResponse> getAllTables();
    TableResponse getTableById(Long id);
    TableResponse getTableByToken(String token);
    TableResponse createTable(TableRequest request);
    TableResponse updateTable(Long id, TableRequest request);
    TableResponse updateTableStatus(Long id, TableStatus status);
    void deleteTable(Long id);
}
