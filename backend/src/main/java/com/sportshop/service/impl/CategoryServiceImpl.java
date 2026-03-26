package com.sportshop.service.impl;

import com.sportshop.dto.category.CategoryRequest;
import com.sportshop.dto.category.CategoryResponse;
import com.sportshop.entity.Category;
import com.sportshop.exception.ResourceNotFoundException;
import com.sportshop.mapper.CategoryMapper;
import com.sportshop.repository.CategoryRepository;
import com.sportshop.service.CategoryService;
import com.sportshop.util.SlugUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public CategoryServiceImpl(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Override
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByDeletedFalseAndActiveTrueOrderByNameAsc().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll().stream().filter(c -> !c.isDeleted()).map(categoryMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(buildUniqueSlug(request.getName()));
        category.setDescription(request.getDescription());
        category.setActive(request.isActive());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(UUID id, CategoryRequest request) {
        Category category = categoryRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setName(request.getName());
        category.setSlug(buildUniqueSlug(request.getName()));
        category.setDescription(request.getDescription());
        category.setActive(request.isActive());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Category category = categoryRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setDeleted(true);
        category.setActive(false);
        categoryRepository.save(category);
    }

    private String buildUniqueSlug(String name) {
        String baseSlug = SlugUtil.toSlug(name);
        String slug = baseSlug;
        int i = 1;
        while (categoryRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + i;
            i++;
        }
        return slug;
    }
}
