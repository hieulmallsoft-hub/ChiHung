package com.sportshop.controller.admin;

import com.sportshop.dto.common.ApiResponse;
import com.sportshop.dto.coupon.CouponRequest;
import com.sportshop.dto.coupon.CouponResponse;
import com.sportshop.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/coupons")
public class AdminCouponController {

    private final CouponService couponService;

    public AdminCouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Danh sách mã giảm giá", couponService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CouponResponse>> create(@Valid @RequestBody CouponRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã tạo mã giảm giá", couponService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> update(@PathVariable UUID id,
                                                              @Valid @RequestBody CouponRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật mã giảm giá", couponService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        couponService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Đã vô hiệu hóa mã giảm giá", null));
    }
}
