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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
        return ResponseEntity.ok(ApiResponse.success("Đã mở phòng chat", chatService.openRoomForCurrentUser(authentication.getName())));
    }

    @GetMapping("/rooms/me")
    public ResponseEntity<ApiResponse<Page<ChatRoomResponse>>> myRooms(Authentication authentication,
                                                                       @RequestParam(defaultValue = "0") int page,
                                                                       @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Phòng chat của tôi", chatService.getMyRooms(authentication.getName(), page, size)));
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ApiResponse<Page<MessageResponse>>> messages(Authentication authentication,
                                                                       @PathVariable UUID roomId,
                                                                       @RequestParam(defaultValue = "0") int page,
                                                                       @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Danh sách tin nhắn", chatService.getMessages(authentication.getName(), roomId, page, size)));
    }

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(Authentication authentication,
                                                                    @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã gửi tin nhắn", chatService.sendMessage(authentication.getName(), request)));
    }

    @PostMapping("/rooms/{roomId}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(Authentication authentication,
                                                      @PathVariable UUID roomId) {
        chatService.markRead(authentication.getName(), roomId);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đã đọc", null));
    }
}
