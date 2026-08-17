import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiCheck, FiAlertCircle, FiUser } from 'react-icons/fi';
import { MdHealthAndSafety } from 'react-icons/md';

export default function MessageBubble({ message }) {
  const { senderType, content, createdAt, isStreaming, confidenceScore } = message;
  
  const isUser = senderType === 'USER';
  const isAssistant = senderType === 'ASSISTANT';

  const renderedContent = useMemo(() => {
    if (isUser) {
      return content;
    }

    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="md-h1" {...props} />,
          h2: ({node, ...props}) => <h2 className="md-h2" {...props} />,
          h3: ({node, ...props}) => <h3 className="md-h3" {...props} />,
          p: ({node, ...props}) => <p className="md-p" {...props} />,
          ul: ({node, ...props}) => <ul className="md-ul" {...props} />,
          ol: ({node, ...props}) => <ol className="md-ol" {...props} />,
          li: ({node, ...props}) => <li className="md-li" {...props} />,
          code: ({node, ...props}) => <code className="md-code" {...props} />,
          pre: ({node, ...props}) => <pre className="md-pre" {...props} />,
          table: ({node, ...props}) => <table className="md-table" {...props} />,
          th: ({node, ...props}) => <th className="md-th" {...props} />,
          td: ({node, ...props}) => <td className="md-td" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="md-blockquote" {...props} />,
          a: ({node, ...props}) => <a className="md-link" target="_blank" rel="noopener noreferrer" {...props} />,
          strong: ({node, ...props}) => <strong className="md-strong" {...props} />,
          em: ({node, ...props}) => <em className="md-em" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }, [content, isUser]);

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'} ${isStreaming ? 'streaming' : ''}`}>
      <div className={`message-avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}`}>
        {isUser ? <FiUser /> : <MdHealthAndSafety />}
      </div>
      <div className="message-content">
        <div className="message-body">
          {renderedContent}
          {isStreaming && (
            <span className="streaming-cursor">▊</span>
          )}
        </div>
        <div className="message-meta">
          {createdAt && (
            <span className="message-time">
              {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {isAssistant && confidenceScore && (
            <span className="confidence-badge">
              <FiCheck /> {Math.round(confidenceScore * 100)}% confidence
            </span>
          )}
          {isAssistant && !content && isStreaming && (
            <div className="generating-indicator">
              <span className="dot-pulse"></span>
              <span>AI is thinking...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}