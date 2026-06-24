package com.sportshop.dto.order;

import com.sportshop.enums.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class OrderStatusHistoryResponse {
    private OrderStatus status;
    private String changedBy;
    private String note;
    private LocalDateTime createdAt;
}
