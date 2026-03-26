package com.sportshop.dto.brand;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class BrandResponse {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private boolean active;
}
