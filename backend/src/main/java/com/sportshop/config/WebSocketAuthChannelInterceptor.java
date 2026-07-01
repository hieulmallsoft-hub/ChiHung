package com.sportshop.config;

import com.sportshop.repository.ChatRoomRepository;
import com.sportshop.security.CustomUserDetailsService;
import com.sportshop.security.jwt.JwtService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private static final String CHAT_TOPIC_PREFIX = "/topic/chat/";
    private static final String ADMIN_TOPIC_PREFIX = "/topic/admin/";

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final ChatRoomRepository chatRoomRepository;

    public WebSocketAuthChannelInterceptor(JwtService jwtService,
                                           CustomUserDetailsService userDetailsService,
                                           ChatRoomRepository chatRoomRepository) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.chatRoomRepository = chatRoomRepository;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();
        if (command == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(command)) {
            authenticate(accessor);
            return message;
        }

        if ((StompCommand.SEND.equals(command) || StompCommand.SUBSCRIBE.equals(command)) && accessor.getUser() == null) {
            authenticate(accessor);
        }

        if (StompCommand.SUBSCRIBE.equals(command)) {
            authorizeSubscription(accessor);
        }

        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String rawAuthHeader = firstNonBlank(
                accessor.getFirstNativeHeader("Authorization"),
                accessor.getFirstNativeHeader("authorization")
        );

        if (rawAuthHeader == null || !rawAuthHeader.startsWith("Bearer ")) {
            throw new AccessDeniedException("Thiếu header Authorization cho websocket");
        }

        String token = rawAuthHeader.substring(7).trim();
        String username;
        try {
            username = jwtService.extractUsernameFromAccessToken(token);
        } catch (Exception ex) {
            throw new AccessDeniedException("Access token cho websocket không hợp lệ");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (!jwtService.isAccessTokenValid(token, userDetails)) {
            throw new AccessDeniedException("Access token đã hết hạn hoặc không hợp lệ");
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        accessor.setUser(authentication);
    }

    private void authorizeSubscription(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null) {
            return;
        }

        UserDetails userDetails = currentUser(accessor);
        boolean admin = userDetails.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        if (destination.startsWith(ADMIN_TOPIC_PREFIX)) {
            if (!admin) {
                throw new AccessDeniedException("Bạn không có quyền theo dõi kênh quản trị");
            }
            return;
        }

        if (!destination.startsWith(CHAT_TOPIC_PREFIX) || admin) {
            return;
        }

        UUID roomId = parseRoomId(destination);
        if (roomId == null || !chatRoomRepository.existsByIdAndUserEmail(roomId, userDetails.getUsername())) {
            throw new AccessDeniedException("Bạn không có quyền theo dõi phòng chat này");
        }
    }

    private UserDetails currentUser(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken authentication
                && authentication.getPrincipal() instanceof UserDetails userDetails) {
            return userDetails;
        }

        authenticate(accessor);
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken authentication
                && authentication.getPrincipal() instanceof UserDetails userDetails) {
            return userDetails;
        }

        throw new AccessDeniedException("Không thể xác thực websocket");
    }

    private UUID parseRoomId(String destination) {
        String rawId = destination.substring(CHAT_TOPIC_PREFIX.length());
        try {
            return UUID.fromString(rawId);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        if (second != null && !second.isBlank()) {
            return second;
        }
        return null;
    }
}
