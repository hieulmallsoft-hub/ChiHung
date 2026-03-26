package com.sportshop.dto.order;

import com.sportshop.enums.PaymentMethod;
import com.sportshop.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentUpdateRequest {

    @NotNull
    private PaymentStatus status;

    @NotNull
    private PaymentMethod method;

    private String transactionCode;
}
