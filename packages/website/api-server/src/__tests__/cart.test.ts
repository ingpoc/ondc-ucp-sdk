/**
 * Cart API endpoints unit tests
 * Tests for SDK-BUYER-CART-001
 */

import { describe, it, expect } from 'vitest';
import type { UCPSession, BecknItem, UCPSessionItem } from '@ondc-agent/shared';

const API_BASE = 'http://localhost:3001';

interface CartResponse {
  success?: boolean;
  session: UCPSession;
  error?: string;
}

// Sample item for testing
const sampleItem: BecknItem = {
  id: 'item-test-1',
  descriptor: {
    name: 'Test Product',
    short_desc: 'Test product for cart',
  },
  price: {
    value: '100',
    currency: 'INR',
  },
};

describe('Cart API endpoints', () => {
  const sessionId = 'test-session-' + Date.now();

  it('GET /api/cart - should create empty session', async () => {
    const response = await fetch(`${API_BASE}/api/cart?sessionId=${sessionId}`);
    expect(response.status).toBe(200);

    const data = (await response.json()) as CartResponse;
    expect(data.session).toBeDefined();
    expect(data.session.id).toBe(sessionId);
    expect(data.session.status).toBe('created');
    expect(data.session.items).toEqual([]);
  });

  it('POST /api/cart - should add item to cart', async () => {
    const response = await fetch(`${API_BASE}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        item: sampleItem,
        quantity: 2,
      }),
    });

    expect(response.status).toBe(200);

    const data = (await response.json()) as CartResponse;
    expect(data.success).toBe(true);
    expect(data.session.items).toHaveLength(1);
    expect(data.session.items[0].item.id).toBe(sampleItem.id);
    expect(data.session.items[0].quantity).toBe(2);
    expect(data.session.status).toBe('items_selected');
  });

  it('POST /api/cart - should increment quantity for existing item', async () => {
    const response = await fetch(`${API_BASE}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        item: sampleItem,
        quantity: 1,
      }),
    });

    expect(response.status).toBe(200);

    const data = (await response.json()) as CartResponse;
    expect(data.success).toBe(true);
    expect(data.session.items).toHaveLength(1);
    expect(data.session.items[0].quantity).toBe(3); // 2 + 1
  });

  it('POST /api/cart - should add different item', async () => {
    const secondItem: BecknItem = {
      id: 'item-test-2',
      descriptor: {
        name: 'Test Product 2',
        short_desc: 'Second test product',
      },
      price: {
        value: '200',
        currency: 'INR',
      },
    };

    const response = await fetch(`${API_BASE}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        item: secondItem,
        quantity: 1,
      }),
    });

    expect(response.status).toBe(200);

    const data = (await response.json()) as CartResponse;
    expect(data.success).toBe(true);
    expect(data.session.items).toHaveLength(2);
  });

  it('PUT /api/cart/:itemId - should update item quantity', async () => {
    const response = await fetch(`${API_BASE}/api/cart/${sampleItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        quantity: 5,
      }),
    });

    expect(response.status).toBe(200);

    const data = (await response.json()) as CartResponse;
    expect(data.success).toBe(true);
    const updatedItem = data.session.items.find(
      (item: UCPSessionItem) => item.item.id === sampleItem.id
    );
    expect(updatedItem?.quantity).toBe(5);
  });

  it('PUT /api/cart/:itemId - should remove item when quantity is 0', async () => {
    const response = await fetch(`${API_BASE}/api/cart/item-test-2`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        quantity: 0,
      }),
    });

    expect(response.status).toBe(200);

    const data = (await response.json()) as CartResponse;
    expect(data.success).toBe(true);
    expect(data.session.items).toHaveLength(1);
  });

  it('DELETE /api/cart/:itemId - should remove item from cart', async () => {
    const response = await fetch(
      `${API_BASE}/api/cart/${sampleItem.id}?sessionId=${sessionId}`,
      {
        method: 'DELETE',
      }
    );

    expect(response.status).toBe(200);

    const data = (await response.json()) as CartResponse;
    expect(data.success).toBe(true);
    expect(data.session.items).toHaveLength(0);
    expect(data.session.status).toBe('created'); // Reset to created when empty
  });

  it('DELETE /api/cart/:itemId - should return 404 for non-existent item', async () => {
    const response = await fetch(
      `${API_BASE}/api/cart/non-existent-item?sessionId=${sessionId}`,
      {
        method: 'DELETE',
      }
    );

    expect(response.status).toBe(404);

    const data = (await response.json()) as { error: string };
    expect(data.error).toBe('Item not found in cart');
  });

  it('POST /api/cart - should reject missing sessionId', async () => {
    const response = await fetch(`${API_BASE}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item: sampleItem,
        quantity: 1,
      }),
    });

    expect(response.status).toBe(400);

    const data = (await response.json()) as { error: string };
    expect(data.error).toContain('sessionId');
  });

  it('POST /api/cart - should reject missing item', async () => {
    const response = await fetch(`${API_BASE}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        quantity: 1,
      }),
    });

    expect(response.status).toBe(400);

    const data = (await response.json()) as { error: string };
    expect(data.error).toContain('item');
  });

  it('PUT /api/cart/:itemId - should reject invalid quantity', async () => {
    const response = await fetch(`${API_BASE}/api/cart/${sampleItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        quantity: -1,
      }),
    });

    expect(response.status).toBe(400);

    const data = (await response.json()) as { error: string };
    expect(data.error).toContain('quantity');
  });
});

