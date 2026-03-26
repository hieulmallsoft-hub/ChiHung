package com.sportshop.repository;

import com.sportshop.entity.Product;
import com.sportshop.entity.Review;
import com.sportshop.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Optional<Review> findByUserAndProduct(User user, Product product);

    Page<Review> findByProductAndApprovedTrueOrderByCreatedAtDesc(Product product, Pageable pageable);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.product.id = :productId and r.approved = true")
    double getAverageRating(UUID productId);
}
