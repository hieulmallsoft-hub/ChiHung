package com.sportshop.controller.admin;

import com.sportshop.dto.common.ApiResponse;
import com.sportshop.dto.order.OrderResponse;
import com.sportshop.dto.order.PaymentUpdateRequest;
import com.sportshop.dto.order.UpdateOrderStatusRequest;
import com.sportshop.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getOrders(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success("Order list", orderService.getOrders(keyword, status, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> detail(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Order detail", orderService.getOrderDetail(id)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(@PathVariable UUID id,
                                                                   @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Order status updated", orderService.updateStatus(id, request)));
    }

    @PutMapping("/{id}/payment")
    public ResponseEntity<ApiResponse<OrderResponse>> updatePayment(@PathVariable UUID id,
                                                                    @Valid @RequestBody PaymentUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Payment updated", orderService.updatePayment(id, request)));
    }
}
