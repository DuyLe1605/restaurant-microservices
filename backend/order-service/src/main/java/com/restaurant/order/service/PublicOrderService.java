package com.restaurant.order.service;

import com.restaurant.order.dto.OrderResponse;
import com.restaurant.order.dto.PublicOrderStartResponse;
import com.restaurant.order.dto.PublicOrderSubmitRequest;

public interface PublicOrderService {
    PublicOrderStartResponse startOrderByToken(String token);
    OrderResponse submitPublicOrder(PublicOrderSubmitRequest request);
}
