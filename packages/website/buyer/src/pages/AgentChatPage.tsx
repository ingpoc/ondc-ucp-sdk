import { AgentChat } from '@ondc-website/shared/components';
import { PageLayout, PageHeader, DRAMS, SPACING, TYPOGRAPHY } from '@ondc-agent/shared/design-system';

const DESCRIPTION_STYLE = {
  ...TYPOGRAPHY.body,
  color: DRAMS.textLight,
  margin: '0',
  lineHeight: 1.6,
};

export function AgentChatPage(): JSX.Element {
  return (
    <PageLayout>
      <PageHeader
        title="Buyer Agent Assistant"
        subtitle="Chat with the AI agent to search products, compare options, and get personalized recommendations."
      />
      <AgentChat
        endpoint="/api/agent/buyer"
        title="Buyer Agent"
        placeholder="e.g., Find organic mangoes under ₹500"
      />
    </PageLayout>
  );
}
