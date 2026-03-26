package com.sportshop.service.impl;

import com.sportshop.dto.review.ReviewRequest;
import com.sportshop.dto.review.ReviewResponse;
import com.sportshop.entity.Product;
import com.sportshop.entity.Review;
import com.sportshop.entity.User;
import com.sportshop.exception.BadRequestException;
import com.sportshop.exception.ResourceNotFoundException;
import com.sportshop.mapper.ReviewMapper;
import com.sportshop.repository.OrderItemRepository;
import com.sportshop.repository.ProductRepository;
import com.sportshop.repository.ReviewRepository;
import com.sportshop.repository.UserRepository;
import com.sportshop.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewMapper reviewMapper;

    public ReviewServiceImpl(UserRepository userRepository,
                             ProductRepository productRepository,
                             ReviewRepository reviewRepository,
                             OrderItemRepository orderItemRepository,
                             ReviewMapper reviewMapper) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
        this.orderItemRepository = orderItemRepository;
        this.reviewMapper = reviewMapper;
    }

    @Override
    @Transactional
    public ReviewResponse createOrUpdate(String email, ReviewRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findByIdAndDeletedFalse(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        boolean canReview = orderItemRepository.hasDeliveredOrderForProduct(product, user.getId());
        if (!canReview) {
            throw new BadRequestException("You can only review purchased and delivered products");
        }

        Review review = reviewRepository.findByUserAndProduct(user, product).orElse(new Review());
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setApproved(true);

        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Override
    public Page<ReviewResponse> getProductReviews(UUID productId, int page, int size) {
        Product product = productRepository.findByIdAndDeletedFalse(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return reviewRepository.findByProductAndApprovedTrueOrderByCreatedAtDesc(product, PageRequest.of(page, size))
                .map(reviewMapper::toResponse);
    }
}
