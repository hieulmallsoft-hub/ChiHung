package com.sportshop.dto.order;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class SpendingStatsResponse {
    private BigDecimal totalSpent;
    private long totalOrders;
    private List<String> recentProducts;
}
