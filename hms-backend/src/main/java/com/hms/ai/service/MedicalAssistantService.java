package com.hms.ai.service;

import com.hms.ai.dto.ChatDTO;
import com.hms.ai.model.ChatMessage;
import com.hms.ai.model.ChatSession;
import com.hms.ai.model.RehabilitationGuide;
import com.hms.ai.repository.ChatMessageRepository;
import com.hms.ai.repository.ChatSessionRepository;
import com.hms.ai.repository.RehabilitationGuideRepository;
import com.hms.model.User;
import com.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicalAssistantService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final RehabilitationGuideRepository guideRepository;
    private final UserRepository userRepository;
    private final GroqService groqService;

    @Value("${hms.ai.max-conversation-history:20}")
    private int maxConversationHistory;

    private static final String SYSTEM_PROMPT = """
        You are a helpful medical educational assistant for a hospital management system.
        
        Guidelines:
        1. Provide educational information about medical conditions, treatments, and health topics
        2. Always recommend consulting healthcare professionals for specific medical advice
        3. Format responses with markdown for clarity (headers, bullet points, tables)
        4. Be compassionate and professional
        5. If asked about specific medical decisions, recommend professional consultation
        6. Use medically accurate terminology but explain it when needed
        7. Never provide definitive diagnoses or treatment plans
        8. Always include a disclaimer when providing medical information
        
        Format: Use markdown with ## for headings, * for bullet points, and | for tables.
        """;

    private static final String REHABILITATION_PROMPT = """
        You are a rehabilitation guidance assistant. Based on the described condition or question, 
        provide helpful rehabilitation and exercise guidance.
        
        Include:
        - Specific exercises with instructions
        - Sets, reps, and duration
        - Safety precautions
        - Warning signs to stop
        
        Format all responses with markdown for readability.
        """;

    @Transactional
    public ChatDTO.SessionResponse createSession(User user, ChatDTO.CreateSessionRequest request) {
        int activeSessions = (int) sessionRepository.countActiveSessionsByUser(user);
        if (activeSessions >= 5) {
            throw new RuntimeException("Maximum active sessions reached. Please end an existing session.");
        }

        String sessionId = "AI-CHAT-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        ChatSession session = ChatSession.builder()
                .sessionId(sessionId)
                .user(user)
                .sessionType(request.getSessionType() != null ? request.getSessionType() : "GENERAL")
                .title(request.getTitle() != null ? request.getTitle() : "New Chat")
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .lastActivityAt(LocalDateTime.now())
                .build();

        session = sessionRepository.save(session);

        log.info("Created new chat session: {} for user: {}", sessionId, user.getUsername());

        return toSessionResponse(session);
    }

    @Transactional
    public ChatDTO.MessageResponse sendMessage(User user, String sessionId, ChatDTO.SendMessageRequest request) {
        ChatSession session = sessionRepository.findBySessionIdAndUser(sessionId, user)
                .orElseThrow(() -> new RuntimeException("Session not found or access denied"));

        if ("COMPLETED".equals(session.getStatus())) {
            throw new RuntimeException("This session has ended. Please start a new conversation.");
        }

        long startTime = System.currentTimeMillis();

        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .senderType("USER")
                .content(request.getContent())
                .messageType("TEXT")
                .createdAt(LocalDateTime.now())
                .build();
        messageRepository.save(userMessage);

        List<ChatMessage> conversationHistory = messageRepository
                .findAllBySessionOrderByCreatedAtAsc(session);
        conversationHistory = conversationHistory.stream()
                .skip(Math.max(0, conversationHistory.size() - maxConversationHistory))
                .collect(Collectors.toList());

        String assistantResponse;
        List<String> detectedTerms = extractMedicalTerms(request.getContent());

        if (Boolean.TRUE.equals(request.getIncludeRehabilitation())) {
            assistantResponse = generateRehabilitationGuidance(request.getContent(), request.getContext());
        } else {
            assistantResponse = generateAIResponse(conversationHistory, request.getContent(), request.getContext());
        }

        long responseTime = System.currentTimeMillis() - startTime;

        ChatMessage assistantMessage = ChatMessage.builder()
                .session(session)
                .senderType("ASSISTANT")
                .content(assistantResponse)
                .messageType("TEXT")
                .confidenceScore(0.95)
                .detectedMedicalTerms(detectedTerms)
                .createdAt(LocalDateTime.now())
                .responseTimeMs(responseTime)
                .build();
        messageRepository.save(assistantMessage);

        session.setLastActivityAt(LocalDateTime.now());
        session.setMessageCount(session.getMessageCount() + 2);
        sessionRepository.save(session);

        log.info("AI response generated for session: {}, response time: {}ms", sessionId, responseTime);

        return toMessageResponse(assistantMessage, false);
    }

    private String generateAIResponse(List<ChatMessage> history, String userMessage, String context) {
        List<Map<String, String>> conversation = new ArrayList<>();
        
        for (ChatMessage msg : history) {
            String role = msg.isFromUser() ? "user" : "assistant";
            conversation.add(Map.of(
                "role", role,
                "content", msg.getContent()
            ));
        }
        
        // Add current user message
        conversation.add(Map.of(
            "role", "user",
            "content", userMessage
        ));
        
        String customSystemPrompt = context != null && !context.isEmpty()
                ? SYSTEM_PROMPT + "\n\nContext: " + context
                : SYSTEM_PROMPT;
        
        return groqService.chat(conversation, customSystemPrompt);
    }

    private String generateRehabilitationGuidance(String condition, String severity) {
        List<RehabilitationGuide> guides = guideRepository.findByConditionNameContainingIgnoreCaseAndIsActiveTrue(condition);

        if (!guides.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            sb.append("## Recommended Rehabilitation Exercises for ").append(condition).append("\n\n");

            for (RehabilitationGuide guide : guides) {
                sb.append("### ").append(guide.getExerciseName()).append("\n\n");
                sb.append("**Sets & Reps:** ").append(guide.getSets()).append(" sets x ").append(guide.getReps()).append(" reps\n\n");
                sb.append("**Instructions:**\n").append(guide.getInstructions()).append("\n\n");
                sb.append("**Precautions:** ").append(guide.getPrecautions()).append("\n\n");
            }

            return sb.toString();
        }

        String prompt = "Provide rehabilitation guidance for: " + condition + ". Severity: " + (severity != null ? severity : "unknown");
        return groqService.chat(prompt, REHABILITATION_PROMPT);
    }

    public ChatDTO.ChatHistoryResponse getChatHistory(String sessionId, User user, int page, int size) {
        ChatSession session = sessionRepository.findBySessionIdAndUser(sessionId, user)
                .orElseThrow(() -> new RuntimeException("Session not found or access denied"));

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessage> messagesPage = messageRepository.findBySessionIdOrderByCreatedAtDesc(session.getId(), pageable);

        List<ChatDTO.MessageResponse> messages = messagesPage.getContent().stream()
                .map(msg -> toMessageResponse(msg, false))
                .collect(Collectors.toList());

        ChatDTO.SessionResponse sessionResponse = toSessionResponse(session);
        ChatDTO.ChatHistoryResponse response = new ChatDTO.ChatHistoryResponse();
        response.setSession(sessionResponse);
        response.setMessages(messages);
        response.setHasMore(messagesPage.hasNext());
        response.setTotalPages(messagesPage.getTotalPages());

        return response;
    }

    public Page<ChatDTO.SessionResponse> getUserSessions(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatSession> sessions = sessionRepository.findByUserIdOrderByLastActivityAtDesc(user.getId(), pageable);
        return sessions.map(this::toSessionResponse);
    }

    @Transactional
    public void endSession(String sessionId, User user) {
        ChatSession session = sessionRepository.findBySessionIdAndUser(sessionId, user)
                .orElseThrow(() -> new RuntimeException("Session not found or access denied"));

        session.endSession();
        sessionRepository.save(session);

        log.info("Session {} ended by user {}", sessionId, user.getUsername());
    }

    @Transactional
    public void deleteSession(String sessionId, User user) {
        ChatSession session = sessionRepository.findBySessionIdAndUser(sessionId, user)
                .orElseThrow(() -> new RuntimeException("Session not found or access denied"));

        sessionRepository.delete(session);
        log.info("Session {} deleted by user {}", sessionId, user.getUsername());
    }

    public ChatDTO.EducationalContentResponse getEducationalContent(ChatDTO.EducationalContentRequest request) {
        String prompt = String.format("""
            Provide educational content about: %s
            
            Format with markdown including:
            - Clear headings
            - Key points in bullet form
            - Relevant medical terminology explained
            - When to seek professional help
            - A disclaimer at the end
            
            Detail level: %s
            Target audience: %s
            """,
                request.getTopic(),
                request.getDetailLevel() != null ? request.getDetailLevel() : "intermediate",
                request.getAudience() != null ? request.getAudience() : "general public"
        );

        String content = groqService.chat(prompt);

        List<String> terms = extractMedicalTerms(content);

        ChatDTO.EducationalContentResponse result = new ChatDTO.EducationalContentResponse();
        result.setTopic(request.getTopic());
        result.setContent(content);
        result.setFormat("markdown");
        result.setKeyTerms(terms);
        result.setRelatedTopics(extractRelatedTopics(content));
        result.setDisclaimer("This content is for educational purposes only. Always consult a healthcare professional for medical advice.");

        return result;
    }

    public ChatDTO.RehabilitationGuideResponse getRehabilitationGuide(ChatDTO.RehabilitationGuideRequest request) {
        List<RehabilitationGuide> guides = guideRepository.findByConditionNameContainingIgnoreCaseAndIsActiveTrue(request.getCondition());

        if (request.getFocusArea() != null) {
            guides = guides.stream()
                    .filter(g -> request.getFocusArea().equalsIgnoreCase(g.getConditionName()))
                    .collect(Collectors.toList());
        }

        if (guides.isEmpty()) {
            String prompt = String.format("""
                Provide a rehabilitation plan for %s (severity: %s, focus area: %s).
                Include exercises, sets, reps, precautions, and instructions.
                Format with markdown.
                """,
                    request.getCondition(),
                    request.getSeverity() != null ? request.getSeverity() : "moderate",
                    request.getFocusArea() != null ? request.getFocusArea() : "general"
            );

            String content = groqService.chat(prompt);

            ChatDTO.RehabilitationGuideResponse result = new ChatDTO.RehabilitationGuideResponse();
            result.setConditionName(request.getCondition());
            result.setCategory("AI Generated");
            result.setExerciseName("Custom Exercise Plan");
            result.setDescription(content);
            result.setSets(3);
            result.setReps(10);
            result.setDifficultyLevel("MODERATE");
            result.setInstructions("See description for AI-generated guidance.");

            return result;
        }

        RehabilitationGuide guide = guides.get(0);
        return ChatDTO.RehabilitationGuideResponse.builder()
                .conditionName(guide.getConditionName())
                .category(guide.getCategory())
                .exerciseName(guide.getExerciseName())
                .description(guide.getDescription())
                .instructions(guide.getInstructions())
                .sets(guide.getSets())
                .reps(guide.getReps())
                .durationSeconds(guide.getDurationSeconds())
                .difficultyLevel(guide.getDifficultyLevel())
                .precautions(guide.getPrecautions())
                .videoAvailable(guide.getVideoAvailable())
                .build();
    }

    private List<String> extractMedicalTerms(String text) {
        Set<String> terms = new HashSet<>();
        Pattern pattern = Pattern.compile("\\b([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)\\b");
        Matcher matcher = pattern.matcher(text);

        List<String> commonTerms = List.of(
                "diabetes", "hypertension", "asthma", "arthritis", "depression",
                "anxiety", "migraine", "influenza", "pneumonia", "bronchitis",
                "gastritis", "eczema", "psoriasis", "fibromyalgia", "osteoporosis"
        );

        for (String term : commonTerms) {
            if (text.toLowerCase().contains(term)) {
                terms.add(term.substring(0, 1).toUpperCase() + term.substring(1));
            }
        }

        return new ArrayList<>(terms);
    }

    private List<String> extractRelatedTopics(String content) {
        List<String> topics = new ArrayList<>();
        String[] lines = content.split("\n");

        for (String line : lines) {
            if (line.startsWith("##") && line.length() > 2) {
                topics.add(line.replace("##", "").trim());
            }
        }

        return topics.stream().limit(5).collect(Collectors.toList());
    }

    private ChatDTO.SessionResponse toSessionResponse(ChatSession session) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        return ChatDTO.SessionResponse.builder()
                .id(session.getId())
                .sessionId(session.getSessionId())
                .sessionType(session.getSessionType())
                .title(session.getTitle())
                .status(session.getStatus())
                .messageCount(session.getMessageCount())
                .createdAt(session.getCreatedAt() != null ? session.getCreatedAt().format(formatter) : null)
                .lastActivityAt(session.getLastActivityAt() != null ? session.getLastActivityAt().format(formatter) : null)
                .build();
    }

    private ChatDTO.MessageResponse toMessageResponse(ChatMessage message, boolean isStreaming) {
        return ChatDTO.MessageResponse.builder()
                .id(message.getId())
                .senderType(message.getSenderType())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .confidenceScore(message.getConfidenceScore())
                .detectedMedicalTerms(message.getDetectedMedicalTerms())
                .createdAt(message.getCreatedAt() != null ? message.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")) : null)
                .isStreaming(isStreaming)
                .build();
    }
}