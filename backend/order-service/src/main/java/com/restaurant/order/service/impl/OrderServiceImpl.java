package com.restaurant.order.service.impl;

import com.restaurant.order.client.*;
import com.restaurant.order.constant.OrderConstants;
import com.restaurant.order.dto.*;
import com.restaurant.order.entity.SaleOrder;
import com.restaurant.order.entity.SaleOrderDetail;
import com.restaurant.order.enums.OrderDetailStatus;
import com.restaurant.order.enums.OrderStatus;
import com.restaurant.order.exception.BadRequestException;
import com.restaurant.order.exception.ResourceNotFoundException;
import com.restaurant.order.messaging.OrderEventPublisher;
import com.restaurant.order.repository.SaleOrderDetailRepository;
import com.restaurant.order.repository.SaleOrderRepository;
import com.restaurant.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final SaleOrderRepository orderRepository;
    private final SaleOrderDetailRepository detailRepository;
    private final TableClient tableClient;
    private final MenuClient menuClient;
    private final OrderEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrders(OrderStatus status, Long tableId, Pageable pageable) {
        Page<SaleOrder> page = orderRepository.searchOrders(status, tableId, pageable);
        List<OrderResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<OrderResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        SaleOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(OrderConstants.MSG_ORDER_NOT_FOUND + id));
        return mapToResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request) {
        String tableNumber = null;
        if (request.getTableId() != null) {
            try {
                ApiResponse<TableDto> tableResp = tableClient.getTableById(request.getTableId());
                if (tableResp != null && tableResp.getData() != null) {
                    TableDto table = tableResp.getData();
                    tableNumber = table.getNumber();
                    if (!"FREE".equalsIgnoreCase(table.getStatus())) {
                        throw new BadRequestException(OrderConstants.MSG_TABLE_NOT_FREE);
                    }
                }
            } catch (Exception e) {
                log.warn("Table verification warning: {}", e.getMessage());
            }
        }

        // Fetch prices from menu-service and build details
        List<SaleOrderDetail> detailsToSave = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            String menuName = "Menu item #" + itemReq.getMenuId();
            BigDecimal price = BigDecimal.ZERO;

            try {
                ApiResponse<MenuItemDto> menuResp = menuClient.getMenuItemById(itemReq.getMenuId());
                if (menuResp != null && menuResp.getData() != null) {
                    menuName = menuResp.getData().getName();
                    price = menuResp.getData().getPrice();
                }
            } catch (Exception e) {
                log.warn("Menu item fetch warning: {}", e.getMessage());
            }

            BigDecimal itemSubtotal = price.multiply(BigDecimal.valueOf(itemReq.getQty()));
            subtotal = subtotal.add(itemSubtotal);

            detailsToSave.add(SaleOrderDetail.builder()
                    .menuId(itemReq.getMenuId())
                    .menuName(menuName)
                    .qty(itemReq.getQty())
                    .price(price)
                    .status(OrderDetailStatus.ORDERED)
                    .note(itemReq.getNote())
                    .build());
        }

        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal vatRate = request.getVatRate() != null ? request.getVatRate() : BigDecimal.ZERO;

        BigDecimal taxableAmount = subtotal.subtract(discount).max(BigDecimal.ZERO);
        BigDecimal vatAmount = taxableAmount.multiply(vatRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = taxableAmount.add(vatAmount);

        SaleOrder order = SaleOrder.builder()
                .tableId(request.getTableId())
                .waiterId(request.getWaiterId())
                .orderTime(LocalDateTime.now())
                .status(OrderStatus.OPEN)
                .subtotal(subtotal)
                .discount(discount)
                .vatRate(vatRate)
                .totalAmount(totalAmount)
                .source(request.getSource())
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .note(request.getNote())
                .build();

        SaleOrder savedOrder = orderRepository.save(order);

        for (SaleOrderDetail d : detailsToSave) {
            d.setSaleOrderId(savedOrder.getId());
        }
        detailRepository.saveAll(detailsToSave);

        // Update table to OCCUPIED (Fail-fast with transactional rollback to prevent orphan orders)
        if (request.getTableId() != null) {
            try {
                ApiResponse<TableDto> tableResp = tableClient.updateTableStatus(request.getTableId(), TableStatusDto.builder().status("OCCUPIED").build());
                if (tableResp == null || tableResp.getData() == null) {
                    throw new ConflictException("Không thể chiếm bàn #" + request.getTableId() + ": Dịch vụ bàn không phản hồi hợp lệ");
                }
            } catch (ConflictException ce) {
                throw ce;
            } catch (Exception e) {
                log.error("Failed to set table occupied: {}", e.getMessage());
                throw new ConflictException("Không thể chiếm bàn #" + request.getTableId() + ": " + e.getMessage() + ". Đơn hàng đã được tự động hoàn tác để đảm bảo toàn vẹn dữ liệu.");
            }
        }

        // Publish event
        eventPublisher.publishOrderCreated(savedOrder.getId());

        return mapToResponse(savedOrder);
    }

    @Override
    @Transactional
    public OrderResponse updateOrder(Long id, OrderUpdateRequest request) {
        SaleOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(OrderConstants.MSG_ORDER_NOT_FOUND + id));

        if (order.getStatus() != OrderStatus.OPEN) {
            throw new BadRequestException(OrderConstants.MSG_ORDER_NOT_OPEN);
        }

        if (request.getTableId() != null) order.setTableId(request.getTableId());
        if (request.getWaiterId() != null) order.setWaiterId(request.getWaiterId());
        if (request.getCustomerName() != null) order.setCustomerName(request.getCustomerName());
        if (request.getCustomerPhone() != null) order.setCustomerPhone(request.getCustomerPhone());
        if (request.getNote() != null) order.setNote(request.getNote());

        if (request.getDiscount() != null) order.setDiscount(request.getDiscount());
        if (request.getVatRate() != null) order.setVatRate(request.getVatRate());

        recalculateOrder(order);
        SaleOrder updated = orderRepository.save(order);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public OrderResponse addItems(Long id, AddItemsRequest request) {
        SaleOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(OrderConstants.MSG_ORDER_NOT_FOUND + id));

        if (order.getStatus() != OrderStatus.OPEN) {
            throw new BadRequestException(OrderConstants.MSG_ORDER_NOT_OPEN);
        }

        List<SaleOrderDetail> newDetails = new ArrayList<>();
        for (OrderItemRequest itemReq : request.getItems()) {
            String menuName = "Menu item #" + itemReq.getMenuId();
            BigDecimal price = BigDecimal.ZERO;

            try {
                ApiResponse<MenuItemDto> menuResp = menuClient.getMenuItemById(itemReq.getMenuId());
                if (menuResp != null && menuResp.getData() != null) {
                    menuName = menuResp.getData().getName();
                    price = menuResp.getData().getPrice();
                }
            } catch (Exception e) {
                log.warn("Menu item fetch warning: {}", e.getMessage());
            }

            newDetails.add(SaleOrderDetail.builder()
                    .saleOrderId(order.getId())
                    .menuId(itemReq.getMenuId())
                    .menuName(menuName)
                    .qty(itemReq.getQty())
                    .price(price)
                    .status(OrderDetailStatus.ORDERED)
                    .note(itemReq.getNote())
                    .build());
        }

        detailRepository.saveAll(newDetails);
        recalculateOrder(order);
        orderRepository.save(order);

        return mapToResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse completeOrder(Long id) {
        SaleOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(OrderConstants.MSG_ORDER_NOT_FOUND + id));

        if (order.getStatus() != OrderStatus.OPEN) {
            throw new BadRequestException(OrderConstants.MSG_ORDER_CANNOT_COMPLETE);
        }

        order.setStatus(OrderStatus.SERVED);
        SaleOrder updated = orderRepository.save(order);

        // Publish order.completed to deduct inventory
        List<SaleOrderDetail> details = detailRepository.findBySaleOrderId(id);
        List<OrderItemEventDto> items = details.stream()
                .map(d -> OrderItemEventDto.builder().menuId(d.getMenuId()).qty(d.getQty()).build())
                .toList();
        eventPublisher.publishOrderCompleted(OrderCompletedEventDto.builder().orderId(id).items(items).build());

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public OrderResponse payOrder(Long id, Long cashierId) {
        SaleOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(OrderConstants.MSG_ORDER_NOT_FOUND + id));

        if (order.getStatus() != OrderStatus.OPEN && order.getStatus() != OrderStatus.SERVED) {
            throw new BadRequestException(OrderConstants.MSG_ORDER_CANNOT_PAY);
        }

        // If paid directly from OPEN, deduct inventory
        if (order.getStatus() == OrderStatus.OPEN) {
            List<SaleOrderDetail> details = detailRepository.findBySaleOrderId(id);
            List<OrderItemEventDto> items = details.stream()
                    .map(d -> OrderItemEventDto.builder().menuId(d.getMenuId()).qty(d.getQty()).build())
                    .toList();
            eventPublisher.publishOrderCompleted(OrderCompletedEventDto.builder().orderId(id).items(items).build());
        }

        order.setStatus(OrderStatus.PAID);
        order.setCashierId(cashierId);
        SaleOrder updated = orderRepository.save(order);

        // Release table to FREE
        if (order.getTableId() != null) {
            try {
                tableClient.updateTableStatus(order.getTableId(), TableStatusDto.builder().status("FREE").build());
            } catch (Exception e) {
                log.error("Failed to free table: {}", e.getMessage());
            }
        }

        // Publish order.paid for reporting
        String tableNumber = "Takeaway";
        if (order.getTableId() != null) {
            try {
                ApiResponse<TableDto> tableResp = tableClient.getTableById(order.getTableId());
                if (tableResp != null && tableResp.getData() != null) {
                    tableNumber = tableResp.getData().getNumber();
                }
            } catch (Exception ignored) {}
        }

        eventPublisher.publishOrderPaid(OrderPaidEventDto.builder()
                .orderId(updated.getId())
                .orderDate(LocalDate.now())
                .totalAmount(updated.getTotalAmount())
                .status(updated.getStatus().name())
                .tableNumber(tableNumber)
                .cashierName("Cashier #" + (cashierId != null ? cashierId : "System"))
                .source(updated.getSource().name())
                .build());

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long id) {
        SaleOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(OrderConstants.MSG_ORDER_NOT_FOUND + id));

        if (order.getStatus() != OrderStatus.OPEN) {
            throw new BadRequestException(OrderConstants.MSG_ORDER_CANNOT_CANCEL);
        }

        order.setStatus(OrderStatus.CANCEL);
        SaleOrder updated = orderRepository.save(order);

        // Free table
        if (order.getTableId() != null) {
            try {
                tableClient.updateTableStatus(order.getTableId(), TableStatusDto.builder().status("FREE").build());
            } catch (Exception e) {
                log.error("Failed to free table on cancel: {}", e.getMessage());
            }
        }

        eventPublisher.publishOrderCancelled(id);

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        SaleOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(OrderConstants.MSG_ORDER_NOT_FOUND + id));

        if (order.getStatus() != OrderStatus.OPEN && order.getStatus() != OrderStatus.CANCEL) {
            throw new BadRequestException("Can only delete OPEN or CANCELLED orders");
        }

        detailRepository.deleteBySaleOrderId(id);
        orderRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse generateInvoice(Long id) {
        SaleOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(OrderConstants.MSG_ORDER_NOT_FOUND + id));

        List<SaleOrderDetail> details = detailRepository.findBySaleOrderId(id);
        List<OrderDetailResponse> items = details.stream().map(this::mapDetailToResponse).toList();

        String tableNumber = "Takeaway";
        if (order.getTableId() != null) {
            try {
                ApiResponse<TableDto> tableResp = tableClient.getTableById(order.getTableId());
                if (tableResp != null && tableResp.getData() != null) {
                    tableNumber = tableResp.getData().getNumber();
                }
            } catch (Exception ignored) {}
        }

        BigDecimal taxableAmount = order.getSubtotal().subtract(order.getDiscount()).max(BigDecimal.ZERO);
        BigDecimal vatAmount = taxableAmount.multiply(order.getVatRate()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        return InvoiceResponse.builder()
                .orderId(order.getId())
                .restaurantName("Restaurant Gourmet SOA")
                .restaurantAddress("123 Microservices Blvd")
                .tableNumber(tableNumber)
                .customerName(order.getCustomerName() != null ? order.getCustomerName() : "Walk-in Guest")
                .cashierName("Staff #" + (order.getCashierId() != null ? order.getCashierId() : "1"))
                .invoiceDate(LocalDateTime.now())
                .items(items)
                .subtotal(order.getSubtotal())
                .discount(order.getDiscount())
                .vatAmount(vatAmount)
                .totalAmount(order.getTotalAmount())
                .paymentStatus(order.getStatus().name())
                .build();
    }

    private void recalculateOrder(SaleOrder order) {
        List<SaleOrderDetail> details = detailRepository.findBySaleOrderId(order.getId());
        BigDecimal subtotal = BigDecimal.ZERO;
        for (SaleOrderDetail d : details) {
            subtotal = subtotal.add(d.getPrice().multiply(BigDecimal.valueOf(d.getQty())));
        }
        order.setSubtotal(subtotal);

        BigDecimal discount = order.getDiscount() != null ? order.getDiscount() : BigDecimal.ZERO;
        BigDecimal vatRate = order.getVatRate() != null ? order.getVatRate() : BigDecimal.ZERO;

        BigDecimal taxableAmount = subtotal.subtract(discount).max(BigDecimal.ZERO);
        BigDecimal vatAmount = taxableAmount.multiply(vatRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        order.setTotalAmount(taxableAmount.add(vatAmount));
    }

    private OrderResponse mapToResponse(SaleOrder order) {
        List<SaleOrderDetail> details = detailRepository.findBySaleOrderId(order.getId());
        List<OrderDetailResponse> itemResponses = details.stream().map(this::mapDetailToResponse).toList();

        String tableNumber = null;
        if (order.getTableId() != null) {
            try {
                ApiResponse<TableDto> tableResp = tableClient.getTableById(order.getTableId());
                if (tableResp != null && tableResp.getData() != null) {
                    tableNumber = tableResp.getData().getNumber();
                }
            } catch (Exception ignored) {}
        }

        return OrderResponse.builder()
                .id(order.getId())
                .tableId(order.getTableId())
                .tableNumber(tableNumber)
                .waiterId(order.getWaiterId())
                .cashierId(order.getCashierId())
                .orderTime(order.getOrderTime())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .discount(order.getDiscount())
                .vatRate(order.getVatRate())
                .totalAmount(order.getTotalAmount())
                .source(order.getSource())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .note(order.getNote())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderDetailResponse mapDetailToResponse(SaleOrderDetail d) {
        return OrderDetailResponse.builder()
                .id(d.getId())
                .saleOrderId(d.getSaleOrderId())
                .menuId(d.getMenuId())
                .menuName(d.getMenuName())
                .qty(d.getQty())
                .price(d.getPrice())
                .subtotal(d.getPrice().multiply(BigDecimal.valueOf(d.getQty())))
                .status(d.getStatus())
                .note(d.getNote())
                .build();
    }
}
