package com.sportshop.entity;

import com.sportshop.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Formula;
import com.sportshop.util.SlugUtil;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_products_name", columnList = "name"),
        @Index(name = "idx_products_sku", columnList = "sku", unique = true),
        @Index(name = "idx_products_price", columnList = "price")
})
public class Product extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 80)
    private String sku;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(precision = 15, scale = 2)
    private BigDecimal salePrice;

    @Formula("case when sale_price is not null and sale_price > 0 then sale_price else price end")
    private BigDecimal effectivePrice;

    @Column(length = 500)
    private String shortDescription;

    @Column(length = 1000)
    private String searchText;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String thumbnailUrl;

    @Column(nullable = false)
    private Integer stockQuantity = 0;

    @Column(nullable = false)
    private Integer soldCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(nullable = false)
    private boolean deleted = false;

    @PrePersist
    @PreUpdate
    private void updateSearchText() {
        String categoryName = category == null ? "" : category.getName();
        String brandName = brand == null ? "" : brand.getName();
        searchText = SlugUtil.normalizeSearch(String.join(" ",
                name == null ? "" : name,
                sku == null ? "" : sku,
                categoryName,
                brandName,
                shortDescription == null ? "" : shortDescription
        ));
    }
}
