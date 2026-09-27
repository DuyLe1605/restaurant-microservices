package com.restaurant.order.config;

import com.restaurant.order.entity.Expense;
import com.restaurant.order.entity.SaleOrder;
import com.restaurant.order.entity.SaleOrderDetail;
import com.restaurant.order.enums.OrderDetailStatus;
import com.restaurant.order.enums.OrderSource;
import com.restaurant.order.enums.OrderStatus;
import com.restaurant.order.repository.ExpenseRepository;
import com.restaurant.order.repository.SaleOrderDetailRepository;
import com.restaurant.order.repository.SaleOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final SaleOrderRepository orderRepository;
    private final SaleOrderDetailRepository orderDetailRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    public void run(String... args) {
        if (orderRepository.count() == 0) {
            log.info("Seeding initial orders and operational expenses for order-service...");

            // Order 1: OPEN at Table 2
            SaleOrder o1 = SaleOrder.builder()
                    .tableId(2L)
                    .waiterId(3L)
                    .orderTime(LocalDateTime.now().minusMinutes(30))
                    .status(OrderStatus.OPEN)
                    .subtotal(new BigDecimal("1210000"))
                    .vatRate(new BigDecimal("8.00"))
                    .discount(BigDecimal.ZERO)
                    .totalAmount(new BigDecimal("1306800"))
                    .source(OrderSource.INTERNAL)
                    .customerName("Anh Nam")
                    .customerPhone("0912345678")
                    .build();
            orderRepository.save(o1);

            SaleOrderDetail d1 = SaleOrderDetail.builder().saleOrderId(o1.getId()).menuId(1L).menuName("Bò Wagyu A5 Nướng Sốt Nấm Truffle").qty(1).price(new BigDecimal("850000")).status(OrderDetailStatus.ORDERED).build();
            SaleOrderDetail d2 = SaleOrderDetail.builder().saleOrderId(o1.getId()).menuId(3L).menuName("Cá Hồi Na Uy Áp Chảo Sốt Bơ Chanh").qty(1).price(new BigDecimal("360000")).status(OrderDetailStatus.ORDERED).build();
            orderDetailRepository.saveAll(List.of(d1, d2));

            // Order 2: SERVED at Table 3
            SaleOrder o2 = SaleOrder.builder()
                    .tableId(3L)
                    .waiterId(3L)
                    .orderTime(LocalDateTime.now().minusHours(1))
                    .status(OrderStatus.SERVED)
                    .subtotal(new BigDecimal("2340000"))
                    .vatRate(new BigDecimal("8.00"))
                    .discount(new BigDecimal("100000"))
                    .totalAmount(new BigDecimal("2427200"))
                    .source(OrderSource.INTERNAL)
                    .build();
            orderRepository.save(o2);

            SaleOrderDetail d3 = SaleOrderDetail.builder().saleOrderId(o2.getId()).menuId(2L).menuName("Cua Hoàng Đế Hấp Rượu Vang Trắng").qty(1).price(new BigDecimal("1850000")).status(OrderDetailStatus.SERVED).build();
            SaleOrderDetail d4 = SaleOrderDetail.builder().saleOrderId(o2.getId()).menuId(4L).menuName("Súp Bào Ngư Vi Cá Hoàng Gia").qty(1).price(new BigDecimal("490000")).status(OrderDetailStatus.SERVED).build();
            orderDetailRepository.saveAll(List.of(d3, d4));

            // Order 3: PAID at VIP-02
            SaleOrder o3 = SaleOrder.builder()
                    .tableId(8L)
                    .waiterId(3L)
                    .cashierId(5L)
                    .orderTime(LocalDateTime.now().minusHours(3))
                    .status(OrderStatus.PAID)
                    .subtotal(new BigDecimal("5400000"))
                    .vatRate(new BigDecimal("8.00"))
                    .discount(new BigDecimal("200000"))
                    .totalAmount(new BigDecimal("5632000"))
                    .source(OrderSource.INTERNAL)
                    .build();
            orderRepository.save(o3);

            SaleOrderDetail d5 = SaleOrderDetail.builder().saleOrderId(o3.getId()).menuId(1L).menuName("Bò Wagyu A5 Nướng Sốt Nấm Truffle").qty(2).price(new BigDecimal("850000")).status(OrderDetailStatus.SERVED).build();
            SaleOrderDetail d6 = SaleOrderDetail.builder().saleOrderId(o3.getId()).menuId(6L).menuName("Rượu Vang Chateau Margaux 2018").qty(1).price(new BigDecimal("3200000")).status(OrderDetailStatus.SERVED).build();
            SaleOrderDetail d7 = SaleOrderDetail.builder().saleOrderId(o3.getId()).menuId(4L).menuName("Súp Bào Ngư Vi Cá Hoàng Gia").qty(1).price(new BigDecimal("490000")).status(OrderDetailStatus.SERVED).build();
            orderDetailRepository.saveAll(List.of(d5, d6, d7));

            // Operational Expenses
            Expense e1 = Expense.builder().expenseType("Tiền điện kinh doanh tháng 9").amount(new BigDecimal("8200000")).expenseDate(LocalDate.now().minusDays(3)).description("Hóa đơn điện EVN chi nhánh Quận 1").createdBy(1L).build();
            Expense e2 = Expense.builder().expenseType("Thuê mặt bằng nhà hàng").amount(new BigDecimal("35000000")).expenseDate(LocalDate.now().withDayOfMonth(1)).description("Thanh toán tiền thuê mặt bằng tháng 9").createdBy(1L).build();
            Expense e3 = Expense.builder().expenseType("Bảo trì hệ thống hút khói bếp").amount(new BigDecimal("2500000")).expenseDate(LocalDate.now().minusDays(5)).description("Vệ sinh và thay lưới lọc hệ thống hút mùi công nghiệp").createdBy(1L).build();
            expenseRepository.saveAll(List.of(e1, e2, e3));

            log.info("Seeded 3 orders, 7 order details, and 3 operational expenses successfully!");
        }
    }
}
