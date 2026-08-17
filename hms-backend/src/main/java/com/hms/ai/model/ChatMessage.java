package com.hms.ai.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_chat_messages")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;

    @Column(nullable = false, length = 20)
    private String senderType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 20)
    @Builder.Default
    private String messageType = "TEXT";

    @Column
    @Builder.Default
    private Double confidenceScore = 1.0;

    @Column(columnDefinition = "TEXT")
    private String context;

    @ElementCollection
    @CollectionTable(name = "ai_message_medical_terms", joinColumns = @JoinColumn(name = "message_id"))
    @Column(name = "medical_term")
    @Builder.Default
    private List<String> detectedMedicalTerms = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private Integer tokenCount;

    @Column
    private Long responseTimeMs;

    public boolean isFromUser() {
        return "USER".equals(senderType);
    }

    public boolean isFromAssistant() {
        return "ASSISTANT".equals(senderType);
    }
}