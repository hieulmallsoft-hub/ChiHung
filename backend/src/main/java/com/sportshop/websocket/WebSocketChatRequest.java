package com.sportshop.websocket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class WebSocketChatRequest {

    @NotNull
    private UUID roomId;

    @NotBlank
    private String content;
}
