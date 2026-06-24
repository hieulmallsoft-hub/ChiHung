package com.sportshop.mapper;

import com.sportshop.dto.order.OrderItemResponse;
import com.sportshop.dto.order.OrderResponse;
import com.sportshop.dto.order.OrderStatusHistoryResponse;
import com.sportshop.entity.Order;
import com.sportshop.entity.OrderItem;
import com.sportshop.repository.OrderStatusHistoryRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderMapper {

    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    public OrderMapper(OrderStatusHistoryRepository orderStatusHistoryRepository) {
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
    }

    public OrderResponse toResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream()
                .map(this::toItemResponse)
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .shippingAddress(order.getShippingAddress())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .subtotal(order.getSubtotal())
                .shippingFee(order.getShippingFee())
                .discountAmount(order.getDiscountAmount())
                .finalTotal(order.getFinalTotal())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .statusHistory(orderStatusHistoryRepository.findByOrderOrderByCreatedAtAsc(order).stream()
                        .map(history -> OrderStatusHistoryResponse.builder()
                                .status(history.getStatus())
                                .changedBy(history.getChangedBy())
                                .note(history.getNote())
                                .createdAt(history.getCreatedAt())
                                .build())
                        .toList())
                .build();
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .productId(item.getProduct().getId())
                .productName(item.getProductName())
                .sku(item.getSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getLineTotal())
                .build();
    }
}
