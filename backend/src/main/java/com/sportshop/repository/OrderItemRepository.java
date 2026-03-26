package com.sportshop.repository;

import com.sportshop.entity.Order;
import com.sportshop.entity.OrderItem;
import com.sportshop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    List<OrderItem> findByOrder(Order order);

    @Query("select oi.product.id, sum(oi.quantity) from OrderItem oi group by oi.product.id order by sum(oi.quantity) desc")
    List<Object[]> findTopSellingProductQuantities();

    @Query("select count(oi) > 0 from OrderItem oi where oi.product = :product and oi.order.user.id = :userId and oi.order.status = com.sportshop.enums.OrderStatus.DELIVERED")
    boolean hasDeliveredOrderForProduct(Product product, UUID userId);
}
