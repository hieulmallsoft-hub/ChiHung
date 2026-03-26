package com.sportshop.mapper;

import com.sportshop.dto.cart.CartItemResponse;
import com.sportshop.dto.cart.CartResponse;
import com.sportshop.entity.Cart;
import com.sportshop.entity.CartItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class CartMapper {

    public CartItemResponse toItemResponse(CartItem item) {
        BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .thumbnailUrl(item.getProduct().getThumbnailUrl())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(lineTotal)
                .build();
    }

    public CartResponse toCartResponse(Cart cart,
                                       List<CartItemResponse> items,
                                       BigDecimal subtotal,
                                       BigDecimal discount,
                                       BigDecimal shippingFee,
                                       BigDecimal total,
                                       String couponCode) {
        return CartResponse.builder()
                .cartId(cart.getId())
                .items(items)
                .subtotal(subtotal)
                .discount(discount)
                .shippingFee(shippingFee)
                .total(total)
                .couponCode(couponCode)
                .build();
    }
}
