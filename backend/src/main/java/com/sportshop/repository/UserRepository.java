package com.sportshop.repository;

import com.sportshop.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailAndDeletedFalse(String email);

    boolean existsByEmail(String email);

    Page<User> findByDeletedFalse(Pageable pageable);

    Page<User> findByDeletedFalseAndFullNameContainingIgnoreCase(String keyword, Pageable pageable);

    long countByDeletedFalse();
}
