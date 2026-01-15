import React from 'react';
import { AgentChat } from '@ondc-website/shared/components';

export function AgentChatPage(): React.ReactElement {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Buyer Agent Assistant</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Chat with the AI agent to search products, compare options, and get recommendations.
      </p>
      <AgentChat
        endpoint="/api/agent/buyer"
        title="Buyer Agent"
        placeholder="e.g., Find organic mangoes under ₹500"
      />
    </div>
  );
}
