import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiSquare, FiCpu } from 'react-icons/fi';
import { MdHealthAndSafety } from 'react-icons/md';
import { useChat } from '../hooks/useChat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import '../styles/chat.css';

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    currentSession,
    isSending,
    sendMessage,
    stopGeneration,
  } = useChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentSession]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    const content = inputValue.trim();
    setInputValue('');
    await sendMessage(content);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-interface" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-icon">
              <MdHealthAndSafety />
            </div>
            <h3>Medical Assistant</h3>
            <p>Ask about medical conditions, treatments, or health topics</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble key={message.id || index} message={message} />
            ))}
            {isSending && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="chat-input-container">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about medical conditions, treatments, or health topics..."
            disabled={isSending}
            rows={1}
          />
          <div className="input-actions">
            <FiCpu className="ai-input-icon" />
            {isSending ? (
              <button className="stop-btn" onClick={stopGeneration} title="Stop generation">
                <FiSquare />
              </button>
            ) : (
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!inputValue.trim()}
                title="Send message"
              >
                <FiSend />
              </button>
            )}
          </div>
        </div>
        <p className="input-disclaimer">
          AI assistant for educational purposes only. Always consult a licensed healthcare professional for medical advice.
        </p>
      </div>
    </div>
  );
}
