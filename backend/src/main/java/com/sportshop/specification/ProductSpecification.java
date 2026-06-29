package com.sportshop.specification;

import com.sportshop.entity.Product;
import com.sportshop.enums.ProductStatus;
import com.sportshop.util.SlugUtil;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
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
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("deleted")));
            predicates.add(cb.equal(root.get("status"), ProductStatus.ACTIVE));

            if (keyword != null && !keyword.isBlank()) {
                String normalizedKeyword = SlugUtil.normalizeSearch(keyword);
                String rawKeyword = keyword.trim().toLowerCase();
                var paddedSearchText = cb.concat(cb.concat(" ", cb.coalesce(root.get("searchText"), "")), " ");
                List<Predicate> normalizedTokenPredicates = new ArrayList<>();
                for (String token : normalizedKeyword.split("\\s+")) {
                    if (!token.isBlank()) {
                        String pattern = "% " + token + " %";
                        normalizedTokenPredicates.add(cb.like(paddedSearchText, pattern));
                    }
                }
                String rawPattern = "% " + rawKeyword + " %";
                var paddedName = cb.concat(cb.concat(" ", cb.lower(root.get("name"))), " ");
                var paddedBrandName = cb.concat(cb.concat(" ", cb.lower(root.get("brand").get("name"))), " ");
                var paddedCategoryName = cb.concat(cb.concat(" ", cb.lower(root.get("category").get("name"))), " ");
                List<Predicate> keywordPredicates = new ArrayList<>();
                if (!normalizedTokenPredicates.isEmpty()) {
                    keywordPredicates.add(cb.and(normalizedTokenPredicates.toArray(Predicate[]::new)));
                }
                keywordPredicates.add(cb.like(paddedName, rawPattern));
                keywordPredicates.add(cb.like(cb.lower(root.get("sku")), "%" + rawKeyword + "%"));
                keywordPredicates.add(cb.like(paddedBrandName, rawPattern));
                keywordPredicates.add(cb.like(paddedCategoryName, rawPattern));
                predicates.add(cb.or(keywordPredicates.toArray(Predicate[]::new)));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (brandId != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), brandId));
            }
            if (minPrice != null) {
                predicates.add(cb.or(
                        cb.and(
                                cb.greaterThan(root.<BigDecimal>get("salePrice"), BigDecimal.ZERO),
                                cb.greaterThanOrEqualTo(root.<BigDecimal>get("salePrice"), minPrice)
                        ),
                        cb.and(
                                cb.or(cb.isNull(root.get("salePrice")), cb.lessThanOrEqualTo(root.<BigDecimal>get("salePrice"), BigDecimal.ZERO)),
                                cb.greaterThanOrEqualTo(root.<BigDecimal>get("price"), minPrice)
                        )
                ));
            }
            if (maxPrice != null) {
                predicates.add(cb.or(
                        cb.and(
                                cb.greaterThan(root.<BigDecimal>get("salePrice"), BigDecimal.ZERO),
                                cb.lessThanOrEqualTo(root.<BigDecimal>get("salePrice"), maxPrice)
                        ),
                        cb.and(
                                cb.or(cb.isNull(root.get("salePrice")), cb.lessThanOrEqualTo(root.<BigDecimal>get("salePrice"), BigDecimal.ZERO)),
                                cb.lessThanOrEqualTo(root.<BigDecimal>get("price"), maxPrice)
                        )
                ));
            }
            if (inStock != null) {
                predicates.add(Boolean.TRUE.equals(inStock)
                        ? cb.greaterThan(root.get("stockQuantity"), 0)
                        : cb.lessThanOrEqualTo(root.get("stockQuantity"), 0));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
