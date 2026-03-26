package com.sportshop.repository;

import com.sportshop.entity.Order;
import com.sportshop.entity.User;
import com.sportshop.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    Optional<Order> findByIdAndUser(UUID id, User user);

    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    Page<Order> findByOrderCodeContainingIgnoreCase(String keyword, Pageable pageable);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    Optional<Order> findByOrderCode(String orderCode);

    long countByStatus(OrderStatus status);

    long countByUser(User user);

    List<Order> findTop5ByOrderByCreatedAtDesc();

    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
}
