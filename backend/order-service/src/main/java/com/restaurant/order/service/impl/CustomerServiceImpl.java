package com.restaurant.order.service.impl;

import com.restaurant.order.dto.CustomerRequest;
import com.restaurant.order.dto.CustomerResponse;
import com.restaurant.order.dto.PageResponse;
import com.restaurant.order.entity.Customer;
import com.restaurant.order.enums.CustomerTier;
import com.restaurant.order.exception.BadRequestException;
import com.restaurant.order.exception.ResourceNotFoundException;
import com.restaurant.order.repository.CustomerRepository;
import com.restaurant.order.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    @Override
    @Transactional
    public CustomerResponse registerOrGet(CustomerRequest request) {
        String phone = request.getPhone().trim();
        return customerRepository.findByPhone(phone)
                .map(this::mapToResponse)
                .orElseGet(() -> {
                    String currentMonth = LocalDate.now().format(MONTH_FORMATTER);
                    Customer customer = Customer.builder()
                            .name(request.getName().trim())
                            .phone(phone)
                            .email(request.getEmail() != null ? request.getEmail().trim() : null)
                            .tier(CustomerTier.BRONZE)
                            .points(0)
                            .totalSpent(BigDecimal.ZERO)
                            .currentMonthSpent(BigDecimal.ZERO)
                            .lastMonthCalculated(currentMonth)
                            .note(request.getNote())
                            .build();
                    Customer saved = customerRepository.save(customer);
                    log.info("Registered new customer #{} - {} ({})", saved.getId(), saved.getName(), saved.getPhone());
                    return mapToResponse(saved);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse lookupByPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new BadRequestException("Số điện thoại không được để trống");
        }
        Customer customer = customerRepository.findByPhone(phone.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với số điện thoại: " + phone));
        return mapToResponse(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng #" + id));
        return mapToResponse(customer);
    }

    @Override
    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng #" + id));

        customer.setName(request.getName().trim());
        if (request.getEmail() != null) customer.setEmail(request.getEmail().trim());
        if (request.getNote() != null) customer.setNote(request.getNote());

        Customer saved = customerRepository.save(customer);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> getAll(String keyword, Pageable pageable) {
        Page<Customer> page = customerRepository.searchCustomers(keyword, pageable);
        return PageResponse.<CustomerResponse>builder()
                .content(page.getContent().stream().map(this::mapToResponse).toList())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional
    public void processOrderPayment(String phone, BigDecimal orderTotal, Integer pointsRedeemed) {
        if (phone == null || phone.isBlank() || orderTotal == null || orderTotal.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        customerRepository.findByPhone(phone.trim()).ifPresent(customer -> {
            String currentMonth = LocalDate.now().format(MONTH_FORMATTER);

            // 1. Kiểm tra chu kỳ tháng: Nếu sang tháng mới, cập nhật lại currentMonthSpent
            if (customer.getLastMonthCalculated() == null || !customer.getLastMonthCalculated().equals(currentMonth)) {
                // Sang tháng mới: đánh giá lại hạng duy trì dựa trên tháng vừa qua hoặc reset tháng mới
                customer.setCurrentMonthSpent(BigDecimal.ZERO);
                customer.setLastMonthCalculated(currentMonth);
            }

            // 2. Cộng dồn chi tiêu tháng hiện tại và tổng chi tiêu toàn thời gian
            BigDecimal updatedMonthSpent = customer.getCurrentMonthSpent().add(orderTotal);
            customer.setCurrentMonthSpent(updatedMonthSpent);
            customer.setTotalSpent(customer.getTotalSpent().add(orderTotal));

            // 3. Đánh giá duy trì / nâng hạng thành viên dựa trên chi tiêu tháng này
            CustomerTier newTier = CustomerTier.evaluateTier(updatedMonthSpent);
            if (newTier != customer.getTier()) {
                log.info("Customer {} ({}) tier changed from {} to {}", customer.getName(), customer.getPhone(), customer.getTier(), newTier);
                customer.setTier(newTier);
            }

            // 4. Trừ điểm tích lũy nếu khách đã đổi điểm (1 điểm = 100 VNĐ)
            if (pointsRedeemed != null && pointsRedeemed > 0) {
                int currentPoints = customer.getPoints() != null ? customer.getPoints() : 0;
                int remainingPoints = Math.max(0, currentPoints - pointsRedeemed);
                customer.setPoints(remainingPoints);
                log.info("Customer {} redeemed {} points, remaining: {}", customer.getName(), pointsRedeemed, remainingPoints);
            }

            // 5. Tích lũy điểm mới: 10.000 VNĐ = 1 điểm * Hệ số hạng thẻ (Ví dụ: 1 triệu = 100đ * 1.5 = 150đ)
            BigDecimal basePoints = orderTotal.divide(BigDecimal.valueOf(10_000), 0, RoundingMode.FLOOR);
            BigDecimal earnedPoints = basePoints.multiply(customer.getTier().getPointMultiplier());
            int pointsToAdd = earnedPoints.intValue();

            customer.setPoints((customer.getPoints() != null ? customer.getPoints() : 0) + pointsToAdd);
            customerRepository.save(customer);

            log.info("Customer {} processed payment: +{} VNĐ, earned {} points (Tier: {})",
                    customer.getName(), orderTotal, pointsToAdd, customer.getTier().getLabel());
        });
    }

    private CustomerResponse mapToResponse(Customer c) {
        CustomerTier tier = c.getTier() != null ? c.getTier() : CustomerTier.BRONZE;
        int points = c.getPoints() != null ? c.getPoints() : 0;
        BigDecimal pointsValue = BigDecimal.valueOf(points).multiply(BigDecimal.valueOf(100)); // 1 điểm = 100 VNĐ

        // Tính mục tiêu thăng hạng tiếp theo
        BigDecimal nextTierTarget = null;
        String nextTierLabel = null;
        if (tier == CustomerTier.BRONZE) {
            nextTierTarget = CustomerTier.SILVER.getMonthlyTarget();
            nextTierLabel = CustomerTier.SILVER.getLabel();
        } else if (tier == CustomerTier.SILVER) {
            nextTierTarget = CustomerTier.GOLD.getMonthlyTarget();
            nextTierLabel = CustomerTier.GOLD.getLabel();
        } else if (tier == CustomerTier.GOLD) {
            nextTierTarget = CustomerTier.DIAMOND.getMonthlyTarget();
            nextTierLabel = CustomerTier.DIAMOND.getLabel();
        }

        return CustomerResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .phone(c.getPhone())
                .email(c.getEmail())
                .tier(tier)
                .tierLabel(tier.getLabel())
                .discountPercent(tier.getDiscountPercent())
                .pointMultiplier(tier.getPointMultiplier())
                .points(points)
                .pointsValue(pointsValue)
                .totalSpent(c.getTotalSpent() != null ? c.getTotalSpent() : BigDecimal.ZERO)
                .currentMonthSpent(c.getCurrentMonthSpent() != null ? c.getCurrentMonthSpent() : BigDecimal.ZERO)
                .nextTierTarget(nextTierTarget)
                .nextTierLabel(nextTierLabel)
                .note(c.getNote())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
