import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageBubble, type SDKMessage } from './MessageBubble.js';

interface AgentChatProps {
  endpoint: '/api/agent/buyer' | '/api/agent/seller';
  placeholder?: string;
  title?: string;
  sessionId?: string;
  onMessage?: (message: SDKMessage) => void;
}

export function AgentChat({
  endpoint,
  placeholder = 'Type your message...',
  title = 'Agent Chat',
  sessionId: initialSessionId = '',
  onMessage
}: AgentChatProps): React.ReactElement {
  const [messages, setMessages] = useState<SDKMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(initialSessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: SDKMessage = {
      type: 'user',
      content: input
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001' + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: input,
          sessionId,
          context: {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: SDKMessage = JSON.parse(line.slice(6));

              if (data.type === 'result' && data.subtype === 'success') {
                if (data.session_id) {
                  setSessionId(data.session_id);
                }
                setIsLoading(false);
              } else if (data.type === 'result' && data.subtype === 'error_during_execution') {
                setMessages((prev) => [...prev, data]);
                setIsLoading(false);
                break;
              } else {
                setMessages((prev) => [...prev, data]);
              }

              onMessage?.(data);
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: SDKMessage = {
        type: 'result',
        subtype: 'error_during_execution',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      setMessages((prev) => [...prev, errorMessage]);
      onMessage?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="agent-chat"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '600px',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        overflow: 'hidden'
      }}
    >
      <div
        className="chat-header"
        style={{
          padding: '1rem',
          borderBottom: '1px solid #eee',
          backgroundColor: '#f8f9fa',
          fontWeight: 'bold'
        }}
      >
        {title}
        {sessionId && (
          <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '0.5rem' }}>
            Session: {sessionId.slice(0, 8)}
          </span>
        )}
      </div>

      <div
        className="chat-messages"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {isLoading && (
          <div
            className="typing-indicator"
            style={{
              padding: '0.5rem 1rem',
              color: '#666',
              fontSize: '0.875rem'
            }}
          >
            Agent is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div
        className="chat-input"
        style={{
          padding: '1rem',
          borderTop: '1px solid #eee',
          display: 'flex',
          gap: '0.5rem'
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            border: '1px solid #ddd',
            borderRadius: '0.25rem',
            fontSize: '1rem'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: isLoading || !input.trim() ? '#ccc' : '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          Send
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
