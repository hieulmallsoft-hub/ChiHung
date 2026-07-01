package com.sportshop.entity;

import com.sportshop.enums.ChatRoomStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "chat_rooms", indexes = {
        @Index(name = "idx_chat_rooms_status", columnList = "status")
})
public class ChatRoom extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_admin_id")
    private User assignedAdmin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ChatRoomStatus status = ChatRoomStatus.OPEN;

    @Column
    private LocalDateTime lastMessageAt;

    @Column
    private LocalDateTime resolvedAt;

    @Column(nullable = false)
    private Integer unreadUserCount = 0;

    @Column(nullable = false)
    private Integer unreadAdminCount = 0;
}
