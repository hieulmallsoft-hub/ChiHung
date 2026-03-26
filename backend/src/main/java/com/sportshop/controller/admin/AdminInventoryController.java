package com.sportshop.controller.admin;

import com.sportshop.dto.common.ApiResponse;
import com.sportshop.dto.product.InventoryAdjustRequest;
import com.sportshop.dto.product.InventoryLogResponse;
import com.sportshop.dto.product.ProductResponse;
import com.sportshop.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/inventory")
public class AdminInventoryController {

    private final ProductService productService;

    public AdminInventoryController(ProductService productService) {
        this.productService = productService;
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> adjustStock(@PathVariable UUID productId,
                                                                    @Valid @RequestBody InventoryAdjustRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Stock adjusted", productService.adjustStock(productId, request)));
    }

    @GetMapping("/products/{productId}/logs")
    public ResponseEntity<ApiResponse<List<InventoryLogResponse>>> logs(@PathVariable UUID productId) {
        return ResponseEntity.ok(ApiResponse.success("Inventory logs", productService.getInventoryLogs(productId)));
    }
}
