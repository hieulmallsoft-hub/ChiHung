package com.sportshop.service.impl;

import com.sportshop.dto.chat.ChatRoomResponse;
import com.sportshop.dto.chat.MessageResponse;
import com.sportshop.dto.chat.SendMessageRequest;
import com.sportshop.entity.ChatRoom;
import com.sportshop.entity.Message;
import com.sportshop.entity.User;
import com.sportshop.enums.ChatRoomStatus;
import com.sportshop.exception.BadRequestException;
import com.sportshop.exception.ForbiddenException;
import com.sportshop.exception.ResourceNotFoundException;
import com.sportshop.mapper.ChatMapper;
import com.sportshop.repository.ChatRoomRepository;
import com.sportshop.repository.MessageRepository;
import com.sportshop.repository.UserRepository;
import com.sportshop.service.ChatService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ChatServiceImpl implements ChatService {

    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final ChatMapper chatMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatServiceImpl(UserRepository userRepository,
                           ChatRoomRepository chatRoomRepository,
                           MessageRepository messageRepository,
                           ChatMapper chatMapper,
                           SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.messageRepository = messageRepository;
        this.chatMapper = chatMapper;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    @Transactional
    public ChatRoomResponse openRoomForCurrentUser(String email) {
        User user = getUser(email);
        if (isAdmin(user)) {
            throw new BadRequestException("Admin cannot open user room");
        }

        List<ChatRoom> openRooms = chatRoomRepository.findByUserAndStatusOrderByLastMessageAtDesc(user, ChatRoomStatus.OPEN);
        ChatRoom room;

        if (openRooms.isEmpty()) {
            ChatRoom newRoom = new ChatRoom();
            newRoom.setUser(user);
            newRoom.setStatus(ChatRoomStatus.OPEN);
            newRoom.setLastMessageAt(LocalDateTime.now());
            room = chatRoomRepository.save(newRoom);
        } else {
            room = openRooms.get(0);

            // Backward-compatible cleanup for old duplicated OPEN rooms.
            if (openRooms.size() > 1) {
                LocalDateTime now = LocalDateTime.now();
                for (int i = 1; i < openRooms.size(); i++) {
                    ChatRoom duplicate = openRooms.get(i);
                    duplicate.setStatus(ChatRoomStatus.RESOLVED);
                    duplicate.setResolvedAt(now);
                    duplicate.setUnreadAdminCount(0);
                    duplicate.setUnreadUserCount(0);
                }
                chatRoomRepository.saveAll(openRooms.subList(1, openRooms.size()));
            }
        }

        return chatMapper.toRoomResponse(room);
    }

    @Override
    public Page<ChatRoomResponse> getMyRooms(String email, int page, int size) {
        User user = getUser(email);
        Pageable pageable = PageRequest.of(page, size);
        return chatRoomRepository.findByUserOrderByLastMessageAtDesc(user, pageable)
                .map(chatMapper::toRoomResponse);
    }

    @Override
    public Page<ChatRoomResponse> getAdminRooms(String keyword, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        if (keyword != null && !keyword.isBlank()) {
            return chatRoomRepository.findByUserFullNameContainingIgnoreCaseOrderByLastMessageAtDesc(keyword, pageable)
                    .map(chatMapper::toRoomResponse);
        }

        if (status != null && !status.isBlank()) {
            return chatRoomRepository.findByStatusOrderByLastMessageAtDesc(ChatRoomStatus.valueOf(status), pageable)
                    .map(chatMapper::toRoomResponse);
        }

        return chatRoomRepository.findAll(pageable).map(chatMapper::toRoomResponse);
    }

    @Override
    public Page<MessageResponse> getMessages(String email, UUID roomId, int page, int size) {
        User user = getUser(email);
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        ensurePermission(user, room);

        return messageRepository.findByRoomOrderByCreatedAtAsc(room, PageRequest.of(page, size))
                .map(chatMapper::toMessageResponse);
    }

    @Override
    @Transactional
    public MessageResponse sendMessage(String email, SendMessageRequest request) {
        User sender = getUser(email);
        ChatRoom room = chatRoomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        ensurePermission(sender, room);

        Message message = new Message();
        message.setRoom(room);
        message.setSender(sender);
        message.setContent(request.getContent());

        if (isAdmin(sender)) {
            room.setAssignedAdmin(sender);
            room.setUnreadUserCount(room.getUnreadUserCount() + 1);
            message.setReadByAdmin(true);
            message.setReadByUser(false);
        } else {
            room.setUnreadAdminCount(room.getUnreadAdminCount() + 1);
            message.setReadByUser(true);
            message.setReadByAdmin(false);
        }

        room.setLastMessageAt(LocalDateTime.now());
        chatRoomRepository.save(room);
        message = messageRepository.save(message);

        MessageResponse response = chatMapper.toMessageResponse(message);
        messagingTemplate.convertAndSend("/topic/chat/" + room.getId(), response);

        return response;
    }

    @Override
    @Transactional
    public void markRead(String email, UUID roomId) {
        User user = getUser(email);
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        ensurePermission(user, room);

        var messages = messageRepository.findByRoom(room);
        if (isAdmin(user)) {
            room.setUnreadAdminCount(0);
            messages.forEach(msg -> msg.setReadByAdmin(true));
        } else {
            room.setUnreadUserCount(0);
            messages.forEach(msg -> msg.setReadByUser(true));
        }

        messageRepository.saveAll(messages);
        chatRoomRepository.save(room);
    }

    @Override
    @Transactional
    public ChatRoomResponse resolveRoom(UUID roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        room.setStatus(ChatRoomStatus.RESOLVED);
        room.setResolvedAt(LocalDateTime.now());
        room.setUnreadAdminCount(0);
        room.setUnreadUserCount(0);
        return chatMapper.toRoomResponse(chatRoomRepository.save(room));
    }

    @Override
    @Transactional
    public MessageResponse editMessageAsAdmin(UUID messageId, String content) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (message.isDeleted()) {
            throw new BadRequestException("Message already deleted");
        }

        message.setContent(content.trim());
        message.setEditedAt(LocalDateTime.now());
        Message saved = messageRepository.save(message);

        MessageResponse response = chatMapper.toMessageResponse(saved);
        messagingTemplate.convertAndSend("/topic/chat/" + saved.getRoom().getId(), response);
        return response;
    }

    @Override
    @Transactional
    public MessageResponse deleteMessageAsAdmin(UUID messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.isDeleted()) {
            message.setDeleted(true);
            message.setDeletedAt(LocalDateTime.now());
        }

        Message saved = messageRepository.save(message);
        MessageResponse response = chatMapper.toMessageResponse(saved);
        messagingTemplate.convertAndSend("/topic/chat/" + saved.getRoom().getId(), response);
        return response;
    }

    private void ensurePermission(User user, ChatRoom room) {
        if (isAdmin(user)) {
            return;
        }
        if (!room.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You are not allowed to access this room");
        }
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> role.getName().name().equals("ROLE_ADMIN"));
    }

    private User getUser(String email) {
        return userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
