package com.restaurant.order.controller;

import com.restaurant.order.dto.*;
import com.restaurant.order.enums.OrderStatus;
import com.restaurant.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) Long tableId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderTime") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<OrderResponse> response = orderService.getOrders(status, tableId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response, "Fetched orders successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Order found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderCreateRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Order created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrder(
            @PathVariable Long id,
            @Valid @RequestBody OrderUpdateRequest request) {
        OrderResponse response = orderService.updateOrder(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Order updated successfully"));
    }

    @PostMapping("/{id}/add-items")
    public ResponseEntity<ApiResponse<OrderResponse>> addItems(
            @PathVariable Long id,
            @Valid @RequestBody AddItemsRequest request) {
        OrderResponse response = orderService.addItems(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Items added to order"));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<OrderResponse>> completeOrder(@PathVariable Long id) {
        OrderResponse response = orderService.completeOrder(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Order marked as SERVED"));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<OrderResponse>> payOrder(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String cashierIdHeader) {
        Long cashierId = cashierIdHeader != null ? Long.parseLong(cashierIdHeader) : 1L;
        OrderResponse response = orderService.payOrder(id, cashierId);
        return ResponseEntity.ok(ApiResponse.ok(response, "Order paid successfully"));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long id) {
        OrderResponse response = orderService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Order cancelled"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.ok("Order deleted"));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoice(@PathVariable Long id) {
        InvoiceResponse response = orderService.generateInvoice(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Invoice generated"));
    }

    @PutMapping("/{orderId}/items/{itemId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateItemStatus(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @Valid @RequestBody ItemStatusUpdateRequest request) {
        OrderResponse response = orderService.updateItemStatus(orderId, itemId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok(response, "Cập nhật trạng thái món thành công"));
    }

    @PutMapping("/{orderId}/items/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateAllItemsStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody ItemStatusUpdateRequest request) {
        OrderResponse response = orderService.updateAllItemsStatus(orderId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok(response, "Cập nhật trạng thái toàn bộ món thành công"));
    }
}
