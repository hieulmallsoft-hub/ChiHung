package com.sportshop.dto.chat;

import com.sportshop.enums.ChatRoomStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class ChatRoomResponse {
    private UUID id;
    private UUID userId;
    private String userName;
    private UUID assignedAdminId;
    private String assignedAdminName;
    private ChatRoomStatus status;
    private LocalDateTime lastMessageAt;
    private Integer unreadUserCount;
    private Integer unreadAdminCount;
}
