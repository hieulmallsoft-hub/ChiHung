package com.sportshop.dto.product;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryAdjustRequest {

    @NotNull
    private Integer newStockQuantity;

    private String reason;
}
