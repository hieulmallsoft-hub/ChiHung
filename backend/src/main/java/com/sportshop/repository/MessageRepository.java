package com.sportshop.repository;

import com.sportshop.entity.ChatRoom;
import com.sportshop.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    Page<Message> findByRoomOrderByCreatedAtAsc(ChatRoom room, Pageable pageable);

    List<Message> findByRoom(ChatRoom room);
}
