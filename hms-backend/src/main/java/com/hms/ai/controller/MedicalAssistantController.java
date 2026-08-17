package com.hms.ai.controller;

import com.hms.ai.dto.ChatDTO;
import com.hms.ai.service.MedicalAssistantService;
import com.hms.model.User;
import com.hms.repository.UserRepository;
import com.hms.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Slf4j
public class MedicalAssistantController {

    private final MedicalAssistantService medicalAssistantService;
    private final UserRepository userRepository;

    @PostMapping("/chat/sessions")
    public ResponseEntity<ApiResponse<ChatDTO.SessionResponse>> createSession(
            @Valid @RequestBody ChatDTO.CreateSessionRequest request) {
        User user = getCurrentUser();
        ChatDTO.SessionResponse session = medicalAssistantService.createSession(user, request);
        return ResponseEntity.ok(ApiResponse.success("Chat session created", session));
    }

    @PostMapping("/chat/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<ChatDTO.MessageResponse>> sendMessage(
            @PathVariable String sessionId,
            @Valid @RequestBody ChatDTO.SendMessageRequest request) {
        User user = getCurrentUser();
        ChatDTO.MessageResponse response = medicalAssistantService.sendMessage(user, sessionId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/chat/sessions/{sessionId}/history")
    public ResponseEntity<ApiResponse<ChatDTO.ChatHistoryResponse>> getChatHistory(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        User user = getCurrentUser();
        ChatDTO.ChatHistoryResponse history = medicalAssistantService.getChatHistory(sessionId, user, page, size);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/chat/sessions")
    public ResponseEntity<ApiResponse<Page<ChatDTO.SessionResponse>>> getUserSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = getCurrentUser();
        Page<ChatDTO.SessionResponse> sessions = medicalAssistantService.getUserSessions(user, page, size);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @PatchMapping("/chat/sessions/{sessionId}/end")
    public ResponseEntity<ApiResponse<Void>> endSession(@PathVariable String sessionId) {
        User user = getCurrentUser();
        medicalAssistantService.endSession(sessionId, user);
        return ResponseEntity.ok(ApiResponse.success("Session ended", null));
    }

    @DeleteMapping("/chat/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable String sessionId) {
        User user = getCurrentUser();
        medicalAssistantService.deleteSession(sessionId, user);
        return ResponseEntity.ok(ApiResponse.success("Session deleted", null));
    }

    @PostMapping("/educational")
    public ResponseEntity<ApiResponse<ChatDTO.EducationalContentResponse>> getEducationalContent(
            @Valid @RequestBody ChatDTO.EducationalContentRequest request) {
        ChatDTO.EducationalContentResponse content = medicalAssistantService.getEducationalContent(request);
        return ResponseEntity.ok(ApiResponse.success(content));
    }

    @PostMapping("/rehabilitation/guide")
    public ResponseEntity<ApiResponse<ChatDTO.RehabilitationGuideResponse>> getRehabilitationGuide(
            @Valid @RequestBody ChatDTO.RehabilitationGuideRequest request) {
        ChatDTO.RehabilitationGuideResponse guide = medicalAssistantService.getRehabilitationGuide(request);
        return ResponseEntity.ok(ApiResponse.success(guide));
    }

    @GetMapping("/rehabilitation/categories")
    public ResponseEntity<ApiResponse<java.util.List<String>>> getRehabilitationCategories() {
        return ResponseEntity.ok(ApiResponse.success(java.util.List.of(
                "Orthopedic", "Neurological", "Cardiovascular", "Respiratory", "Sports Injury", "Post-Surgery"
        )));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}