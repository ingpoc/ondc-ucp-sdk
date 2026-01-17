import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageBubble, type SDKMessage } from './MessageBubble.js';

interface AgentChatProps {
  endpoint: '/api/agent/buyer' | '/api/agent/seller';
  placeholder?: string;
  title?: string;
  sessionId?: string;
  onMessage?: (message: SDKMessage) => void;
  onCardAction?: (action: string, itemId: string, quantity?: number) => void;
}

const API_BASE = 'http://localhost:3001';
const STORAGE_KEY = 'ondc-session-id';

// Constant styles hoisted outside component
const CHAT_CONTAINER_STYLE = {
  display: 'flex',
  flexDirection: 'column' as const,
  height: '100%',
  maxHeight: '600px',
  border: '1px solid #ddd',
  borderRadius: '0.5rem',
  overflow: 'hidden' as const
};

const HEADER_STYLE = {
  padding: '1rem',
  borderBottom: '1px solid #eee',
  backgroundColor: '#f8f9fa',
  fontWeight: 'bold' as const
};

const MESSAGES_CONTAINER_STYLE = {
  flex: 1,
  overflowY: 'auto' as const,
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column' as const
};

const INPUT_CONTAINER_STYLE = {
  padding: '1rem',
  borderTop: '1px solid #eee',
  display: 'flex',
  gap: '0.5rem'
};

const TYPING_INDICATOR_STYLE = {
  padding: '0.5rem 1rem',
  color: '#666',
  fontSize: '0.875rem'
};

const INPUT_STYLE = {
  flex: 1,
  padding: '0.5rem 0.75rem',
  border: '1px solid #ddd',
  borderRadius: '0.25rem',
  fontSize: '1rem'
} as const;

/**
 * Get or create session ID from localStorage
 * Shares the same session as useCart hook for cart persistence
 */
function getSharedSessionId(): string {
  let sessionId = localStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Handle SSE stream parsing and message dispatching
 */
async function processStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onMessage: (data: SDKMessage) => void,
  onComplete: () => void,
  onError: (error: SDKMessage) => void
) {
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      try {
        const data: SDKMessage = JSON.parse(line.slice(6));

        if (data.type === 'result' && data.subtype === 'success') {
          onComplete();
        } else if (data.type === 'result' && data.subtype === 'error_during_execution') {
          onError(data);
          break;
        } else {
          onMessage(data);
        }
      } catch (e) {
        console.error('Failed to parse SSE data:', e);
      }
    }
  }
}

export function AgentChat({
  endpoint,
  placeholder = 'Type your message...',
  title = 'Agent Chat',
  sessionId: initialSessionId = '',
  onMessage,
  onCardAction
}: AgentChatProps): React.ReactElement {
  const [messages, setMessages] = useState<SDKMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(initialSessionId || getSharedSessionId());
  const [compareItems, setCompareItems] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Core message sending function
  const sendMessageWithPrompt = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || isLoading) return;

      const userMessage: SDKMessage = {
        type: 'user',
        content: prompt,
        timestamp: Date.now()
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, sessionId, context: {} })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        await processStream(
          reader,
          (data) => {
            setMessages((prev) => [...prev, data]);
            onMessage?.(data);
          },
          () => {
            if (sessionId) setSessionId(sessionId);
            setIsLoading(false);
          },
          (error) => {
            setMessages((prev) => [...prev, error]);
            setIsLoading(false);
          }
        );
      } catch (error) {
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
    },
    [endpoint, isLoading, sessionId, onMessage]
  );

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    await sendMessageWithPrompt(input);
  }, [input, isLoading, sendMessageWithPrompt]);

  const handleCardAction = useCallback(
    async (action: string, itemId: string, quantity?: number) => {
      onCardAction?.(action, itemId, quantity);

      if (action === 'compare') {
        setCompareItems((prev) => {
          const newItems = prev.includes(itemId)
            ? prev.filter((id) => id !== itemId)
            : [...prev, itemId];

          if (newItems.length >= 2 && !prev.includes(itemId)) {
            setTimeout(() => {
              sendMessageWithPrompt(`Compare these items: ${newItems.join(', ')}`);
            }, 100);
          }
          return newItems;
        });
        return;
      }

      const actionMessages: Record<string, string> = {
        add_to_cart: `Add ${quantity || 1} of item ${itemId} to my cart`,
        view_details: `Show me details for item ${itemId}`,
        wishlist: `Add item ${itemId} to my wishlist`
      };

      const message = actionMessages[action];
      if (message) {
        await sendMessageWithPrompt(message);
      }
    },
    [onCardAction, sendMessageWithPrompt]
  );

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isInputDisabled = isLoading || !input.trim();

  return (
    <div className="agent-chat" style={CHAT_CONTAINER_STYLE}>
      <div className="chat-header" style={HEADER_STYLE}>
        {title}
        {sessionId && (
          <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '0.5rem' }}>
            Session: {sessionId.slice(0, 8)}
          </span>
        )}
      </div>

      <div className="chat-messages" style={MESSAGES_CONTAINER_STYLE}>
        {messages.map((message, index) => (
          <MessageBubble
            key={`${message.type}-${index}-${message.timestamp || Date.now()}`}
            message={message}
            onCardAction={handleCardAction}
          />
        ))}
        {isLoading && (
          <div className="typing-indicator" style={TYPING_INDICATOR_STYLE}>
            Agent is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input" style={INPUT_CONTAINER_STYLE}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          style={INPUT_STYLE}
        />
        <button
          onClick={sendMessage}
          disabled={isInputDisabled}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: isInputDisabled ? '#ccc' : '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: isInputDisabled ? 'not-allowed' : 'pointer',
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
