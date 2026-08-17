package com.hms.ai.repository;

import com.hms.ai.model.ChatSession;
import com.hms.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    Optional<ChatSession> findBySessionId(String sessionId);

    Page<ChatSession> findByUserOrderByLastActivityAtDesc(User user, Pageable pageable);

    @Query("SELECT s FROM ChatSession s WHERE s.user = :user AND s.status = 'ACTIVE' ORDER BY s.lastActivityAt DESC")
    List<ChatSession> findActiveSessionsByUser(@Param("user") User user);

    @Query("SELECT s FROM ChatSession s WHERE s.user.id = :userId ORDER BY s.lastActivityAt DESC")
    Page<ChatSession> findByUserIdOrderByLastActivityAtDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(s) FROM ChatSession s WHERE s.user = :user AND s.status = 'ACTIVE'")
    long countActiveSessionsByUser(@Param("user") User user);

    @Query("SELECT s FROM ChatSession s WHERE s.sessionId = :sessionId AND s.user = :user")
    Optional<ChatSession> findBySessionIdAndUser(@Param("sessionId") String sessionId, @Param("user") User user);

    void deleteByUser(User user);
}