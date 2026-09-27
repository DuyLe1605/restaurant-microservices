package com.restaurant.order.service;

import com.restaurant.order.dto.*;
import com.restaurant.order.enums.OrderStatus;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    PageResponse<OrderResponse> getOrders(OrderStatus status, Long tableId, Pageable pageable);
    OrderResponse getOrderById(Long id);
    OrderResponse createOrder(OrderCreateRequest request);
    OrderResponse updateOrder(Long id, OrderUpdateRequest request);
    OrderResponse addItems(Long id, AddItemsRequest request);
    OrderResponse completeOrder(Long id);
    OrderResponse payOrder(Long id, Long cashierId);
    OrderResponse cancelOrder(Long id);
    void deleteOrder(Long id);
    InvoiceResponse generateInvoice(Long id);
}
