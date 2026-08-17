package com.hms.ai.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_chat_sessions")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private com.hms.model.User user;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String sessionType = "GENERAL";

    @Column(length = 100)
    @Builder.Default
    private String title = "New Chat";

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<ChatMessage> messages = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Integer messageCount = 0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime lastActivityAt;

    @Column
    private LocalDateTime endedAt;

    public void addMessage(ChatMessage message) {
        messages.add(message);
        message.setSession(this);
        this.messageCount++;
        this.lastActivityAt = LocalDateTime.now();
    }

    public void endSession() {
        this.status = "COMPLETED";
        this.endedAt = LocalDateTime.now();
    }
}