package com.sportshop.dto.chat;

import com.sportshop.enums.MessageType;
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
    private MessageType messageType;
    private String content;
    private boolean deleted;
    private LocalDateTime editedAt;
    private LocalDateTime deletedAt;
    private boolean readByUser;
    private boolean readByAdmin;
    private LocalDateTime createdAt;
}
