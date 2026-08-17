import React, { Suspense } from 'react';
import { MdHealthAndSafety } from 'react-icons/md';
import ChatInterface from '../components/ChatInterface';
import '../styles/chat.css';

function PageLoader() {
  return (
    <div className="ai-page-loading">
      <div className="ai-loading-spinner" />
      <span>Loading Medical Assistant...</span>
    </div>
  );
}

export default function MedicalAssistantPage() {
  return (
    <div className="medical-assistant-page">
      <div className="assistant-page-header">
        <div className="assistant-header-brand">
          <div className="assistant-logo">
            <MdHealthAndSafety />
          </div>
          <div className="assistant-brand-text">
            <h1>Medical AI Assistant</h1>
            <p>Ask about medical conditions, treatments, or health topics</p>
          </div>
        </div>
      </div>

      <div className="assistant-chat-container">
        <Suspense fallback={<PageLoader />}>
          <ChatInterface />
        </Suspense>
      </div>
    </div>
  );
}