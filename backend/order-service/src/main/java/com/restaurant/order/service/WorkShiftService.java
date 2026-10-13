package com.restaurant.order.service;

import com.restaurant.order.dto.*;
import com.restaurant.order.entity.SaleOrder;
import com.restaurant.order.entity.WorkShift;
import com.restaurant.order.enums.OrderStatus;
import com.restaurant.order.repository.SaleOrderRepository;
import com.restaurant.order.repository.WorkShiftRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkShiftService {

    private final WorkShiftRepository shiftRepository;
    private final SaleOrderRepository orderRepository;

    /** Lấy ca đang mở (nếu có) */
    public WorkShiftDto getCurrentShift() {
        return shiftRepository.findFirstByStatusOrderByStartTimeDesc("OPEN")
                .map(this::toDto)
                .orElse(null);
    }

    /** Lấy toàn bộ lịch sử (mới nhất trước) */
    public List<WorkShiftDto> getAllShifts() {
        return shiftRepository.findAllByOrderByStartTimeDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    /** Lấy chi tiết 1 ca + danh sách đơn hàng trong ca */
    public ShiftDetailDto getShiftDetail(Long shiftId) {
        WorkShift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new IllegalArgumentException("Shift not found: " + shiftId));

        // Query orders within shift time window
        LocalDateTime to = shift.getEndTime() != null ? shift.getEndTime() : LocalDateTime.now();
        List<SaleOrder> orders = orderRepository.findByOrderTimeBetweenAndStatus(
                shift.getStartTime(), to, OrderStatus.PAID);

        List<ShiftOrderSummary> orderSummaries = orders.stream().map(o -> ShiftOrderSummary.builder()
                .orderId(o.getId())
                .tableNumber(o.getCustomerName() != null ? o.getCustomerName() : "Bàn #" + o.getTableId())
                .customerName(o.getCustomerName())
                .totalAmount(o.getTotalAmount())
                .paidAt(o.getUpdatedAt())
                .source(o.getSource() != null ? o.getSource().name() : "INTERNAL")
                .build()).collect(Collectors.toList());

        return ShiftDetailDto.builder()
                .shift(toDto(shift))
                .orders(orderSummaries)
                .build();
    }

    /** Mở ca mới – chỉ được 1 ca OPEN cùng lúc */
    @Transactional
    public WorkShiftDto openShift(OpenShiftRequest req, String requesterName) {
        if (shiftRepository.existsByStatus("OPEN")) {
            throw new IllegalStateException("Đã có ca làm việc đang mở. Vui lòng chốt két ca hiện tại trước.");
        }

        String code = "CA-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd-HHmm"));
        WorkShift shift = WorkShift.builder()
                .shiftCode(code)
                .cashierName(req.getCashierName() != null ? req.getCashierName() : requesterName)
                .cashierId(req.getCashierId())
                .startTime(LocalDateTime.now())
                .status("OPEN")
                .openingCash(req.getOpeningCash() != null ? req.getOpeningCash() : BigDecimal.ZERO)
                .expectedCash(req.getOpeningCash() != null ? req.getOpeningCash() : BigDecimal.ZERO)
                .build();

        return toDto(shiftRepository.save(shift));
    }

    /** Cập nhật doanh thu ca khi có đơn được thanh toán (gọi từ payOrder) */
    @Transactional
    public void recordSale(BigDecimal amount, boolean isCash) {
        shiftRepository.findFirstByStatusOrderByStartTimeDesc("OPEN").ifPresent(shift -> {
            if (isCash) {
                shift.setCashSales(shift.getCashSales().add(amount));
                shift.setExpectedCash(shift.getExpectedCash().add(amount));
            } else {
                shift.setCardSales(shift.getCardSales().add(amount));
            }
            shift.setTotalSales(shift.getTotalSales().add(amount));
            shift.setOrderCount(shift.getOrderCount() + 1);
            shiftRepository.save(shift);
        });
    }

    /** Chốt két và đóng ca */
    @Transactional
    public WorkShiftDto closeShift(CloseShiftRequest req) {
        WorkShift shift = shiftRepository.findFirstByStatusOrderByStartTimeDesc("OPEN")
                .orElseThrow(() -> new IllegalStateException("Không có ca nào đang mở để chốt két."));

        BigDecimal actual = req.getActualCash() != null ? req.getActualCash() : shift.getExpectedCash();
        shift.setActualCash(actual);
        shift.setDifference(actual.subtract(shift.getExpectedCash()));
        shift.setEndTime(LocalDateTime.now());
        shift.setStatus("CLOSED");
        shift.setHandoverNote(req.getHandoverNote());

        return toDto(shiftRepository.save(shift));
    }

    /** ADMIN: Xem danh sách ca theo cashier */
    public List<WorkShiftDto> getShiftsByCashier(Long cashierId) {
        return shiftRepository.findByCashierIdOrderByStartTimeDesc(cashierId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private WorkShiftDto toDto(WorkShift s) {
        return WorkShiftDto.builder()
                .id(s.getId())
                .shiftCode(s.getShiftCode())
                .cashierName(s.getCashierName())
                .cashierId(s.getCashierId())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .status(s.getStatus())
                .openingCash(s.getOpeningCash())
                .cashSales(s.getCashSales())
                .cardSales(s.getCardSales())
                .totalSales(s.getTotalSales())
                .orderCount(s.getOrderCount())
                .expectedCash(s.getExpectedCash())
                .actualCash(s.getActualCash())
                .difference(s.getDifference())
                .handoverNote(s.getHandoverNote())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
