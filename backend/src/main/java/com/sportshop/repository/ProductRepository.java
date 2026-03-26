package com.sportshop.repository;

import com.sportshop.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    Optional<Product> findByIdAndDeletedFalse(UUID id);

    Optional<Product> findBySku(String sku);

    Page<Product> findByDeletedFalse(Pageable pageable);

    List<Product> findTop8ByDeletedFalseAndCategoryIdAndIdNotOrderBySoldCountDesc(UUID categoryId, UUID excludeId);

    long countByDeletedFalse();
}
