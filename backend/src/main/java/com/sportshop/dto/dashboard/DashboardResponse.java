package com.sportshop.dto.dashboard;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class DashboardResponse {
    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private List<RecentOrder> recentOrders;
    private List<TopProduct> topProducts;
    private List<RevenuePoint> revenueByDay;
    private List<StatusPoint> orderStatusStats;

    @Getter
    @Builder
    public static class RecentOrder {
        private String orderCode;
        private String customerName;
        private BigDecimal finalTotal;
        private String status;
    }

    @Getter
    @Builder
    public static class TopProduct {
        private String productName;
        private long sold;
    }

    @Getter
    @Builder
    public static class RevenuePoint {
        private String label;
        private BigDecimal revenue;
    }

    @Getter
    @Builder
    public static class StatusPoint {
        private String status;
        private long total;
    }
}
