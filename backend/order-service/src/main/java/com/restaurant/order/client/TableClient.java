package com.restaurant.order.client;

import com.restaurant.order.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "table-service")
public interface TableClient {

    @GetMapping("/api/tables/{id}")
    ApiResponse<TableDto> getTableById(@PathVariable("id") Long id);

    @GetMapping("/api/tables/by-token/{token}")
    ApiResponse<TableDto> getTableByToken(@PathVariable("token") String token);

    @PutMapping("/api/tables/{id}/status")
    ApiResponse<TableDto> updateTableStatus(@PathVariable("id") Long id, @RequestBody TableStatusDto statusDto);
}
