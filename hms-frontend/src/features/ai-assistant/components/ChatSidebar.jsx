import React, { useState } from 'react';
import { FiSearch, FiPlus, FiTrash2, FiClock, FiMessageSquare, FiChevronRight, FiX } from 'react-icons/fi';
import { MdHealthAndSafety } from 'react-icons/md';
import { useChat } from '../hooks/useChat';

export default function ChatSidebar({ showSidebar, showMobileSidebar, onCloseMobile }) {
  const { sessions, currentSession, selectSession, createSession, deleteSession, loadSessions } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filteredSessions = (sessions || []).filter(session => 
    session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.sessionId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewSession = async (type) => {
    setIsCreating(true);
    try {
      await createSession('GENERAL', 'New Chat');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getSessionIcon = (type) => {
    switch (type) {
      case 'REHABILITATION': return '🦾';
      case 'EDUCATIONAL': return '📚';
      default: return '💬';
    }
  };

  if (!showSidebar && !showMobileSidebar) return null;

  return (
    <>
      {showMobileSidebar && (
        <div className="sidebar-overlay" onClick={onCloseMobile} />
      )}
      
      <aside className={`chat-sidebar ${showSidebar ? 'desktop' : 'mobile'} ${showMobileSidebar ? 'show-mobile' : ''}`}>
        <div className="sidebar-header" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', color: 'white' }}>
          <h3 style={{ color: 'white' }}>
            <FiMessageSquare style={{ color: '#3b82f6' }} /> Conversations
          </h3>
          <button className="close-sidebar" onClick={onCloseMobile} style={{ color: 'white', opacity: 0.7 }}>
            <FiX />
          </button>
        </div>

        <div className="sidebar-search">
          <div className="search-input-wrapper" style={{ position: 'relative' }}>
            <FiSearch className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px' }}
            />
          </div>
        </div>

        <div className="new-session-buttons" style={{ padding: '0 20px 20px', display: 'flex', gap: '10px' }}>
          <button 
            className="new-session-btn primary"
            onClick={() => handleNewSession('GENERAL')}
            disabled={isCreating}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <FiPlus /> New Chat
          </button>
        </div>

        <div className="sessions-list" style={{ flex: 1, overflowY: 'auto', padding: '0 12px 20px' }}>
          {filteredSessions.length === 0 ? (
            <div className="no-sessions" style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <FiMessageSquare size={40} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>No conversations yet</p>
              <span style={{ fontSize: '12px' }}>Start a new chat to begin</span>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.sessionId}
                className={`session-item ${currentSession?.sessionId === session.sessionId ? 'active' : ''}`}
                onClick={() => selectSession(session)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  marginBottom: '8px',
                  transition: 'all 0.2s ease',
                  background: currentSession?.sessionId === session.sessionId ? '#eff6ff' : 'transparent',
                  border: currentSession?.sessionId === session.sessionId ? '1px solid #3b82f6' : '1px solid transparent'
                }}
              >
                <div className="session-icon" style={{ width: '36px', height: '36px', borderRadius: '10px', background: session.sessionType === 'REHABILITATION' ? '#fef3c7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', flexShrink: 0, fontSize: '18px' }}>
                  {getSessionIcon(session.sessionType)}
                </div>
                <div className="session-info" style={{ flex: 1, minWidth: 0 }}>
                  <span className="session-title" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {session.title || 'New Chat'}
                  </span>
                  <span className="session-meta" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    <FiClock size={10} /> {formatDate(session.lastActivityAt || session.createdAt)}
                    <span style={{ opacity: 0.5 }}>•</span>
                    {session.messageCount || 0} messages
                  </span>
                </div>
                <div className="session-actions" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.sessionId);
                    }}
                    title="Delete session"
                    style={{ padding: '6px', borderRadius: '6px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                  <FiChevronRight className="chevron" style={{ color: '#cbd5e1' }} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer" style={{ padding: '16px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
            <MdHealthAndSafety style={{ verticalAlign: 'middle', marginRight: '4px', color: '#3b82f6' }} />
            Medical Assistant Educational Tool
          </p>
        </div>
      </aside>
    </>
  );
}