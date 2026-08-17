package com.hms.ai.repository;

import com.hms.ai.model.ChatMessage;
import com.hms.ai.model.ChatSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Page<ChatMessage> findBySessionOrderByCreatedAtDesc(ChatSession session, Pageable pageable);

    Page<ChatMessage> findBySessionIdOrderByCreatedAtDesc(Long sessionId, Pageable pageable);

    @Query("SELECT m FROM ChatMessage m WHERE m.session = :session ORDER BY m.createdAt ASC")
    List<ChatMessage> findAllBySessionOrderByCreatedAtAsc(@Param("session") ChatSession session);

    @Query("SELECT m FROM ChatMessage m WHERE m.session = :session ORDER BY m.createdAt DESC LIMIT :limit")
    List<ChatMessage> findRecentMessagesBySession(@Param("session") ChatSession session, @Param("limit") int limit);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.session = :session")
    long countBySession(@Param("session") ChatSession session);

    @Query("SELECT m FROM ChatMessage m WHERE m.session.user.id = :userId AND m.createdAt > :since")
    List<ChatMessage> findUserMessagesSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    @Query("SELECT m FROM ChatMessage m WHERE m.session.id = :sessionId AND m.senderType = 'USER' ORDER BY m.createdAt DESC")
    List<ChatMessage> findUserMessagesBySessionId(@Param("sessionId") Long sessionId);

    void deleteBySession(ChatSession session);
}