package com.sportshop.repository;

import com.sportshop.entity.InventoryLog;
import com.sportshop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InventoryLogRepository extends JpaRepository<InventoryLog, UUID> {

    List<InventoryLog> findTop50ByProductOrderByCreatedAtDesc(Product product);
}
