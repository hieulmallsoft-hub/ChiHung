package com.sportshop.specification;

import com.sportshop.entity.Product;
import com.sportshop.enums.ProductStatus;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.UUID;

public final class ProductSpecification {

    private ProductSpecification() {
    }

    public static Specification<Product> filter(String keyword,
                                                UUID categoryId,
                                                UUID brandId,
                                                BigDecimal minPrice,
                                                BigDecimal maxPrice,
                                                Boolean inStock) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();
            predicates.getExpressions().add(cb.isFalse(root.get("deleted")));
            predicates.getExpressions().add(cb.equal(root.get("status"), ProductStatus.ACTIVE));

            if (keyword != null && !keyword.isBlank()) {
                predicates.getExpressions().add(
                        cb.like(cb.lower(root.get("name")), "%" + keyword.toLowerCase() + "%")
                );
            }
            if (categoryId != null) {
                predicates.getExpressions().add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (brandId != null) {
                predicates.getExpressions().add(cb.equal(root.get("brand").get("id"), brandId));
            }
            if (minPrice != null) {
                predicates.getExpressions().add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.getExpressions().add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (Boolean.TRUE.equals(inStock)) {
                predicates.getExpressions().add(cb.greaterThan(root.get("stockQuantity"), 0));
            }
            return predicates;
        };
    }
}
