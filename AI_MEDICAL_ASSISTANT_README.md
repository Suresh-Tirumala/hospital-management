# AI Medical Assistant Module

## Overview

This module adds an AI-powered medical educational assistant to the Hospital Management System with:

- **Conversational Chatbot**: Natural language interaction with medical context
- **Educational Content**: Explains medical conditions, treatments, and health topics
- **Rehabilitation Guidance**: Provides exercise recommendations and rehabilitation plans
- **Markdown Support**: Beautifully formatted responses with headers, tables, and lists
- **Conversation History**: Persistent chat sessions with search functionality

## Setup

### 1. Backend Configuration

**Get OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

**Environment Variables:**
```bash
# Set your OpenAI API key
export OPENAI_API_KEY=sk-your-key-here

# Or on Windows PowerShell
$env:OPENAI_API_KEY="sk-your-key-here"
```

**Update application.properties:**
```properties
spring.ai.openai.api-key=${OPENAI_API_KEY}
spring.ai.openai.chat.options.model=gpt-4-turbo
spring.ai.openai.chat.options.temperature=0.3
```

### 2. Frontend Installation

```bash
cd hms-frontend
npm install react-markdown remark-gfm
```

### 3. Build & Run

**Backend:**
```bash
cd hms-backend
mvn clean install
mvn spring-boot:run
```

**Frontend:**
```bash
cd hms-frontend
npm install
npm run dev
```

## API Endpoints

### Chat Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat/sessions` | Create new chat session |
| POST | `/ai/chat/sessions/{id}/messages` | Send message |
| GET | `/ai/chat/sessions/{id}/history` | Get conversation history |
| GET | `/ai/chat/sessions` | List user's sessions |
| PATCH | `/ai/chat/sessions/{id}/end` | End session |
| DELETE | `/ai/chat/sessions/{id}` | Delete session |

### Educational & Rehabilitation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/educational` | Get educational content on a topic |
| POST | `/ai/rehabilitation/guide` | Get rehabilitation guidance |
| GET | `/ai/rehabilitation/categories` | List rehab categories |

## Request/Response Examples

### Create Session
```bash
curl -X POST http://localhost:8081/api/ai/chat/sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"sessionType": "GENERAL", "title": "Health Question"}'
```

### Send Message
```bash
curl -X POST http://localhost:8081/api/ai/chat/sessions/AI-CHAT-123/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "What are the symptoms of diabetes?"}'
```

### Get Rehabilitation Guide
```bash
curl -X POST http://localhost:8081/api/ai/rehabilitation/guide \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"condition": "lower back pain", "severity": "moderate", "focusArea": "core"}'
```

## Features

### 1. Conversation Management
- Create multiple chat sessions
- Automatic session title generation
- Session history with pagination
- Delete/archive sessions

### 2. Medical Context
- Detects medical terms in messages
- Provides confidence scores for responses
- Maintains conversation context
- Safety disclaimers included

### 3. Rehabilitation Mode
- Toggle rehabilitation guidance mode
- Exercise recommendations with sets/reps
- Safety precautions
- Form instructions

### 4. Markdown Rendering
- Headers (h1-h3)
- Bullet and numbered lists
- Tables
- Code blocks
- Block quotes
- Links

### 5. Real-time Streaming
- Typing indicator while AI responds
- Stop generation button
- Streaming cursor animation

## Security

- All AI endpoints require authentication
- Role-based access (PATIENT, DOCTOR, ADMIN)
- Message content validation
- Rate limiting (10 messages/minute)
- Medical disclaimer in all responses

## Database Schema

**ai_chat_sessions**: Stores conversation sessions
**ai_chat_messages**: Stores individual messages
**ai_rehabilitation_guides**: Predefined rehab exercises

## Prompt Engineering

The AI assistant uses carefully crafted prompts:
- Educational focus (not diagnostic)
- Safety disclaimers
- Markdown formatting
- Medical term explanations
- Professional recommendations

## Troubleshooting

**Issue: "AI response slow"**
- Check OpenAI API key is valid
- Check network connectivity
- Consider using smaller model (gpt-3.5-turbo)

**Issue: "AI gives medical advice"**
- System prompt includes safety guidelines
- Response includes disclaimer
- Not a replacement for professional care

**Issue: "Session not found"**
- Check user authentication
- Verify session belongs to current user
- Sessions auto-expire after 24 hours

## Production Best Practices

1. **API Key Security**: Use environment variables, never commit keys
2. **Rate Limiting**: Implement per-user limits
3. **Caching**: Cache common medical content
4. **Monitoring**: Track AI usage and costs
5. **Fallback**: Provide fallback responses if AI unavailable
6. **Logging**: Log all AI interactions for audit

## License

Part of Hospital Management System