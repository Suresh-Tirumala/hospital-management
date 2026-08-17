package com.hms.ai.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.*;

@Service
@Slf4j
public class GroqService {

    private final WebClient webClient;
    
    @Value("${groq.api.key:}")
    private String groqApiKey;
    
    @Value("${groq.api.url:https://api.groq.com/openai/v1}")
    private String groqApiUrl;
    
    @Value("${groq.default-model:llama-3.3-70b-versatile}")
    private String defaultModel;
    
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

    public GroqService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl(groqApiUrl)
                .defaultHeader("Authorization", "Bearer " + groqApiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public String chat(String userMessage) {
        return chat(Collections.singletonList(Map.of("role", "user", "content", userMessage)), null, defaultModel);
    }

    public String chat(String userMessage, String systemPrompt) {
        return chat(Collections.singletonList(Map.of("role", "user", "content", userMessage)), systemPrompt, defaultModel);
    }

    public String chat(List<Map<String, String>> conversation, String customSystemPrompt) {
        return chat(conversation, customSystemPrompt, defaultModel);
    }

    public String chat(List<Map<String, String>> conversation, String customSystemPrompt, String model) {
        if (groqApiKey == null || groqApiKey.isEmpty()) {
            log.warn("Groq API key not configured, returning fallback response");
            String lastUserMessage = conversation.get(conversation.size() - 1).get("content");
            return getFallbackResponse(lastUserMessage);
        }

        try {
            Map<String, Object> requestBody = buildChatRequest(conversation, customSystemPrompt, model);
            
            Map<String, Object> response = webClient.post()
                    .uri("/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();
            
            return extractMessage(response);
            
        } catch (Exception e) {
            log.error("Groq API call failed: {}", e.getMessage());
            String lastUserMessage = conversation.get(conversation.size() - 1).get("content");
            return getFallbackResponse(lastUserMessage);
        }
    }

    private Map<String, Object> buildChatRequest(List<Map<String, String>> conversation, String customSystemPrompt, String model) {
        List<Map<String, String>> messages = new ArrayList<>();
        
        String systemContent = customSystemPrompt != null && !customSystemPrompt.isEmpty() 
                ? customSystemPrompt 
                : SYSTEM_PROMPT;
        
        messages.add(Map.of(
                "role", "system",
                "content", systemContent
        ));
        
        messages.addAll(conversation);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.3);
        requestBody.put("max_tokens", 2000);
        
        return requestBody;
    }

    @SuppressWarnings("unchecked")
    private String extractMessage(Map<String, Object> response) {
        if (response == null || !response.containsKey("choices")) {
            return "I apologize, but I'm unable to process your request at the moment. Please try again later.";
        }
        
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        if (choices.isEmpty()) {
            return "I apologize, but I'm unable to process your request at the moment.";
        }
        
        Map<String, Object> firstChoice = choices.get(0);
        Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
        
        return message != null && message.get("content") != null 
                ? message.get("content").toString() 
                : "I apologize, but I'm unable to process your request at the moment.";
    }

    private String getFallbackResponse(String userMessage) {
        String lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.contains("headache") || lowerMessage.contains("migraine")) {
            return """
                ## Headache Relief Recommendations
                
                ### Immediate Relief
                * **Rest:** Find a quiet, dark room to lie down.
                * **Hydration:** Drink plenty of water throughout the day.
                * **Cold/Warm Compress:** Apply a cool cloth or a heating pad to the forehead or neck.
                * **Gentle Massage:** Gently rub your temples or neck muscles.
                
                ### Common Types of Headaches
                | Type | Description | Common Triggers |
                | :--- | :--- | :--- |
                | Tension | Dull, aching sensation all over | Stress, poor posture |
                | Migraine | Intense pulsing or throbbing | Light, sound, certain foods |
                | Cluster | Severe pain around one eye | Alcohol, smoking |
                
                ### When to Seek Emergency Medical Help
                * **Sudden/Severe:** "The worst headache of your life."
                * **Accompanying Symptoms:** Fever, stiff neck, confusion, seizures, or vision loss.
                * **Post-Injury:** Headache after a fall or head injury.
                
                > **Disclaimer:** This information is for educational purposes only. Please consult a healthcare professional for proper diagnosis.
                """;
        }
        
        if (lowerMessage.contains("diabetes") || lowerMessage.contains("blood sugar")) {
            return """
                ## Understanding Diabetes & Blood Sugar
                
                ### Key Lifestyle Management
                1. **Healthy Eating:** Focus on fiber-rich fruits, vegetables, and whole grains.
                2. **Physical Activity:** Regular exercise helps your body use insulin better.
                3. **Monitoring:** Regularly check your blood sugar levels as directed by your doctor.
                
                ### Common Symptoms (Hyperglycemia)
                * Increased thirst and frequent urination
                * Blurred vision
                * Fatigue or weakness
                * Slow-healing sores
                
                ### Important Reminder
                Managing diabetes is a lifelong commitment. Work closely with your healthcare team to develop a personalized care plan.
                
                > **Disclaimer:** This information is for educational purposes only. Always consult your endocrinologist or primary care physician.
                """;
        }
        
        if (lowerMessage.contains("heart") || lowerMessage.contains("cardiovascular")) {
            return """
                ## Heart Health & Cardiovascular Wellness
                
                ### 5 Pillars of Heart Health
                * **Diet:** Low in saturated fats, trans fats, and sodium.
                * **Exercise:** At least 150 minutes of moderate aerobic activity per week.
                * **Weight:** Maintaining a healthy body mass index (BMI).
                * **Smoking:** Avoiding tobacco in all forms.
                * **Stress:** Managing stress through meditation or hobbies.
                
                ### Warning Signs (Call Emergency Services)
                * Chest pain or pressure (Angina)
                * Shortness of breath
                * Numbness or weakness in limbs
                * Pain in the neck, jaw, or throat
                
                ### Prevention
                Regular screenings for blood pressure and cholesterol are essential for early detection of potential issues.
                
                > **Disclaimer:** This information is for educational purposes only. Consult a cardiologist for specific heart-related concerns.
                """;
        }
        
        if (lowerMessage.contains("back pain") || lowerMessage.contains("backache")) {
            return """
                ## Back Pain Management & Recovery
                
                ### Recommended Gentle Stretches
                * **Child's Pose:** Stretches the lower back and promotes relaxation.
                * **Knee-to-Chest:** Relieves tension in the lower spine.
                * **Pelvic Tilts:** Strengthens abdominal muscles to support the back.
                
                ### Daily Posture Tips
                * **Sitting:** Keep your feet flat on the floor and back supported.
                * **Standing:** Distribute weight evenly on both feet.
                * **Lifting:** Bend your knees and lift with your legs, not your back.
                
                ### When to Consult a Specialist
                * Pain that doesn't improve with rest.
                * Numbness, tingling, or weakness in the legs.
                * Pain accompanied by unexplained weight loss.
                
                > **Disclaimer:** This information is for educational purposes only. Consult a physical therapist or doctor for persistent pain.
                """;
        }
        
        return """
            ## Medical Assistant: How Can I Help?
            
            Thank you for reaching out. I'm here to provide educational medical information to help you understand health topics better.
            
            ### Popular Topics You Can Ask About:
            * **Conditions:** Diabetes, Hypertension, Asthma, etc.
            * **Symptoms:** What a persistent cough or fatigue might mean.
            * **Rehabilitation:** Exercises for recovery after surgery or injury.
            * **Wellness:** Nutrition, sleep hygiene, and stress management.
            
            ### Quick Tips for Better Health:
            1. **Stay Hydrated:** Drink at least 8 glasses of water a day.
            2. **Move Daily:** Aim for 30 minutes of light activity.
            3. **Sleep Well:** Target 7-9 hours of quality sleep.
            
            How can I assist you with your health education today?
            
            > **Disclaimer:** This information is for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.
            """;
    }

    public boolean isConfigured() {
        return groqApiKey != null && !groqApiKey.isEmpty();
    }

    public String getStatus() {
        if (isConfigured()) {
            return "Connected to Groq API with model: " + defaultModel;
        }
        return "Using fallback responses (Groq API key not configured)";
    }
}
