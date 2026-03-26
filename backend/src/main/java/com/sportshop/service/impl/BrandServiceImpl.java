package com.sportshop.service.impl;

import com.sportshop.dto.brand.BrandRequest;
import com.sportshop.dto.brand.BrandResponse;
import com.sportshop.entity.Brand;
import com.sportshop.exception.ResourceNotFoundException;
import com.sportshop.mapper.BrandMapper;
import com.sportshop.repository.BrandRepository;
import com.sportshop.service.BrandService;
import com.sportshop.util.SlugUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    public BrandServiceImpl(BrandRepository brandRepository, BrandMapper brandMapper) {
        this.brandRepository = brandRepository;
        this.brandMapper = brandMapper;
    }

    @Override
    public List<BrandResponse> getActiveBrands() {
        return brandRepository.findByDeletedFalseAndActiveTrueOrderByNameAsc().stream()
                .map(brandMapper::toResponse)
                .toList();
    }

    @Override
    public List<BrandResponse> getAll() {
        return brandRepository.findAll().stream().filter(b -> !b.isDeleted()).map(brandMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public BrandResponse create(BrandRequest request) {
        Brand brand = new Brand();
        brand.setName(request.getName());
        brand.setSlug(buildUniqueSlug(request.getName()));
        brand.setDescription(request.getDescription());
        brand.setActive(request.isActive());
        return brandMapper.toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse update(UUID id, BrandRequest request) {
        Brand brand = brandRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        brand.setName(request.getName());
        brand.setSlug(buildUniqueSlug(request.getName()));
        brand.setDescription(request.getDescription());
        brand.setActive(request.isActive());
        return brandMapper.toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Brand brand = brandRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        brand.setDeleted(true);
        brand.setActive(false);
        brandRepository.save(brand);
    }

    private String buildUniqueSlug(String name) {
        String baseSlug = SlugUtil.toSlug(name);
        String slug = baseSlug;
        int i = 1;
        while (brandRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + i;
            i++;
        }
        return slug;
    }
}
