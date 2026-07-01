package com.sportshop.controller;

import com.sportshop.dto.cart.AddCartItemRequest;
import com.sportshop.dto.cart.CartResponse;
import com.sportshop.dto.cart.UpdateCartItemRequest;
import com.sportshop.dto.common.ApiResponse;
import com.sportshop.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getMyCart(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Chi tiết giỏ hàng", cartService.getMyCart(authentication.getName())));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(Authentication authentication,
                                                             @Valid @RequestBody AddCartItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã thêm sản phẩm vào giỏ", cartService.addItem(authentication.getName(), request)));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(Authentication authentication,
                                                                @PathVariable UUID id,
                                                                @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật sản phẩm trong giỏ", cartService.updateItem(authentication.getName(), id, request)));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(Authentication authentication,
                                                                @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Đã xóa sản phẩm khỏi giỏ", cartService.removeItem(authentication.getName(), id)));
    }

    @PostMapping("/coupon/{code}")
    public ResponseEntity<ApiResponse<CartResponse>> applyCoupon(Authentication authentication,
                                                                 @PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success("Đã áp dụng mã giảm giá", cartService.applyCoupon(authentication.getName(), code)));
    }

    @DeleteMapping("/coupon")
    public ResponseEntity<ApiResponse<CartResponse>> clearCoupon(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Đã bỏ mã giảm giá", cartService.clearCoupon(authentication.getName())));
    }
}
