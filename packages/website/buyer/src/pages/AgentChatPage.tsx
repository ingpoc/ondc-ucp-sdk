import { AgentChat } from '@ondc-website/shared/components';

const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  padding: '0',
};

const CONTENT_STYLE = {
  maxWidth: '100%',
  padding: '0 48px',
};

const HEADER_STYLE = {
  marginBottom: '48px',
  padding: '56px 48px 40px 48px',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  borderBottom: '2px solid #e2e8f0',
  textAlign: 'center' as const,
};

const PAGE_TITLE_STYLE = {
  fontSize: '48px',
  fontWeight: 800,
  letterSpacing: '-2px',
  color: '#0f172a',
  margin: '0 0 16px 0',
};

const DESCRIPTION_STYLE = {
  fontSize: '16px',
  color: '#475569',
  margin: '0',
  lineHeight: 1.6,
};

export function AgentChatPage(): JSX.Element {
  return (
    <div style={PAGE_CONTAINER_STYLE}>
      <div style={CONTENT_STYLE}>
        <div style={HEADER_STYLE}>
          <h1 style={PAGE_TITLE_STYLE}>Buyer Agent Assistant</h1>
          <p style={DESCRIPTION_STYLE}>
            Chat with the AI agent to search products, compare options, and get personalized recommendations.
          </p>
        </div>
        <AgentChat
          endpoint="/api/agent/buyer"
          title="Buyer Agent"
          placeholder="e.g., Find organic mangoes under ₹500"
        />
      </div>
    </div>
  );
}
