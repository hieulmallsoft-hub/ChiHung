package com.sportshop.dto.order;

import com.sportshop.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CheckoutRequest {

    @NotNull
    private UUID addressId;

    @NotNull
    private PaymentMethod paymentMethod;

    private String couponCode;

    private String note;
}
