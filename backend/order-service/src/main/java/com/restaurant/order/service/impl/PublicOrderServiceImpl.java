package com.restaurant.order.service.impl;

import com.restaurant.order.client.TableClient;
import com.restaurant.order.client.TableDto;
import com.restaurant.order.dto.*;
import com.restaurant.order.entity.SaleOrder;
import com.restaurant.order.enums.OrderSource;
import com.restaurant.order.enums.OrderStatus;
import com.restaurant.order.exception.ResourceNotFoundException;
import com.restaurant.order.repository.SaleOrderRepository;
import com.restaurant.order.service.OrderService;
import com.restaurant.order.service.PublicOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublicOrderServiceImpl implements PublicOrderService {

    private final TableClient tableClient;
    private final SaleOrderRepository orderRepository;
    private final OrderService orderService;

    @Override
    @Transactional(readOnly = true)
    public PublicOrderStartResponse startOrderByToken(String token) {
        ApiResponse<TableDto> tableResp = tableClient.getTableByToken(token);
        if (tableResp == null || tableResp.getData() == null) {
            throw new ResourceNotFoundException("Invalid or inactive QR token: " + token);
        }

        TableDto table = tableResp.getData();

        // Check if there is an active order on this table
        Optional<SaleOrder> activeOrderOpt = orderRepository.findFirstByTableIdAndStatus(table.getId(), OrderStatus.OPEN);
        OrderResponse activeOrder = activeOrderOpt.map(order -> orderService.getOrderById(order.getId())).orElse(null);

        return PublicOrderStartResponse.builder()
                .tableId(table.getId())
                .tableNumber(table.getNumber())
                .capacity(table.getCapacity())
                .tableStatus(table.getStatus())
                .activeOrder(activeOrder)
                .build();
    }

    @Override
    @Transactional
    public OrderResponse submitPublicOrder(PublicOrderSubmitRequest request) {
        ApiResponse<TableDto> tableResp = tableClient.getTableByToken(request.getToken());
        if (tableResp == null || tableResp.getData() == null) {
            throw new ResourceNotFoundException("Invalid QR token: " + request.getToken());
        }

        TableDto table = tableResp.getData();

        // Check if table already has an OPEN order -> add items instead of creating new
        Optional<SaleOrder> activeOrderOpt = orderRepository.findFirstByTableIdAndStatus(table.getId(), OrderStatus.OPEN);
        if (activeOrderOpt.isPresent()) {
            AddItemsRequest addRequest = AddItemsRequest.builder()
                    .items(request.getItems())
                    .build();
            return orderService.addItems(activeOrderOpt.get().getId(), addRequest);
        }

        // Create new order
        OrderCreateRequest createReq = OrderCreateRequest.builder()
                .tableId(table.getId())
                .source(OrderSource.QR)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .note(request.getNote())
                .discount(BigDecimal.ZERO)
                .vatRate(BigDecimal.ZERO)
                .items(request.getItems())
                .build();

        return orderService.createOrder(createReq);
    }
}
