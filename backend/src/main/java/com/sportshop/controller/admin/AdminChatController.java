package com.sportshop.controller.admin;

import com.sportshop.dto.chat.ChatRoomResponse;
import com.sportshop.dto.chat.EditMessageRequest;
import com.sportshop.dto.chat.MessageResponse;
import com.sportshop.dto.common.ApiResponse;
import com.sportshop.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/chats")
public class AdminChatController {

    private final ChatService chatService;

    public AdminChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<Page<ChatRoomResponse>>> getRooms(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success("Danh sách phòng chat", chatService.getAdminRooms(keyword, status, page, size)));
    }

    @PutMapping("/rooms/{roomId}/resolve")
    public ResponseEntity<ApiResponse<ChatRoomResponse>> resolve(@PathVariable UUID roomId) {
        return ResponseEntity.ok(ApiResponse.success("Đã xử lý phòng chat", chatService.resolveRoom(roomId)));
    }

    @PutMapping("/messages/{messageId}")
    public ResponseEntity<ApiResponse<MessageResponse>> editMessage(@PathVariable UUID messageId,
                                                                    @Valid @RequestBody EditMessageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật tin nhắn", chatService.editMessageAsAdmin(messageId, request.getContent())));
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<ApiResponse<MessageResponse>> deleteMessage(@PathVariable UUID messageId) {
        return ResponseEntity.ok(ApiResponse.success("Đã xóa tin nhắn", chatService.deleteMessageAsAdmin(messageId)));
    }
}
