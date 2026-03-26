package com.sportshop.dto.chat;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class MessageResponse {
    private UUID id;
    private UUID roomId;
    private UUID senderId;
    private String senderName;
    private String content;
    private boolean deleted;
    private LocalDateTime editedAt;
    private LocalDateTime deletedAt;
    private boolean readByUser;
    private boolean readByAdmin;
    private LocalDateTime createdAt;
}
