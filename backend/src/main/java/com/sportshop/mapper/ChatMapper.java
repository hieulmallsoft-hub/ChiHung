package com.sportshop.mapper;

import com.sportshop.dto.chat.ChatRoomResponse;
import com.sportshop.dto.chat.MessageResponse;
import com.sportshop.entity.ChatRoom;
import com.sportshop.entity.Message;
import org.springframework.stereotype.Component;

@Component
public class ChatMapper {

    public ChatRoomResponse toRoomResponse(ChatRoom room) {
        return ChatRoomResponse.builder()
                .id(room.getId())
                .userId(room.getUser().getId())
                .userName(room.getUser().getFullName())
                .assignedAdminId(room.getAssignedAdmin() != null ? room.getAssignedAdmin().getId() : null)
                .assignedAdminName(room.getAssignedAdmin() != null ? room.getAssignedAdmin().getFullName() : null)
                .status(room.getStatus())
                .lastMessageAt(room.getLastMessageAt())
                .unreadUserCount(room.getUnreadUserCount())
                .unreadAdminCount(room.getUnreadAdminCount())
                .build();
    }

    public MessageResponse toMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .roomId(message.getRoom().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName())
                .content(message.isDeleted() ? null : message.getContent())
                .deleted(message.isDeleted())
                .editedAt(message.getEditedAt())
                .deletedAt(message.getDeletedAt())
                .readByUser(message.isReadByUser())
                .readByAdmin(message.isReadByAdmin())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
