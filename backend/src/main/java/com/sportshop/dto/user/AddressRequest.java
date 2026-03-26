package com.sportshop.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressRequest {

    @NotBlank
    private String receiverName;

    @NotBlank
    @Pattern(regexp = "^\\d{9,15}$", message = "Phone must be 9-15 digits")
    private String receiverPhone;

    @NotBlank
    @Size(max = 255)
    private String line1;

    @Size(max = 255)
    private String line2;

    @NotBlank
    private String city;

    private String state;

    private String postalCode;

    private String country;

    private boolean defaultAddress;
}
