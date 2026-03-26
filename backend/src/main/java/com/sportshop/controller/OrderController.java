package com.sportshop.controller;

import com.sportshop.dto.common.ApiResponse;
import com.sportshop.dto.order.CheckoutRequest;
import com.sportshop.dto.order.OrderResponse;
import com.sportshop.dto.order.SpendingStatsResponse;
import com.sportshop.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(Authentication authentication,
                                                               @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Checkout success", orderService.checkout(authentication.getName(), request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(Authentication authentication,
                                                                        @RequestParam(defaultValue = "0") int page,
                                                                        @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("My orders", orderService.getMyOrders(authentication.getName(), page, size)));
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getMyOrder(Authentication authentication,
                                                                 @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Order detail", orderService.getMyOrderDetail(authentication.getName(), id)));
    }

    @PostMapping("/me/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(Authentication authentication,
                                                         @PathVariable UUID id) {
        orderService.cancelMyOrder(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled", null));
    }

    @GetMapping("/me/stats")
    public ResponseEntity<ApiResponse<SpendingStatsResponse>> spendingStats(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Spending statistics", orderService.getMySpendingStats(authentication.getName())));
    }
}
