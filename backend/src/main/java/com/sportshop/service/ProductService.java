package com.sportshop.service;

import com.sportshop.dto.product.ProductRequest;
import com.sportshop.dto.product.ProductResponse;
import com.sportshop.dto.product.InventoryAdjustRequest;
import com.sportshop.dto.product.InventoryLogResponse;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ProductService {
    Page<ProductResponse> getProducts(String keyword,
                                      UUID categoryId,
                                      UUID brandId,
                                      BigDecimal minPrice,
                                      BigDecimal maxPrice,
                                      Boolean inStock,
                                      String sortBy,
                                      int page,
                                      int size);

    ProductResponse getProduct(UUID id);

    List<ProductResponse> getRelatedProducts(UUID productId);

    ProductResponse create(ProductRequest request);

    ProductResponse update(UUID id, ProductRequest request);

    void delete(UUID id);

    ProductResponse adjustStock(UUID id, InventoryAdjustRequest request);

    List<InventoryLogResponse> getInventoryLogs(UUID productId);
}
