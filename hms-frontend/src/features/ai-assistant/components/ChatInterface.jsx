import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiSquare, FiPlus, FiMenu, FiX, FiMessageSquare, FiCpu } from 'react-icons/fi';
import { MdHealthAndSafety } from 'react-icons/md';
import { useChat } from '../hooks/useChat';
import MessageBubble from './MessageBubble';
import ChatSidebar from './ChatSidebar';
import TypingIndicator from './TypingIndicator';
import '../styles/chat.css';

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { 
    messages, 
    currentSession, 
    isSending, 
    sendMessage, 
    stopGeneration,
    createSession,
    clearCurrentSession
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

  const handleNewChat = async () => {
    await createSession();
    clearCurrentSession();
  };

  const handleSuggestedPrompt = async (prompt) => {
    setInputValue(prompt);
    await sendMessage(prompt);
    setInputValue('');
  };

  return (
    <div className="chat-interface">
      <button 
        className="mobile-sidebar-toggle"
        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
        title="Toggle conversation history"
      >
        <FiMessageSquare />
      </button>

      <ChatSidebar 
        showSidebar={showSidebar} 
        showMobileSidebar={showMobileSidebar}
        onCloseMobile={() => setShowMobileSidebar(false)}
      />

      <div className={`chat-main ${showSidebar ? '' : 'full-width'}`}>
        <div className="chat-messages">
          {!currentSession && messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <MdHealthAndSafety />
              </div>
              <h3>Welcome to Medical Assistant</h3>
              <p>Ask about medical conditions, treatments, or health topics</p>
              <div className="capabilities">
                <div className="capability">
                  <span className="cap-icon">📚</span>
                  <span>Medical Education</span>
                </div>
                <div className="capability">
                  <span className="cap-icon">💊</span>
                  <span>Treatment Information</span>
                </div>
                <div className="capability">
                  <span className="cap-icon">⚕️</span>
                  <span>Health & Wellness</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {(messages || []).map((message, index) => (
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
    </div>
  );
}