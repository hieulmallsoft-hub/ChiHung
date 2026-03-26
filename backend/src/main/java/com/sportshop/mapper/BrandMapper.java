package com.sportshop.mapper;

import com.sportshop.dto.brand.BrandResponse;
import com.sportshop.entity.Brand;
import org.springframework.stereotype.Component;

@Component
public class BrandMapper {

    public BrandResponse toResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .slug(brand.getSlug())
                .description(brand.getDescription())
                .active(brand.isActive())
                .build();
    }
}
