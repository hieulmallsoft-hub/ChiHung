package com.sportshop.controller.publicapi;

import com.sportshop.dto.brand.BrandResponse;
import com.sportshop.dto.common.ApiResponse;
import com.sportshop.service.BrandService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/brands")
public class PublicBrandController {

    private final BrandService brandService;

    public PublicBrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getBrands() {
        return ResponseEntity.ok(ApiResponse.success("Brand list", brandService.getActiveBrands()));
    }
}
