package com.sportshop.dto.product;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class ProductResponse {
    private UUID id;
    private String name;
    private String sku;
    private UUID categoryId;
    private String categoryName;
    private UUID brandId;
    private String brandName;
    private BigDecimal price;
    private BigDecimal salePrice;
    private String shortDescription;
    private String description;
    private String thumbnailUrl;
    private Integer stockQuantity;
    private Integer soldCount;
    private Double averageRating;
    private List<String> imageUrls;
}
