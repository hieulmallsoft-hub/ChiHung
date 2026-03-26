package com.sportshop.websocket;

import com.sportshop.dto.chat.SendMessageRequest;
import com.sportshop.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatSocketController {

    private final ChatService chatService;

    public ChatSocketController(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload @Valid WebSocketChatRequest request, Principal principal) {
        if (principal == null || principal.getName() == null) {
            return;
        }

        SendMessageRequest sendMessageRequest = new SendMessageRequest();
        sendMessageRequest.setRoomId(request.getRoomId());
        sendMessageRequest.setContent(request.getContent());
        chatService.sendMessage(principal.getName(), sendMessageRequest);
    }
}
