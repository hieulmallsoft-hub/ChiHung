package com.sportshop.repository;

import com.sportshop.entity.CouponUsage;
import com.sportshop.entity.Coupon;
import com.sportshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CouponUsageRepository extends JpaRepository<CouponUsage, UUID> {

    long countByCouponAndUser(Coupon coupon, User user);
}
