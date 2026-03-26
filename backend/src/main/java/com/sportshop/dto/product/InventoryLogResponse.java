package com.sportshop.dto.product;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class InventoryLogResponse {
    private String changeType;
    private Integer quantityBefore;
    private Integer quantityChange;
    private Integer quantityAfter;
    private String reason;
    private LocalDateTime createdAt;
}
