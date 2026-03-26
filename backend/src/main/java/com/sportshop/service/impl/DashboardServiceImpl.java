package com.sportshop.service.impl;

import com.sportshop.dto.dashboard.DashboardResponse;
import com.sportshop.entity.Order;
import com.sportshop.enums.OrderStatus;
import com.sportshop.repository.OrderItemRepository;
import com.sportshop.repository.OrderRepository;
import com.sportshop.repository.ProductRepository;
import com.sportshop.repository.UserRepository;
import com.sportshop.service.DashboardService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public DashboardServiceImpl(UserRepository userRepository,
                                ProductRepository productRepository,
                                OrderRepository orderRepository,
                                OrderItemRepository orderItemRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Override
    public DashboardResponse getSummary() {
        long totalUsers = userRepository.countByDeletedFalse();
        long totalProducts = productRepository.countByDeletedFalse();
        long totalOrders = orderRepository.count();

        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getFinalTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<DashboardResponse.RecentOrder> recentOrders = orderRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(order -> DashboardResponse.RecentOrder.builder()
                        .orderCode(order.getOrderCode())
                        .customerName(order.getUser().getFullName())
                        .finalTotal(order.getFinalTotal())
                        .status(order.getStatus().name())
                        .build())
                .toList();

        List<DashboardResponse.TopProduct> topProducts = new ArrayList<>();
        var rawTopProducts = orderItemRepository.findTopSellingProductQuantities();
        for (int i = 0; i < Math.min(rawTopProducts.size(), 5); i++) {
            Object[] row = rawTopProducts.get(i);
            UUID productId = (UUID) row[0];
            long sold = ((Number) row[1]).longValue();
            String productName = productRepository.findById(productId).map(p -> p.getName()).orElse("Unknown");
            topProducts.add(DashboardResponse.TopProduct.builder()
                    .productName(productName)
                    .sold(sold)
                    .build());
        }

        List<DashboardResponse.RevenuePoint> revenueByDay = new ArrayList<>();
        for (int dayOffset = 6; dayOffset >= 0; dayOffset--) {
            LocalDate date = LocalDate.now().minusDays(dayOffset);
            LocalDateTime from = date.atStartOfDay();
            LocalDateTime to = date.plusDays(1).atStartOfDay();

            BigDecimal revenue = orderRepository.findAll().stream()
                    .filter(o -> !o.getCreatedAt().isBefore(from) && o.getCreatedAt().isBefore(to))
                    .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                    .map(Order::getFinalTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            revenueByDay.add(DashboardResponse.RevenuePoint.builder()
                    .label(date.toString())
                    .revenue(revenue)
                    .build());
        }

        List<DashboardResponse.StatusPoint> statusPoints = Arrays.stream(OrderStatus.values())
                .map(status -> DashboardResponse.StatusPoint.builder()
                        .status(status.name())
                        .total(orderRepository.countByStatus(status))
                        .build())
                .toList();

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .recentOrders(recentOrders)
                .topProducts(topProducts)
                .revenueByDay(revenueByDay)
                .orderStatusStats(statusPoints)
                .build();
    }
}
