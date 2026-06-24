package com.sportshop.dto.product;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryAdjustRequest {

    @NotNull
    @Min(0)
    private Integer newStockQuantity;

    @NotBlank
    @Size(max = 255)
    private String reason;
}
