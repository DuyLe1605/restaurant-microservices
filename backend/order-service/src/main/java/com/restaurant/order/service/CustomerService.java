package com.restaurant.order.service;

import com.restaurant.order.dto.CustomerRequest;
import com.restaurant.order.dto.CustomerResponse;
import com.restaurant.order.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface CustomerService {

    CustomerResponse registerOrGet(CustomerRequest request);

    CustomerResponse lookupByPhone(String phone);

    CustomerResponse getById(Long id);

    CustomerResponse update(Long id, CustomerRequest request);

    PageResponse<CustomerResponse> getAll(String keyword, Pageable pageable);

    void processOrderPayment(String phone, BigDecimal orderTotal, Integer pointsRedeemed);
}
