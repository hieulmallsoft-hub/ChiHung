package com.sportshop.repository;

import com.sportshop.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BrandRepository extends JpaRepository<Brand, UUID> {

    List<Brand> findByDeletedFalseAndActiveTrueOrderByNameAsc();

    Optional<Brand> findByIdAndDeletedFalse(UUID id);

    boolean existsBySlug(String slug);
}
