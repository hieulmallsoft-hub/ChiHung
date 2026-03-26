package com.sportshop.dto.common;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Builder
public class ErrorResponse {
    private String message;
    private int status;
    private Map<String, String> validationErrors;
    private LocalDateTime timestamp;
}
