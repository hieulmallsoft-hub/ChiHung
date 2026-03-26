package com.sportshop.entity;

import com.sportshop.enums.MessageType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "messages", indexes = {
        @Index(name = "idx_messages_room_created", columnList = "room_id,createdAt")
})
public class Message extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageType messageType = MessageType.TEXT;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private boolean deleted = false;

    private java.time.LocalDateTime editedAt;

    private java.time.LocalDateTime deletedAt;

    @Column(nullable = false)
    private boolean readByUser = false;

    @Column(nullable = false)
    private boolean readByAdmin = false;
}
