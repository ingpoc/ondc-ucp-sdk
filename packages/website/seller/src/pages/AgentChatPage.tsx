import React from 'react';
import { AgentChat } from '@ondc-website/shared/components';

export function AgentChatPage(): React.ReactElement {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Seller Agent Assistant</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Chat with the AI agent to manage your catalog, optimize listings, and analyze pricing.
      </p>
      <AgentChat
        endpoint="/api/agent/seller"
        title="Seller Agent"
        placeholder="e.g., Add a new product to my catalog"
      />
    </div>
  );
}
