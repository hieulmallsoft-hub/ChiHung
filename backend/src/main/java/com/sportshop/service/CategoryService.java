package com.sportshop.service;

import com.sportshop.dto.category.CategoryRequest;
import com.sportshop.dto.category.CategoryResponse;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    List<CategoryResponse> getActiveCategories();

    List<CategoryResponse> getAll();

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(UUID id, CategoryRequest request);

    void delete(UUID id);
}
