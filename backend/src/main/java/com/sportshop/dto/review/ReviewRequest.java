package com.sportshop.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ReviewRequest {

    @NotNull
    private UUID productId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    private String comment;
}
