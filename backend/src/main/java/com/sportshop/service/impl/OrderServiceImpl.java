package com.sportshop.service.impl;

import com.sportshop.dto.order.CheckoutRequest;
import com.sportshop.dto.order.OrderResponse;
import com.sportshop.dto.order.OrderStatusEvent;
import com.sportshop.dto.order.PaymentUpdateRequest;
import com.sportshop.dto.order.SpendingStatsResponse;
import com.sportshop.dto.order.UpdateOrderStatusRequest;
import com.sportshop.entity.*;
import com.sportshop.enums.InventoryChangeType;
import com.sportshop.enums.OrderStatus;
import com.sportshop.enums.PaymentStatus;
import com.sportshop.enums.ProductStatus;
import com.sportshop.exception.BadRequestException;
import com.sportshop.exception.ResourceNotFoundException;
import com.sportshop.mapper.OrderMapper;
import com.sportshop.repository.*;
import com.sportshop.service.OrderService;
import com.sportshop.util.CodeGenerator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.UUID;
import java.math.BigDecimal;

@Service
public class OrderServiceImpl implements OrderService {

    private static final BigDecimal EXPRESS_SHIPPING_SURCHARGE = BigDecimal.valueOf(25000);

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final OrderMapper orderMapper;
    private final CartServiceImpl cartService;
    private final SimpMessagingTemplate messagingTemplate;

    public OrderServiceImpl(UserRepository userRepository,
                            AddressRepository addressRepository,
                            CartRepository cartRepository,
                            CartItemRepository cartItemRepository,
                            OrderRepository orderRepository,
                            OrderItemRepository orderItemRepository,
                            PaymentRepository paymentRepository,
                            ProductRepository productRepository,
                            InventoryLogRepository inventoryLogRepository,
                            OrderStatusHistoryRepository orderStatusHistoryRepository,
                            CouponUsageRepository couponUsageRepository,
                            OrderMapper orderMapper,
                            CartServiceImpl cartService,
                            SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.productRepository = productRepository;
        this.inventoryLogRepository = inventoryLogRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.couponUsageRepository = couponUsageRepository;
        this.orderMapper = orderMapper;
        this.cartService = cartService;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    @Transactional
    public OrderResponse checkout(String email, CheckoutRequest request) {
        User user = getUser(email);
        Address address = addressRepository.findByIdAndUser(request.getAddressId(), user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        List<Cart> carts = cartRepository.findByUserOrderByCreatedAtDesc(user);
        if (carts.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Cart cart = carts.stream()
                .filter(c -> !cartItemRepository.findByCart(c).isEmpty())
                .findFirst()
                .orElse(carts.get(0));
        List<CartItem> items = cartItemRepository.findByCart(cart);
        if (items.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Map<UUID, Product> lockedProducts = items.stream()
                .map(item -> item.getProduct().getId())
                .distinct()
                .sorted(Comparator.comparing(UUID::toString))
                .map(productId -> productRepository.findByIdForUpdate(productId)
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found")))
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        for (CartItem item : items) {
            Product product = lockedProducts.get(item.getProduct().getId());
            if (product.getStatus() != ProductStatus.ACTIVE || product.getStockQuantity() <= 0) {
                throw new BadRequestException("Product " + product.getName() + " is out of stock");
            }
            if (item.getQuantity() > product.getStockQuantity()) {
                throw new BadRequestException("Product " + product.getName() + " only has "
                        + product.getStockQuantity() + " item(s) left");
            }
        }

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            cart.setAppliedCouponCode(request.getCouponCode().trim());
            cartRepository.save(cart);
        }

        CartServiceImpl.PricingResult pricing = cartService.calculateTotals(cart);
        BigDecimal shippingFee = resolveShippingFee(request.getShippingMethod(), pricing.shippingFee());
        BigDecimal finalTotal = pricing.subtotal().add(shippingFee).subtract(pricing.discount());
        if (finalTotal.compareTo(BigDecimal.ZERO) < 0) {
            finalTotal = BigDecimal.ZERO;
        }

        Order order = new Order();
        order.setOrderCode(CodeGenerator.orderCode());
        order.setUser(user);
        order.setAddress(address);
        order.setReceiverName(address.getReceiverName());
        order.setReceiverPhone(address.getReceiverPhone());
        order.setShippingAddress(formatAddress(address));
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setSubtotal(pricing.subtotal());
        order.setShippingFee(shippingFee);
        order.setDiscountAmount(pricing.discount());
        order.setFinalTotal(finalTotal);
        order.setNote(request.getNote());
        order.setCoupon(pricing.coupon());
        order = orderRepository.save(order);
        recordStatus(order, OrderStatus.PENDING, "SYSTEM", "Đặt hàng thành công");

        for (CartItem cartItem : items) {
            Product product = lockedProducts.get(cartItem.getProduct().getId());
            int before = product.getStockQuantity();
            int qty = cartItem.getQuantity();
            product.setStockQuantity(before - qty);
            product.setSoldCount(product.getSoldCount() + qty);
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setSku(product.getSku());
            orderItem.setUnitPrice(cartItem.getUnitPrice());
            orderItem.setQuantity(qty);
            orderItem.setLineTotal(cartItem.getUnitPrice().multiply(java.math.BigDecimal.valueOf(qty)));
            orderItemRepository.save(orderItem);

            InventoryLog log = new InventoryLog();
            log.setProduct(product);
            log.setChangeType(InventoryChangeType.SALE);
            log.setQuantityBefore(before);
            log.setQuantityChange(-qty);
            log.setQuantityAfter(product.getStockQuantity());
            log.setReason("Checkout order " + order.getOrderCode());
            log.setReferenceType("ORDER");
            log.setReferenceId(order.getOrderCode());
            inventoryLogRepository.save(log);
        }

        if (pricing.coupon() != null) {
            Coupon coupon = pricing.coupon();
            coupon.setUsageCount(coupon.getUsageCount() + 1);

            CouponUsage usage = new CouponUsage();
            usage.setCoupon(coupon);
            usage.setUser(user);
            usage.setOrder(order);
            couponUsageRepository.save(usage);
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        cartItemRepository.deleteByCart(cart);
        cart.setAppliedCouponCode(null);
        cartRepository.save(cart);

        return orderMapper.toResponse(order, orderItemRepository.findByOrder(order));
    }

    @Override
    public Page<OrderResponse> getMyOrders(String email, String statuses, int page, int size) {
        User user = getUser(email);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(1, Math.min(size, 100)),
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        Specification<Order> specification = (root, query, cb) -> cb.equal(root.get("user"), user);
        if (statuses != null && !statuses.isBlank()) {
            try {
                List<OrderStatus> parsedStatuses = java.util.Arrays.stream(statuses.split(","))
                        .map(String::trim)
                        .filter(value -> !value.isBlank())
                        .map(value -> OrderStatus.valueOf(value.toUpperCase()))
                        .toList();
                if (!parsedStatuses.isEmpty()) {
                    specification = specification.and((root, query, cb) -> root.get("status").in(parsedStatuses));
                }
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Invalid order status filter");
            }
        }
        return orderRepository.findAll(specification, pageable)
                .map(order -> orderMapper.toResponse(order, orderItemRepository.findByOrder(order)));
    }

    @Override
    public OrderResponse getMyOrderDetail(String email, UUID orderId) {
        User user = getUser(email);
        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return orderMapper.toResponse(order, orderItemRepository.findByOrder(order));
    }

    @Override
    @Transactional
    public void cancelMyOrder(String email, UUID orderId) {
        User user = getUser(email);
        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!(order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.CONFIRMED)) {
            throw new BadRequestException("Order cannot be cancelled in current status");
        }

        cancelOrder(order, "CUSTOMER", "Khách hàng đã hủy đơn");
        orderRepository.save(order);
        publishOrderStatus(order);
    }

    @Override
    public Page<OrderResponse> getOrders(String keyword, String status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(1, Math.min(size, 100)));
        Specification<Order> specification = Specification.where(null);

        if (keyword != null && !keyword.isBlank()) {
            String pattern = "%" + keyword.trim().toLowerCase() + "%";
            specification = specification.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("orderCode")), pattern),
                    cb.like(cb.lower(root.get("receiverName")), pattern),
                    cb.like(cb.lower(root.get("receiverPhone")), pattern)
            ));
        }
        if (status != null && !status.isBlank()) {
            try {
                OrderStatus parsedStatus = OrderStatus.valueOf(status.trim().toUpperCase());
                specification = specification.and((root, query, cb) -> cb.equal(root.get("status"), parsedStatus));
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Invalid order status");
            }
        }

        Page<Order> orders = orderRepository.findAll(specification, pageable);
        return orders.map(order -> orderMapper.toResponse(order, orderItemRepository.findByOrder(order)));
    }

    @Override
    public OrderResponse getOrderDetail(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return orderMapper.toResponse(order, orderItemRepository.findByOrder(order));
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(UUID id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        OrderStatus oldStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        if (oldStatus == newStatus) {
            return orderMapper.toResponse(order, orderItemRepository.findByOrder(order));
        }
        if (!isAllowedTransition(oldStatus, newStatus)) {
            throw new BadRequestException("Cannot change order status from " + oldStatus + " to " + newStatus);
        }

        if (newStatus == OrderStatus.CANCELLED) {
            cancelOrder(order, "ADMIN", "Quản trị viên đã hủy đơn");
        } else {
            order.setStatus(newStatus);
            recordStatus(order, newStatus, "ADMIN", statusNote(newStatus));
        }

        if (newStatus == OrderStatus.DELIVERED && order.getPaymentStatus() == PaymentStatus.PENDING) {
            order.setPaymentStatus(PaymentStatus.PAID);
            paymentRepository.findByOrderId(order.getId()).ifPresent(p -> {
                p.setStatus(PaymentStatus.PAID);
                p.setPaidAt(LocalDateTime.now());
                paymentRepository.save(p);
            });
        }

        orderRepository.save(order);
        publishOrderStatus(order);
        return orderMapper.toResponse(order, orderItemRepository.findByOrder(order));
    }

    @Override
    @Transactional
    public OrderResponse updatePayment(UUID id, PaymentUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        Payment payment = paymentRepository.findByOrderId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        payment.setMethod(request.getMethod());
        payment.setStatus(request.getStatus());
        payment.setTransactionCode(request.getTransactionCode());
        if (request.getStatus() == PaymentStatus.PAID) {
            payment.setPaidAt(LocalDateTime.now());
        }
        paymentRepository.save(payment);

        order.setPaymentMethod(request.getMethod());
        order.setPaymentStatus(request.getStatus());
        orderRepository.save(order);

        return orderMapper.toResponse(order, orderItemRepository.findByOrder(order));
    }

    @Override
    public SpendingStatsResponse getMySpendingStats(String email) {
        User user = getUser(email);
        var orders = orderRepository.findByUserOrderByCreatedAtDesc(user, PageRequest.of(0, 100)).getContent();

        BigDecimal totalSpent = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getFinalTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<String> recentProducts = orders.stream()
                .flatMap(order -> orderItemRepository.findByOrder(order).stream())
                .map(OrderItem::getProductName)
                .distinct()
                .limit(5)
                .toList();

        return SpendingStatsResponse.builder()
                .totalSpent(totalSpent)
                .totalOrders(orderRepository.countByUser(user))
                .recentProducts(recentProducts)
                .build();
    }

    private void cancelOrder(Order order, String changedBy, String note) {
        if (order.getStatus() == OrderStatus.CANCELLED) {
            return;
        }

        List<OrderItem> items = orderItemRepository.findByOrder(order);
        for (OrderItem item : items) {
            Product product = item.getProduct();
            int before = product.getStockQuantity();
            product.setStockQuantity(before + item.getQuantity());
            if (product.getSoldCount() >= item.getQuantity()) {
                product.setSoldCount(product.getSoldCount() - item.getQuantity());
            }
            productRepository.save(product);

            InventoryLog log = new InventoryLog();
            log.setProduct(product);
            log.setChangeType(InventoryChangeType.RETURN_CANCEL);
            log.setQuantityBefore(before);
            log.setQuantityChange(item.getQuantity());
            log.setQuantityAfter(product.getStockQuantity());
            log.setReason("Cancel order " + order.getOrderCode());
            log.setReferenceType("ORDER");
            log.setReferenceId(order.getOrderCode());
            inventoryLogRepository.save(log);
        }

        order.setStatus(OrderStatus.CANCELLED);
        recordStatus(order, OrderStatus.CANCELLED, changedBy, note);
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
            paymentRepository.findByOrderId(order.getId()).ifPresent(payment -> {
                payment.setStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(payment);
            });
        }
    }

    private void publishOrderStatus(Order order) {
        if (order == null || order.getUser() == null) {
            return;
        }
        OrderStatusEvent event = OrderStatusEvent.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .status(order.getStatus())
                .updatedAt(LocalDateTime.now())
                .build();
        messagingTemplate.convertAndSendToUser(order.getUser().getEmail(), "/queue/orders", event);
    }

    private User getUser(String email) {
        return userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String formatAddress(Address address) {
        return String.join(", ",
                address.getLine1(),
                address.getLine2() == null ? "" : address.getLine2(),
                address.getCity(),
                address.getState() == null ? "" : address.getState(),
                address.getCountry()
        ).replaceAll(", ,", ",").trim();
    }

    private boolean isAllowedTransition(OrderStatus current, OrderStatus next) {
        return switch (current) {
            case PENDING -> EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED).contains(next);
            case CONFIRMED -> EnumSet.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED).contains(next);
            case PROCESSING -> EnumSet.of(OrderStatus.SHIPPING, OrderStatus.CANCELLED).contains(next);
            case SHIPPING -> next == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }

    private void recordStatus(Order order, OrderStatus status, String changedBy, String note) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(status);
        history.setChangedBy(changedBy);
        history.setNote(note);
        orderStatusHistoryRepository.save(history);
    }

    private String statusNote(OrderStatus status) {
        return switch (status) {
            case CONFIRMED -> "Shop đã xác nhận đơn hàng";
            case PROCESSING -> "Đơn hàng đang được chuẩn bị";
            case SHIPPING -> "Đơn hàng đã được bàn giao cho đơn vị vận chuyển";
            case DELIVERED -> "Giao hàng thành công";
            case PENDING -> "Đơn hàng đang chờ xác nhận";
            case CANCELLED -> "Đơn hàng đã hủy";
        };
    }

    private BigDecimal resolveShippingFee(String shippingMethod, BigDecimal standardFee) {
        if ("EXPRESS".equalsIgnoreCase(shippingMethod)) {
            return standardFee.add(EXPRESS_SHIPPING_SURCHARGE);
        }
        return standardFee;
    }
}
