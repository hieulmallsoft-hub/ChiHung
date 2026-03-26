package com.sportshop.controller;

import com.sportshop.dto.chat.ChatRoomResponse;
import com.sportshop.dto.chat.MessageResponse;
import com.sportshop.dto.chat.SendMessageRequest;
import com.sportshop.dto.common.ApiResponse;
import com.sportshop.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/rooms/open")
    public ResponseEntity<ApiResponse<ChatRoomResponse>> openRoom(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Room opened", chatService.openRoomForCurrentUser(authentication.getName())));
    }

    @GetMapping("/rooms/me")
    public ResponseEntity<ApiResponse<Page<ChatRoomResponse>>> myRooms(Authentication authentication,
                                                                       @RequestParam(defaultValue = "0") int page,
                                                                       @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("My rooms", chatService.getMyRooms(authentication.getName(), page, size)));
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ApiResponse<Page<MessageResponse>>> messages(Authentication authentication,
                                                                       @PathVariable UUID roomId,
                                                                       @RequestParam(defaultValue = "0") int page,
                                                                       @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Messages", chatService.getMessages(authentication.getName(), roomId, page, size)));
    }

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(Authentication authentication,
                                                                    @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Message sent", chatService.sendMessage(authentication.getName(), request)));
    }

    @PostMapping("/rooms/{roomId}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(Authentication authentication,
                                                      @PathVariable UUID roomId) {
        chatService.markRead(authentication.getName(), roomId);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }
}
