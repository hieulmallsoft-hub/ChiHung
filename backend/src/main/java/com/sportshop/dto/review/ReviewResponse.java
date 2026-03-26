package com.sportshop.dto.review;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class ReviewResponse {
    private UUID id;
    private UUID userId;
    private String userName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
