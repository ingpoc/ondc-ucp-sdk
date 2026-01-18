import { AgentChat } from '@ondc-website/shared/components';
import { DRAMS, SPACING, TYPOGRAPHY } from '@ondc-agent/shared/design-system';

// DRAMS: Clean white page
const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  backgroundColor: '#ffffff',
  padding: '0',
};

const CONTENT_STYLE = {
  maxWidth: '100%',
  padding: `0 ${SPACING['3xl']}`,
};

// DRAMS: Gray track header (no gradient)
const HEADER_STYLE = {
  marginBottom: SPACING['3xl'],
  padding: `56px ${SPACING['3xl']} 40px ${SPACING['3xl']}`,
  background: DRAMS.grayTrack,
  borderBottom: 'none',
  textAlign: 'center' as const,
};

const PAGE_TITLE_STYLE = {
  ...TYPOGRAPHY.h1,
  color: DRAMS.textDark,
  margin: `0 0 ${SPACING.lg} 0`,
};

const DESCRIPTION_STYLE = {
  ...TYPOGRAPHY.body,
  color: DRAMS.textLight,
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
