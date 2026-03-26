package com.sportshop.dto.chat;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EditMessageRequest {
    @NotBlank
    private String content;
}
