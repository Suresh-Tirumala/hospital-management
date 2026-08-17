import React, { Suspense } from 'react';
import { MdHealthAndSafety, MdAutoAwesome } from 'react-icons/md';
import { GiBrain } from 'react-icons/gi';
import { FiZap } from 'react-icons/fi';
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
            <p>Powered by advanced healthcare AI for education & rehabilitation guidance</p>
          </div>
        </div>
        <div className="assistant-header-badges">
          <span className="ai-badge ai-badge-blue">
            <GiBrain /> Medical Knowledge
          </span>
          <span className="ai-badge ai-badge-green">
            <FiZap /> Real-time Responses
          </span>
          <span className="ai-badge ai-badge-purple">
            <MdAutoAwesome /> AI Powered
          </span>
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