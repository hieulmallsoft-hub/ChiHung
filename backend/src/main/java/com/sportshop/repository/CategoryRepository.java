package com.sportshop.repository;

import com.sportshop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findByDeletedFalseAndActiveTrueOrderByNameAsc();

    Optional<Category> findByIdAndDeletedFalse(UUID id);

    boolean existsBySlug(String slug);
}
