package com.hms.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

public class ChatDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateSessionRequest {
        @NotBlank(message = "Session type is required")
        private String sessionType;

        private String title;

        private String context;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SendMessageRequest {
        @NotBlank(message = "Message content is required")
        @Size(max = 4000, message = "Message must not exceed 4000 characters")
        private String content;

        private String context;

        private Boolean includeRehabilitation = false;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SessionResponse {
        private Long id;
        private String sessionId;
        private String sessionType;
        private String title;
        private String status;
        private Integer messageCount;
        private String createdAt;
        private String lastActivityAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MessageResponse {
        private Long id;
        private String senderType;
        private String content;
        private String messageType;
        private Double confidenceScore;
        private java.util.List<String> detectedMedicalTerms;
        private String createdAt;
        private Boolean isStreaming;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatHistoryResponse {
        private SessionResponse session;
        private java.util.List<MessageResponse> messages;
        private Boolean hasMore;
        private Integer totalPages;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RehabilitationGuideRequest {
        @NotBlank(message = "Condition is required")
        private String condition;

        private String severity;
        private String focusArea;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RehabilitationGuideResponse {
        private String conditionName;
        private String category;
        private String exerciseName;
        private String description;
        private String instructions;
        private Integer sets;
        private Integer reps;
        private Integer durationSeconds;
        private String difficultyLevel;
        private String precautions;
        private Boolean videoAvailable;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EducationalContentRequest {
        @NotBlank(message = "Topic is required")
        private String topic;

        private String detailLevel;
        private String audience;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EducationalContentResponse {
        private String topic;
        private String content;
        private String format;
        private java.util.List<String> keyTerms;
        private java.util.List<String> relatedTopics;
        private String disclaimer;
    }
}