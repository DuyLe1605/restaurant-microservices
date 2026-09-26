package com.restaurant.table.service.impl;

import com.restaurant.table.constant.TableConstants;
import com.restaurant.table.dto.QrTokenResponse;
import com.restaurant.table.entity.RestaurantTable;
import com.restaurant.table.exception.ResourceNotFoundException;
import com.restaurant.table.repository.RestaurantTableRepository;
import com.restaurant.table.service.QrService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QrServiceImpl implements QrService {

    private final RestaurantTableRepository tableRepository;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    @Transactional
    public QrTokenResponse generateQrToken(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException(TableConstants.MSG_TABLE_NOT_FOUND + tableId));

        String token = UUID.randomUUID().toString().replace("-", "");
        table.setOrderToken(token);
        tableRepository.save(table);

        return buildQrResponse(table);
    }

    @Override
    @Transactional
    public void clearQrToken(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException(TableConstants.MSG_TABLE_NOT_FOUND + tableId));

        table.setOrderToken(null);
        tableRepository.save(table);
    }

    @Override
    @Transactional(readOnly = true)
    public QrTokenResponse getQrDetails(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException(TableConstants.MSG_TABLE_NOT_FOUND + tableId));

        return buildQrResponse(table);
    }

    private QrTokenResponse buildQrResponse(RestaurantTable table) {
        String token = table.getOrderToken();
        String qrUrl = (token != null) ? frontendUrl + "/public-order?token=" + token : null;

        return QrTokenResponse.builder()
                .tableId(table.getId())
                .tableNumber(table.getNumber())
                .orderToken(token)
                .qrUrl(qrUrl)
                .build();
    }
}
