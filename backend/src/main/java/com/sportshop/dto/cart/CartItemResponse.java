package com.sportshop.dto.cart;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class CartItemResponse {
    private UUID id;
    private UUID productId;
    private String productName;
    private String thumbnailUrl;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
