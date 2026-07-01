package com.sportshop.chatbot;

import com.sportshop.config.ChatbotProperties;
import com.sportshop.dto.chat.MessageResponse;
import com.sportshop.entity.ChatRoom;
import com.sportshop.entity.Message;
import com.sportshop.entity.Role;
import com.sportshop.entity.User;
import com.sportshop.enums.MessageType;
import com.sportshop.enums.RoleName;
import com.sportshop.enums.UserStatus;
import com.sportshop.exception.ResourceNotFoundException;
import com.sportshop.mapper.ChatMapper;
import com.sportshop.repository.ChatRoomRepository;
import com.sportshop.repository.MessageRepository;
import com.sportshop.repository.RoleRepository;
import com.sportshop.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.UUID;

@Service
public class ChatbotReplyService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ChatMapper chatMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatbotProperties properties;

    public ChatbotReplyService(ChatRoomRepository chatRoomRepository,
                               MessageRepository messageRepository,
                               UserRepository userRepository,
                               RoleRepository roleRepository,
                               PasswordEncoder passwordEncoder,
                               ChatMapper chatMapper,
                               SimpMessagingTemplate messagingTemplate,
                               ChatbotProperties properties) {
        this.chatRoomRepository = chatRoomRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.chatMapper = chatMapper;
        this.messagingTemplate = messagingTemplate;
        this.properties = properties;
    }

    @Transactional
    public MessageResponse saveReply(UUID roomId,
                                     UUID triggeringMessageId,
                                     String content,
                                     BotReplyMode mode) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng chat"));

        if (mode == BotReplyMode.RESOLVED_BY_BOT && Boolean.FALSE.equals(room.getBotEnabled())) {
            return null;
        }

        Message triggeringMessage = messageRepository.findById(triggeringMessageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin nhắn"));
        User bot = getOrCreateBotUser();

        Message reply = new Message();
        reply.setRoom(room);
        reply.setSender(bot);
        reply.setMessageType(MessageType.BOT);
        reply.setContent(content);
        reply.setReadByAdmin(true);
        reply.setReadByUser(false);

        if (mode == BotReplyMode.RESOLVED_BY_BOT) {
            if (!triggeringMessage.isReadByAdmin()) {
                triggeringMessage.setReadByAdmin(true);
                messageRepository.save(triggeringMessage);
                room.setUnreadAdminCount(Math.max(0, room.getUnreadAdminCount() - 1));
            }
        } else {
            room.setBotEnabled(false);
            room.setBotHandoffAt(LocalDateTime.now());
        }

        room.setUnreadUserCount(room.getUnreadUserCount() + 1);
        room.setLastMessageAt(LocalDateTime.now());
        chatRoomRepository.save(room);

        Message saved = messageRepository.save(reply);
        MessageResponse response = chatMapper.toMessageResponse(saved);
        messagingTemplate.convertAndSend("/topic/chat/" + room.getId(), response);
        return response;
    }

    private User getOrCreateBotUser() {
        return userRepository.findByEmailAndDeletedFalse(properties.getBotEmail())
                .orElseGet(() -> {
                    Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                            .orElseGet(() -> {
                                Role role = new Role();
                                role.setName(RoleName.ROLE_ADMIN);
                                return roleRepository.save(role);
                            });

                    User bot = new User();
                    bot.setEmail(properties.getBotEmail());
                    bot.setFullName(properties.getBotName());
                    bot.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    bot.setEnabled(false);
                    bot.setDeleted(false);
                    bot.setStatus(UserStatus.ACTIVE);
                    bot.setRoles(new HashSet<>());
                    bot.getRoles().add(adminRole);
                    return userRepository.save(bot);
                });
    }
}
