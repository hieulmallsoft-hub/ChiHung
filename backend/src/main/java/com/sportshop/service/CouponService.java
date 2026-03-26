package com.sportshop.service;

import com.sportshop.dto.coupon.CouponRequest;
import com.sportshop.dto.coupon.CouponResponse;

import java.util.List;
import java.util.UUID;

public interface CouponService {
    List<CouponResponse> getAll();

    CouponResponse create(CouponRequest request);

    CouponResponse update(UUID id, CouponRequest request);

    void delete(UUID id);
}
