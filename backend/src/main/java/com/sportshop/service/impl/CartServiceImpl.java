package com.sportshop.service.impl;

import com.sportshop.dto.cart.AddCartItemRequest;
import com.sportshop.dto.cart.CartItemResponse;
import com.sportshop.dto.cart.CartResponse;
import com.sportshop.dto.cart.UpdateCartItemRequest;
import com.sportshop.entity.*;
import com.sportshop.enums.DiscountType;
import com.sportshop.enums.ProductStatus;
import com.sportshop.exception.BadRequestException;
import com.sportshop.exception.ResourceNotFoundException;
import com.sportshop.mapper.CartMapper;
import com.sportshop.repository.*;
import com.sportshop.service.CartService;
import com.sportshop.util.MoneyUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CartServiceImpl implements CartService {

    private static final BigDecimal DEFAULT_SHIPPING_FEE = BigDecimal.valueOf(30000);
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = BigDecimal.valueOf(1000000);

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CouponRepository couponRepository;
    private final CartMapper cartMapper;

    public CartServiceImpl(UserRepository userRepository,
                           ProductRepository productRepository,
                           CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           CouponRepository couponRepository,
                           CartMapper cartMapper) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.couponRepository = couponRepository;
        this.cartMapper = cartMapper;
    }

    @Override
    public CartResponse getMyCart(String email) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItem(String email, AddCartItemRequest request) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findByIdAndDeletedFalse(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStatus() != ProductStatus.ACTIVE || product.getStockQuantity() <= 0) {
            throw new BadRequestException("Product is out of stock");
        }

        CartItem item = cartItemRepository.findByCartAndProduct(cart, product).orElse(null);
        int newQty = request.getQuantity();
        if (item != null) {
            newQty = item.getQuantity() + request.getQuantity();
        }

        if (newQty > product.getStockQuantity()) {
            throw new BadRequestException("Requested quantity exceeds stock");
        }

        if (item == null) {
            item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
        }

        item.setQuantity(newQty);
        item.setUnitPrice(getEffectivePrice(product));
        cartItemRepository.save(item);

        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateItem(String email, UUID cartItemId, UpdateCartItemRequest request) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Invalid cart item");
        }

        if (request.getQuantity() > item.getProduct().getStockQuantity()) {
            throw new BadRequestException("Requested quantity exceeds stock");
        }

        item.setQuantity(request.getQuantity());
        item.setUnitPrice(getEffectivePrice(item.getProduct()));
        cartItemRepository.save(item);

        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeItem(String email, UUID cartItemId) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Invalid cart item");
        }

        cartItemRepository.delete(item);
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse applyCoupon(String email, String couponCode) {
        if (couponCode == null || couponCode.isBlank()) {
            throw new BadRequestException("Coupon code is required");
        }

        User user = getUser(email);
        Cart cart = getOrCreateCart(user);
        Coupon coupon = getValidCoupon(couponCode);

        if (cartItemRepository.findByCart(cart).isEmpty()) {
            throw new BadRequestException("Cannot apply coupon for empty cart");
        }

        cart.setAppliedCouponCode(coupon.getCode());
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse clearCoupon(String email) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);
        cart.setAppliedCouponCode(null);
        cartRepository.save(cart);
        return toResponse(cart);
    }

    public PricingResult calculateTotals(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCart(cart);

        BigDecimal subtotal = items.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingFee = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
                ? BigDecimal.ZERO : DEFAULT_SHIPPING_FEE;

        BigDecimal discount = BigDecimal.ZERO;
        Coupon coupon = null;
        if (cart.getAppliedCouponCode() != null && !cart.getAppliedCouponCode().isBlank()) {
            try {
                coupon = getValidCoupon(cart.getAppliedCouponCode());
                discount = calculateDiscount(coupon, subtotal);
            } catch (Exception ignored) {
                cart.setAppliedCouponCode(null);
                cartRepository.save(cart);
            }
        }

        BigDecimal total = subtotal.add(shippingFee).subtract(discount);
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }

        return new PricingResult(MoneyUtil.scale(subtotal), MoneyUtil.scale(shippingFee), MoneyUtil.scale(discount), MoneyUtil.scale(total), coupon);
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cartItemRepository.findByCart(cart)
                .stream()
                .map(cartMapper::toItemResponse)
                .toList();

        PricingResult result = calculateTotals(cart);

        return cartMapper.toCartResponse(
                cart,
                itemResponses,
                result.subtotal(),
                result.discount(),
                result.shippingFee(),
                result.total(),
                cart.getAppliedCouponCode()
        );
    }

    private Coupon getValidCoupon(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndActiveTrue(code)
                .orElseThrow(() -> new BadRequestException("Coupon not found"));

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartAt() != null && coupon.getStartAt().isAfter(now)) {
            throw new BadRequestException("Coupon is not active yet");
        }
        if (coupon.getEndAt() != null && coupon.getEndAt().isBefore(now)) {
            throw new BadRequestException("Coupon is expired");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() > 0
                && coupon.getUsageCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon reached usage limit");
        }

        return coupon;
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        if (coupon.getMinOrderValue() != null && subtotal.compareTo(coupon.getMinOrderValue()) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount = coupon.getDiscountType() == DiscountType.FIXED
                ? coupon.getDiscountValue()
                : subtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));

        if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
            discount = coupon.getMaxDiscount();
        }

        return discount;
    }

    private BigDecimal getEffectivePrice(Product product) {
        return product.getSalePrice() != null && product.getSalePrice().compareTo(BigDecimal.ZERO) > 0
                ? product.getSalePrice()
                : product.getPrice();
    }

    private Cart getOrCreateCart(User user) {
        List<Cart> carts = cartRepository.findByUserOrderByCreatedAtDesc(user);
        if (carts.isEmpty()) {
            Cart cart = new Cart();
            cart.setUser(user);
            return cartRepository.save(cart);
        }

        Cart primary = carts.get(0);
        if (carts.size() == 1) {
            return primary;
        }

        // Defensive cleanup for legacy duplicated carts in DB.
        for (int i = 1; i < carts.size(); i++) {
            Cart duplicate = carts.get(i);
            List<CartItem> duplicateItems = cartItemRepository.findByCart(duplicate);
            for (CartItem duplicateItem : duplicateItems) {
                CartItem existing = cartItemRepository.findByCartAndProduct(primary, duplicateItem.getProduct()).orElse(null);
                int stock = duplicateItem.getProduct().getStockQuantity();

                if (existing == null) {
                    int qty = Math.min(stock, duplicateItem.getQuantity());
                    if (qty <= 0) {
                        continue;
                    }

                    CartItem newItem = new CartItem();
                    newItem.setCart(primary);
                    newItem.setProduct(duplicateItem.getProduct());
                    newItem.setQuantity(qty);
                    newItem.setUnitPrice(duplicateItem.getUnitPrice());
                    cartItemRepository.save(newItem);
                } else {
                    int mergedQty = Math.min(stock, existing.getQuantity() + duplicateItem.getQuantity());
                    existing.setQuantity(Math.max(mergedQty, 0));
                    cartItemRepository.save(existing);
                }
            }

            if ((primary.getAppliedCouponCode() == null || primary.getAppliedCouponCode().isBlank())
                    && duplicate.getAppliedCouponCode() != null
                    && !duplicate.getAppliedCouponCode().isBlank()) {
                primary.setAppliedCouponCode(duplicate.getAppliedCouponCode());
            }

            cartItemRepository.deleteByCart(duplicate);
            cartRepository.delete(duplicate);
        }

        return cartRepository.save(primary);
    }

    private User getUser(String email) {
        return userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public record PricingResult(BigDecimal subtotal,
                                BigDecimal shippingFee,
                                BigDecimal discount,
                                BigDecimal total,
                                Coupon coupon) {
    }
}
