import React from 'react';

export interface SDKMessage {
  type: 'assistant' | 'user' | 'result' | 'system' | 'tool_progress' | 'auth_status';
  subtype?: string;
  content?: string;
  result?: string;
  errors?: string[];
  tool_name?: string;
  session_id?: string;
  [key: string]: unknown;
}

interface MessageBubbleProps {
  message: SDKMessage;
}

export function MessageBubble({ message }: MessageBubbleProps): React.ReactElement | null {
  const isUser = message.type === 'user';
  const isAssistant = message.type === 'assistant';
  const isSystem = message.type === 'system';
  const isResult = message.type === 'result';
  const isToolProgress = message.type === 'tool_progress';

  // Don't render system messages
  if (isSystem && message.subtype === 'init') {
    return null;
  }

  // Extract content
  let content = '';

  if (isAssistant && typeof message.content === 'string') {
    content = message.content;
  } else if (isResult && message.result) {
    content = message.result;
  } else if (isResult && message.errors && message.errors.length > 0) {
    content = `Error: ${message.errors.join(', ')}`;
  } else if (isToolProgress && message.tool_name) {
    content = `Running ${message.tool_name}...`;
  }

  if (!content && !isToolProgress) {
    return null;
  }

  return (
    <div
      className={`message-bubble ${isUser ? 'user-message' : 'assistant-message'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '1rem',
        maxWidth: '80%'
      }}
    >
      {isToolProgress && (
        <div
          className="tool-indicator"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: '#666'
          }}
        >
          <span
            className="spinner"
            style={{
              display: 'inline-block',
              width: '1rem',
              height: '1rem',
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          <span>{message.tool_name}</span>
        </div>
      )}
      <div
        className="message-content"
        style={{
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          backgroundColor: isUser ? '#3498db' : '#f5f5f5',
          color: isUser ? '#fff' : '#333',
          wordBreak: 'break-word'
        }}
      >
        {content}
      </div>
    </div>
  );
}
