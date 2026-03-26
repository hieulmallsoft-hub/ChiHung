package com.sportshop.dto.order;

import com.sportshop.enums.OrderStatus;
import com.sportshop.enums.PaymentMethod;
import com.sportshop.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class OrderResponse {
    private UUID id;
    private String orderCode;
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal finalTotal;
    private String note;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
