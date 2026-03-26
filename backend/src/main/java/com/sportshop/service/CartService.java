package com.sportshop.service;

import com.sportshop.dto.cart.AddCartItemRequest;
import com.sportshop.dto.cart.CartResponse;
import com.sportshop.dto.cart.UpdateCartItemRequest;

import java.util.UUID;

public interface CartService {
    CartResponse getMyCart(String email);

    CartResponse addItem(String email, AddCartItemRequest request);

    CartResponse updateItem(String email, UUID cartItemId, UpdateCartItemRequest request);

    CartResponse removeItem(String email, UUID cartItemId);

    CartResponse applyCoupon(String email, String couponCode);

    CartResponse clearCoupon(String email);
}
