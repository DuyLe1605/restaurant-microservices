package com.restaurant.table.controller;

import com.restaurant.table.dto.ApiResponse;
import com.restaurant.table.dto.TableRequest;
import com.restaurant.table.dto.TableResponse;
import com.restaurant.table.dto.TableStatusUpdateRequest;
import com.restaurant.table.service.TableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TableResponse>>> getAllTables() {
        List<TableResponse> response = tableService.getAllTables();
        return ResponseEntity.ok(ApiResponse.ok(response, "Tables fetched"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TableResponse>> getTableById(@PathVariable Long id) {
        TableResponse response = tableService.getTableById(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Table found"));
    }

    @GetMapping("/by-token/{token}")
    public ResponseEntity<ApiResponse<TableResponse>> getTableByToken(@PathVariable String token) {
        TableResponse response = tableService.getTableByToken(token);
        return ResponseEntity.ok(ApiResponse.ok(response, "Table found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TableResponse>> createTable(@Valid @RequestBody TableRequest request) {
        TableResponse response = tableService.createTable(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Table created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(
            @PathVariable Long id,
            @Valid @RequestBody TableRequest request) {
        TableResponse response = tableService.updateTable(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Table updated"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TableResponse>> updateTableStatus(
            @PathVariable Long id,
            @Valid @RequestBody TableStatusUpdateRequest request) {
        TableResponse response = tableService.updateTableStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok(response, "Table status updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.ok(ApiResponse.ok("Table deleted"));
    }
}
