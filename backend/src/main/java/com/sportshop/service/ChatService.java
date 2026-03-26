package com.sportshop.service;

import com.sportshop.dto.chat.ChatRoomResponse;
import com.sportshop.dto.chat.MessageResponse;
import com.sportshop.dto.chat.SendMessageRequest;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface ChatService {
    ChatRoomResponse openRoomForCurrentUser(String email);

    Page<ChatRoomResponse> getMyRooms(String email, int page, int size);

    Page<ChatRoomResponse> getAdminRooms(String keyword, String status, int page, int size);

    Page<MessageResponse> getMessages(String email, UUID roomId, int page, int size);

    MessageResponse sendMessage(String email, SendMessageRequest request);

    void markRead(String email, UUID roomId);

    ChatRoomResponse resolveRoom(UUID roomId);

    MessageResponse editMessageAsAdmin(UUID messageId, String content);

    MessageResponse deleteMessageAsAdmin(UUID messageId);
}
