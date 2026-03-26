package com.sportshop.mapper;

import com.sportshop.dto.product.ProductResponse;
import com.sportshop.entity.Product;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product, List<String> imageUrls, double averageRating) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .brandId(product.getBrand().getId())
                .brandName(product.getBrand().getName())
                .price(product.getPrice())
                .salePrice(product.getSalePrice())
                .shortDescription(product.getShortDescription())
                .description(product.getDescription())
                .thumbnailUrl(product.getThumbnailUrl())
                .stockQuantity(product.getStockQuantity())
                .soldCount(product.getSoldCount())
                .averageRating(averageRating)
                .imageUrls(imageUrls)
                .build();
    }
}
