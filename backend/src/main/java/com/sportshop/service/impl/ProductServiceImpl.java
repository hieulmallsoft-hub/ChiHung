package com.sportshop.service.impl;

import com.sportshop.dto.product.ProductRequest;
import com.sportshop.dto.product.ProductResponse;
import com.sportshop.dto.product.InventoryAdjustRequest;
import com.sportshop.dto.product.InventoryLogResponse;
import com.sportshop.entity.*;
import com.sportshop.enums.InventoryChangeType;
import com.sportshop.exception.BadRequestException;
import com.sportshop.exception.ResourceNotFoundException;
import com.sportshop.mapper.ProductMapper;
import com.sportshop.repository.*;
import com.sportshop.service.ProductService;
import com.sportshop.specification.ProductSpecification;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductImageRepository productImageRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final ReviewRepository reviewRepository;
    private final ProductMapper productMapper;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              BrandRepository brandRepository,
                              ProductImageRepository productImageRepository,
                              InventoryLogRepository inventoryLogRepository,
                              ReviewRepository reviewRepository,
                              ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.productImageRepository = productImageRepository;
        this.inventoryLogRepository = inventoryLogRepository;
        this.reviewRepository = reviewRepository;
        this.productMapper = productMapper;
    }

    @Override
    public Page<ProductResponse> getProducts(String keyword,
                                             UUID categoryId,
                                             UUID brandId,
                                             BigDecimal minPrice,
                                             BigDecimal maxPrice,
                                             Boolean inStock,
                                             String sortBy,
                                             int page,
                                             int size) {

        Pageable pageable = PageRequest.of(page, size, buildSort(sortBy));
        Page<Product> products = productRepository.findAll(
                ProductSpecification.filter(keyword, categoryId, brandId, minPrice, maxPrice, inStock),
                pageable
        );

        return products.map(this::toResponse);
    }

    @Override
    public ProductResponse getProduct(UUID id) {
        Product product = productRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toResponse(product);
    }

    @Override
    public List<ProductResponse> getRelatedProducts(UUID productId) {
        Product product = productRepository.findByIdAndDeletedFalse(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return productRepository.findTop8ByDeletedFalseAndCategoryIdAndIdNotOrderBySoldCountDesc(
                        product.getCategory().getId(),
                        product.getId()
                ).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (productRepository.findBySku(request.getSku()).isPresent()) {
            throw new BadRequestException("SKU already exists");
        }

        Category category = categoryRepository.findByIdAndDeletedFalse(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        Brand brand = brandRepository.findByIdAndDeletedFalse(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));

        Product product = new Product();
        mapProduct(product, request, category, brand);
        product = productRepository.save(product);

        saveImages(product, request.getImageUrls(), request.getThumbnailUrl());
        logInventory(product, 0, request.getStockQuantity(), request.getStockQuantity(), "Initial stock", "PRODUCT", product.getId().toString());

        return toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse update(UUID id, ProductRequest request) {
        Product product = productRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getSku().equalsIgnoreCase(request.getSku()) && productRepository.findBySku(request.getSku()).isPresent()) {
            throw new BadRequestException("SKU already exists");
        }

        Category category = categoryRepository.findByIdAndDeletedFalse(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        Brand brand = brandRepository.findByIdAndDeletedFalse(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));

        int oldStock = product.getStockQuantity();
        mapProduct(product, request, category, brand);
        product = productRepository.save(product);

        if (request.getImageUrls() != null) {
            productImageRepository.deleteAll(productImageRepository.findByProductOrderBySortOrderAsc(product));
            saveImages(product, request.getImageUrls(), request.getThumbnailUrl());
        }

        if (oldStock != request.getStockQuantity()) {
            logInventory(product,
                    oldStock,
                    request.getStockQuantity() - oldStock,
                    request.getStockQuantity(),
                    "Stock adjusted by admin",
                    "PRODUCT",
                    product.getId().toString());
        }

        return toResponse(product);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Product product = productRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setDeleted(true);
        productRepository.save(product);
    }

    @Override
    @Transactional
    public ProductResponse adjustStock(UUID id, InventoryAdjustRequest request) {
        Product product = productRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        int before = product.getStockQuantity();
        int after = request.getNewStockQuantity();
        product.setStockQuantity(after);
        productRepository.save(product);

        InventoryLog log = new InventoryLog();
        log.setProduct(product);
        log.setChangeType(InventoryChangeType.ADJUST);
        log.setQuantityBefore(before);
        log.setQuantityChange(after - before);
        log.setQuantityAfter(after);
        log.setReason(request.getReason());
        log.setReferenceType("ADMIN");
        log.setReferenceId(product.getId().toString());
        inventoryLogRepository.save(log);

        return toResponse(product);
    }

    @Override
    public List<InventoryLogResponse> getInventoryLogs(UUID productId) {
        Product product = productRepository.findByIdAndDeletedFalse(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return inventoryLogRepository.findTop50ByProductOrderByCreatedAtDesc(product).stream()
                .map(log -> InventoryLogResponse.builder()
                        .changeType(log.getChangeType().name())
                        .quantityBefore(log.getQuantityBefore())
                        .quantityChange(log.getQuantityChange())
                        .quantityAfter(log.getQuantityAfter())
                        .reason(log.getReason())
                        .createdAt(log.getCreatedAt())
                        .build())
                .toList();
    }

    private void mapProduct(Product product, ProductRequest request, Category category, Brand brand) {
        product.setName(request.getName());
        product.setSku(request.getSku().toUpperCase());
        product.setCategory(category);
        product.setBrand(brand);
        product.setPrice(request.getPrice());
        product.setSalePrice(request.getSalePrice());
        product.setShortDescription(request.getShortDescription());
        product.setDescription(request.getDescription());
        product.setThumbnailUrl(request.getThumbnailUrl());
        product.setStockQuantity(request.getStockQuantity());
    }

    private void saveImages(Product product, List<String> imageUrls, String thumbnailUrl) {
        List<ProductImage> images = new ArrayList<>();

        if (thumbnailUrl != null && !thumbnailUrl.isBlank()) {
            ProductImage thumbnail = new ProductImage();
            thumbnail.setProduct(product);
            thumbnail.setImageUrl(thumbnailUrl);
            thumbnail.setPrimaryImage(true);
            thumbnail.setSortOrder(0);
            images.add(thumbnail);
        }

        if (imageUrls != null) {
            for (int i = 0; i < imageUrls.size(); i++) {
                ProductImage image = new ProductImage();
                image.setProduct(product);
                image.setImageUrl(imageUrls.get(i));
                image.setPrimaryImage(false);
                image.setSortOrder(i + 1);
                images.add(image);
            }
        }

        if (!images.isEmpty()) {
            productImageRepository.saveAll(images);
        }
    }

    private void logInventory(Product product,
                              int before,
                              int change,
                              int after,
                              String reason,
                              String refType,
                              String refId) {
        InventoryLog log = new InventoryLog();
        log.setProduct(product);
        log.setChangeType(change >= 0 ? InventoryChangeType.IMPORT : InventoryChangeType.ADJUST);
        log.setQuantityBefore(before);
        log.setQuantityChange(change);
        log.setQuantityAfter(after);
        log.setReason(reason);
        log.setReferenceType(refType);
        log.setReferenceId(refId);
        inventoryLogRepository.save(log);
    }

    private ProductResponse toResponse(Product product) {
        List<String> imageUrls = productImageRepository.findByProductOrderBySortOrderAsc(product)
                .stream()
                .map(ProductImage::getImageUrl)
                .toList();

        double avgRating = reviewRepository.getAverageRating(product.getId());

        return productMapper.toResponse(product, imageUrls, avgRating);
    }

    private Sort buildSort(String sortBy) {
        if (sortBy == null || sortBy.isBlank() || "newest".equalsIgnoreCase(sortBy)) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        return switch (sortBy) {
            case "priceAsc" -> Sort.by(Sort.Direction.ASC, "price");
            case "priceDesc" -> Sort.by(Sort.Direction.DESC, "price");
            case "bestSeller" -> Sort.by(Sort.Direction.DESC, "soldCount");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }
}
