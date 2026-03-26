package com.sportshop.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class SendMessageRequest {

    @NotNull
    private UUID roomId;

    @NotBlank
    private String content;
}
