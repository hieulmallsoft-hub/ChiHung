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
        return ResponseEntity.ok(ApiResponse.success("Cart detail", cartService.getMyCart(authentication.getName())));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(Authentication authentication,
                                                             @Valid @RequestBody AddCartItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Item added", cartService.addItem(authentication.getName(), request)));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(Authentication authentication,
                                                                @PathVariable UUID id,
                                                                @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Item updated", cartService.updateItem(authentication.getName(), id, request)));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(Authentication authentication,
                                                                @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Item removed", cartService.removeItem(authentication.getName(), id)));
    }

    @PostMapping("/coupon/{code}")
    public ResponseEntity<ApiResponse<CartResponse>> applyCoupon(Authentication authentication,
                                                                 @PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success("Coupon applied", cartService.applyCoupon(authentication.getName(), code)));
    }

    @DeleteMapping("/coupon")
    public ResponseEntity<ApiResponse<CartResponse>> clearCoupon(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Coupon removed", cartService.clearCoupon(authentication.getName())));
    }
}
