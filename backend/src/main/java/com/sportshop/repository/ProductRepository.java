package com.sportshop.repository;

import com.sportshop.entity.Product;
import com.sportshop.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    Optional<Product> findByIdAndDeletedFalse(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id and p.deleted = false")
    Optional<Product> findByIdForUpdate(@Param("id") UUID id);

    Optional<Product> findBySku(String sku);

    Page<Product> findByDeletedFalse(Pageable pageable);

    List<Product> findBySearchTextIsNull();

    Page<Product> findByDeletedFalseAndStatus(ProductStatus status, Pageable pageable);

    List<Product> findTop8ByDeletedFalseAndCategoryIdAndIdNotOrderBySoldCountDesc(UUID categoryId, UUID excludeId);

    long countByDeletedFalse();
}
