import { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react';
import { DRAMS, SPACING, TYPOGRAPHY, BUTTON, RADIUS, CARD, TRANSITIONS } from '../tokens';

// Types based on Agent SDK message format
export interface AgentChatMessage {
  type: 'user' | 'assistant' | 'result';
  subtype?: string;
  content?: string;
  timestamp?: number;
  status?: string;
  data?: any;
  error?: string;
  errors?: string[];
}

export interface AgentChatProps {
  /** API endpoint for the agent */
  endpoint: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Title displayed in the chat header */
  title?: string;
  /** Session ID for conversation persistence */
  sessionId?: string;
  /** Callback when a message is received */
  onMessage?: (message: AgentChatMessage) => void;
  /** Fixed height for the chat container (default: 600px) */
  height?: CSSProperties['height'];
  /** Whether to show the empty state message */
  showEmptyState?: boolean;
  /** Empty state message */
  emptyStateMessage?: string;
}

const STORAGE_KEY = 'ondc-session-id';

// DRAMS: Clean card container with subtle shadow
const CHAT_CONTAINER_STYLE = (height: CSSProperties['height']): CSSProperties => ({
  ...CARD.base,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  height: height || '600px',
  overflow: 'hidden',
});

const HEADER_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${SPACING.md} ${SPACING.xl}`,
  borderBottom: `1px solid ${DRAMS.grayTrack}`,
  backgroundColor: '#ffffff',
};

const HEADER_TITLE_STYLE: CSSProperties = {
  ...TYPOGRAPHY.label,
  color: DRAMS.textDark,
  margin: 0,
};

const SESSION_ID_STYLE: CSSProperties = {
  ...TYPOGRAPHY.bodySmall,
  color: DRAMS.textLight,
};

const MESSAGES_CONTAINER_STYLE: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: SPACING.xl,
  display: 'flex',
  flexDirection: 'column',
  gap: SPACING.md,
};

// DRAMS: User message - aligned right, orange accent
const USER_MESSAGE_STYLE: CSSProperties = {
  alignSelf: 'flex-end',
  maxWidth: '70%',
};

const USER_BUBBLE_STYLE: CSSProperties = {
  backgroundColor: DRAMS.orange,
  color: 'white',
  padding: `${SPACING.sm} ${SPACING.lg}`,
  borderRadius: RADIUS.lg,
  ...TYPOGRAPHY.body,
};

// DRAMS: Assistant message - aligned left, gray bubble
const ASSISTANT_MESSAGE_STYLE: CSSProperties = {
  alignSelf: 'flex-start',
  maxWidth: '70%',
};

const ASSISTANT_BUBBLE_STYLE: CSSProperties = {
  backgroundColor: DRAMS.grayTrack,
  color: DRAMS.textDark,
  padding: `${SPACING.sm} ${SPACING.lg}`,
  borderRadius: RADIUS.lg,
  ...TYPOGRAPHY.body,
};

const TYPING_INDICATOR_STYLE: CSSProperties = {
  ...TYPOGRAPHY.bodySmall,
  color: DRAMS.textLight,
  padding: `${SPACING.sm} ${SPACING.md}`,
  backgroundColor: DRAMS.grayTrack,
  borderRadius: RADIUS.pill,
  alignSelf: 'flex-start',
};

const INPUT_CONTAINER_STYLE: CSSProperties = {
  padding: SPACING.lg,
  borderTop: `1px solid ${DRAMS.grayTrack}`,
  display: 'flex',
  gap: SPACING.md,
  alignItems: 'center',
};

// DRAMS: Pill-shaped input with gray track
const INPUT_STYLE = {
  flex: 1,
  border: 'none',
  borderRadius: RADIUS.pill,
  padding: `${SPACING.md} ${SPACING.xl}`,
  fontSize: TYPOGRAPHY.body.fontSize,
  color: DRAMS.textDark,
  backgroundColor: DRAMS.grayTrack,
  fontFamily: DRAMS.fontFamily,
  transition: TRANSITIONS.standard,
};

// DRAMS: Orange gradient send button
const SEND_BUTTON_STYLE = (disabled: boolean): CSSProperties => ({
  ...BUTTON.primary,
  padding: `${SPACING.md} ${SPACING.xl}`,
  opacity: disabled ? 0.5 : 1,
  cursor: disabled ? 'not-allowed' : 'pointer',
});

const EMPTY_STATE_STYLE: CSSProperties = {
  ...TYPOGRAPHY.body,
  color: DRAMS.textLight,
  textAlign: 'center',
  padding: SPACING['3xl'],
};

const ERROR_MESSAGE_STYLE: CSSProperties = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  padding: `${SPACING.sm} ${SPACING.md}`,
  borderRadius: RADIUS.md,
  ...TYPOGRAPHY.bodySmall,
  alignSelf: 'flex-start',
};

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
 * Simple message bubble renderer
 * TODO: Replace with MessageBubble component for card support
 */
function MessageBubble({ message }: { message: AgentChatMessage }) {
  if (message.type === 'user') {
    return (
      <div style={USER_MESSAGE_STYLE}>
        <div style={USER_BUBBLE_STYLE}>
          {message.content}
        </div>
      </div>
    );
  }

  if (message.type === 'result' && message.subtype === 'error_during_execution') {
    return (
      <div style={ERROR_MESSAGE_STYLE}>
        {message.errors?.join(', ') || message.error || 'An error occurred'}
      </div>
    );
  }

  // Assistant/agent messages
  return (
    <div style={ASSISTANT_MESSAGE_STYLE}>
      <div style={ASSISTANT_BUBBLE_STYLE}>
        {message.content || (message.data as any)?.text || JSON.stringify(message.data)}
      </div>
    </div>
  );
}

/**
 * Handle SSE stream parsing and message dispatching
 */
async function processStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onMessage: (data: AgentChatMessage) => void,
  onComplete: () => void,
  onError: (error: AgentChatMessage) => void
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
        const data: AgentChatMessage = JSON.parse(line.slice(6));

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

const API_BASE = 'http://localhost:3001';

/**
 * AgentChat - DRAMS-styled chat component for AI agent interactions
 *
 * DRAMS Principles Applied:
 * - Useful: Clear input, visible messages, obvious send action
 * - Understandable: Familiar chat interface with typing indicator
 * - Unobtrusive: Clean card design, minimal chrome
 * - Honest: Visual feedback for loading/error states
 *
 * @example
 * ```tsx
 * <AgentChat
 *   endpoint="/api/agent/buyer"
 *   title="Shopping Assistant"
 *   placeholder="Ask me anything about products..."
 *   height="500px"
 * />
 * ```
 */
export function AgentChat({
  endpoint,
  placeholder = 'Type your message...',
  title = 'Agent Chat',
  sessionId: initialSessionId = '',
  onMessage,
  height,
  showEmptyState = true,
  emptyStateMessage = 'Start a conversation with the AI agent',
}: AgentChatProps): JSX.Element {
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(initialSessionId || getSharedSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessageWithPrompt = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || isLoading) return;

      const userMessage: AgentChatMessage = {
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
            setIsLoading(false);
          },
          (error) => {
            setMessages((prev) => [...prev, error]);
            setIsLoading(false);
          }
        );
      } catch (error) {
        const errorMessage: AgentChatMessage = {
          type: 'result',
          subtype: 'error_during_execution',
          errors: [error instanceof Error ? error.message : 'Unknown error']
        };
        setMessages((prev) => [...prev, errorMessage]);
        onMessage?.(errorMessage);
        setIsLoading(false);
      }
    },
    [endpoint, isLoading, sessionId, onMessage]
  );

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    await sendMessageWithPrompt(input);
  }, [input, isLoading, sendMessageWithPrompt]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isInputDisabled = isLoading || !input.trim();

  return (
    <div className="agent-chat" style={CHAT_CONTAINER_STYLE(height)}>
      {/* Header */}
      <div className="chat-header" style={HEADER_STYLE}>
        <span style={HEADER_TITLE_STYLE}>{title}</span>
        {sessionId && (
          <span style={SESSION_ID_STYLE}>
            Session: {sessionId.slice(0, 8)}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages" style={MESSAGES_CONTAINER_STYLE}>
        {showEmptyState && messages.length === 0 && (
          <div style={EMPTY_STATE_STYLE}>
            {emptyStateMessage}
          </div>
        )}
        {messages.map((message, index) => (
          <MessageBubble
            key={`${message.type}-${index}-${message.timestamp || Date.now()}`}
            message={message}
          />
        ))}
        {isLoading && (
          <div className="typing-indicator" style={TYPING_INDICATOR_STYLE}>
            Agent is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
          style={SEND_BUTTON_STYLE(isInputDisabled)}
        >
          Send
        </button>
      </div>
    </div>
  );
}
