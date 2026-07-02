package com.sportshop.exception;

import com.sportshop.dto.common.ApiResponse;
import jakarta.persistence.NonUniqueResultException;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ========== CUSTOM EXCEPTIONS ==========

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("ResourceNotFoundException: {}", ex.getMessage());
        return error(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        log.warn("BadRequestException: {}", ex.getMessage());
        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("IllegalArgumentException: {}", ex.getMessage());
        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex) {
        log.warn("UnauthorizedException: {}", ex.getMessage());
        return error(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbidden(ForbiddenException ex) {
        log.warn("ForbiddenException: {}", ex.getMessage());
        return error(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler({DataIntegrityViolationException.class, NonUniqueResultException.class})
    public ResponseEntity<ApiResponse<Void>> handleDuplicateOrIntegrity(Exception ex) {
        log.warn("DataIntegrity/NonUnique exception: {}", ex.getMessage());
        return error(HttpStatus.CONFLICT, "Dữ liệu bị trùng hoặc vi phạm ràng buộc unique");
    }

    // ========== SPRING MVC EXCEPTIONS ==========

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.warn("MethodArgumentTypeMismatch: field='{}', value='{}'", ex.getName(), ex.getValue());
        String message = String.format(
                "Tham số '%s' có giá trị '%s' không hợp lệ, kiểu yêu cầu: %s",
                ex.getName(),
                ex.getValue(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "không xác định"
        );
        return error(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotReadable(HttpMessageNotReadableException ex) {
        log.warn("HttpMessageNotReadableException: {}", ex.getMessage());
        return error(HttpStatus.BAD_REQUEST, "Body request không hợp lệ hoặc bị thiếu");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<List<String>>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        log.warn("MethodArgumentNotValidException: {}", ex.getMessage());
        List<String> details = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::buildValidationMessage)
                .toList();
        return errorWithData(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ", details);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<List<String>>> handleConstraintViolation(ConstraintViolationException ex) {
        log.warn("ConstraintViolationException: {}", ex.getMessage());
        List<String> details = ex.getConstraintViolations()
                .stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .toList();
        return errorWithData(HttpStatus.BAD_REQUEST, "Dữ liệu request không hợp lệ", details);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        log.warn("HttpRequestMethodNotSupportedException: method='{}'", ex.getMethod());
        String message = String.format("Phương thức HTTP '%s' không được hỗ trợ cho endpoint này", ex.getMethod());
        return error(HttpStatus.METHOD_NOT_ALLOWED, message);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoHandlerFound(NoHandlerFoundException ex) {
        log.warn("NoHandlerFoundException: method='{}', uri='{}'", ex.getHttpMethod(), ex.getRequestURL());
        String message = String.format("Không tìm thấy endpoint '%s %s'", ex.getHttpMethod(), ex.getRequestURL());
        return error(HttpStatus.NOT_FOUND, message);
    }

    // ========== CATCH-ALL ==========

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        log.error("Unexpected exception: {}", ex.getMessage(), ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "Da xay ra loi he thong, vui long thu lai sau");
    }

    private String buildValidationMessage(FieldError error) {
        String field = error.getField();
        String message = error.getDefaultMessage();
        return field + ": " + message;
    }

    private ResponseEntity<ApiResponse<Void>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(ApiResponse.error(message));
    }

    private <T> ResponseEntity<ApiResponse<T>> errorWithData(HttpStatus status, String message, T data) {
        ApiResponse<T> response = ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(status).body(response);
    }
}
