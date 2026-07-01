package com.sportshop.controller.admin;

import com.sportshop.dto.brand.BrandRequest;
import com.sportshop.dto.brand.BrandResponse;
import com.sportshop.dto.common.ApiResponse;
import com.sportshop.service.BrandService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/brands")
public class AdminBrandController {

    private final BrandService brandService;

    public AdminBrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Danh sách thương hiệu", brandService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BrandResponse>> create(@Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã tạo thương hiệu", brandService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> update(@PathVariable UUID id,
                                                             @Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật thương hiệu", brandService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        brandService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa thương hiệu", null));
    }
}
