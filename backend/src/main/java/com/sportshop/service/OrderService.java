package com.sportshop.service;

import com.sportshop.dto.order.CheckoutRequest;
import com.sportshop.dto.order.OrderResponse;
import com.sportshop.dto.order.PaymentUpdateRequest;
import com.sportshop.dto.order.SpendingStatsResponse;
import com.sportshop.dto.order.UpdateOrderStatusRequest;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface OrderService {
    OrderResponse checkout(String email, CheckoutRequest request);

    Page<OrderResponse> getMyOrders(String email, int page, int size);

    OrderResponse getMyOrderDetail(String email, UUID orderId);

    void cancelMyOrder(String email, UUID orderId);

    Page<OrderResponse> getOrders(String keyword, String status, int page, int size);

    OrderResponse getOrderDetail(UUID id);

    OrderResponse updateStatus(UUID id, UpdateOrderStatusRequest request);

    OrderResponse updatePayment(UUID id, PaymentUpdateRequest request);

    SpendingStatsResponse getMySpendingStats(String email);
}
