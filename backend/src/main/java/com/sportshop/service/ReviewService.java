package com.sportshop.service;

import com.sportshop.dto.review.ReviewRequest;
import com.sportshop.dto.review.ReviewResponse;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface ReviewService {
    ReviewResponse createOrUpdate(String email, ReviewRequest request);

    Page<ReviewResponse> getProductReviews(UUID productId, int page, int size);
}
