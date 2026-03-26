package com.sportshop.repository;

import com.sportshop.entity.Cart;
import com.sportshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart, UUID> {

    List<Cart> findByUserOrderByCreatedAtDesc(User user);
}
