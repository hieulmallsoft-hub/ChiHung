package com.sportshop.service;

import com.sportshop.dto.brand.BrandRequest;
import com.sportshop.dto.brand.BrandResponse;

import java.util.List;
import java.util.UUID;

public interface BrandService {
    List<BrandResponse> getActiveBrands();

    List<BrandResponse> getAll();

    BrandResponse create(BrandRequest request);

    BrandResponse update(UUID id, BrandRequest request);

    void delete(UUID id);
}
