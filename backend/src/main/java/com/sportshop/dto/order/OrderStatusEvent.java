package com.sportshop.dto.order;

import com.sportshop.enums.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class OrderStatusEvent {
    private UUID orderId;
    private String orderCode;
    private OrderStatus status;
    private LocalDateTime updatedAt;
}
