package com.sportshop.service.impl;

import com.sportshop.dto.coupon.CouponRequest;
import com.sportshop.dto.coupon.CouponResponse;
import com.sportshop.entity.Coupon;
import com.sportshop.enums.DiscountType;
import com.sportshop.exception.ResourceNotFoundException;
import com.sportshop.mapper.CouponMapper;
import com.sportshop.repository.CouponRepository;
import com.sportshop.service.CouponService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CouponMapper couponMapper;

    public CouponServiceImpl(CouponRepository couponRepository, CouponMapper couponMapper) {
        this.couponRepository = couponRepository;
        this.couponMapper = couponMapper;
    }

    @Override
    public List<CouponResponse> getAll() {
        return couponRepository.findAll().stream().map(couponMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public CouponResponse create(CouponRequest request) {
        Coupon coupon = new Coupon();
        map(coupon, request);
        return couponMapper.toResponse(couponRepository.save(coupon));
    }

    @Override
    @Transactional
    public CouponResponse update(UUID id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        map(coupon, request);
        return couponMapper.toResponse(couponRepository.save(coupon));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Coupon coupon = couponRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        coupon.setActive(false);
        couponRepository.save(coupon);
    }

    private void map(Coupon coupon, CouponRequest request) {
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDiscountType(DiscountType.valueOf(request.getDiscountType()));
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderValue(request.getMinOrderValue());
        coupon.setMaxDiscount(request.getMaxDiscount());
        coupon.setUsageLimit(request.getUsageLimit() == null ? 0 : request.getUsageLimit());
        coupon.setActive(request.isActive());
    }
}
