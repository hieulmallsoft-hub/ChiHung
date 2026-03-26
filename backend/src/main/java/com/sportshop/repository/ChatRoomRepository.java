package com.sportshop.repository;

import com.sportshop.entity.ChatRoom;
import com.sportshop.entity.User;
import com.sportshop.enums.ChatRoomStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {

    List<ChatRoom> findByUserAndStatusOrderByLastMessageAtDesc(User user, ChatRoomStatus status);

    Page<ChatRoom> findByUserOrderByLastMessageAtDesc(User user, Pageable pageable);

    Optional<ChatRoom> findByIdAndUser(UUID id, User user);

    Page<ChatRoom> findByStatusOrderByLastMessageAtDesc(ChatRoomStatus status, Pageable pageable);

    Page<ChatRoom> findByUserFullNameContainingIgnoreCaseOrderByLastMessageAtDesc(String keyword, Pageable pageable);
}
