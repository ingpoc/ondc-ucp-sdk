/**
 * Cart API endpoints unit tests
 * Tests for SDK-BUYER-CART-001 and SDK-BUYER-CART-003
 */

import { describe, it, expect } from 'vitest';
import type { UCPSession, BecknItem, UCPSessionItem, UCPQuote } from '@ondc-agent/shared';

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

describe('Checkout API endpoint (SDK-BUYER-CART-003)', () => {
  const checkoutSessionId = 'checkout-session-' + Date.now();
  const testItem: BecknItem = {
    id: 'item-checkout-1',
    descriptor: {
      name: 'Organic Apples',
      short_desc: 'Fresh organic apples',
    },
    price: {
      value: '250',
      currency: 'INR',
    },
  };

  interface CheckoutResponse {
    success?: boolean;
    session?: UCPSession;
    quote?: UCPQuote;
    error?: string;
  }

  // Setup: Add item and buyer info before checkout tests
  it('Setup: Add item to cart and set buyer info', async () => {
    // Add item to cart
    const addResponse = await fetch(`${API_BASE}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: checkoutSessionId,
        item: testItem,
        quantity: 2,
      }),
    });
    expect(addResponse.status).toBe(200);

    // Update buyer info
    const buyerResponse = await fetch(`${API_BASE}/api/cart/buyer`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: checkoutSessionId,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+919876543210',
      }),
    });
    expect(buyerResponse.status).toBe(200);

    const buyerData = (await buyerResponse.json()) as CartResponse;
    expect(buyerData.success).toBe(true);
    expect(buyerData.session.buyer.name).toBe('John Doe');
  });

  it('POST /api/checkout - should reject missing sessionId', async () => {
    const response = await fetch(`${API_BASE}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);

    const data = (await response.json()) as { error: string };
    expect(data.error).toContain('sessionId');
  });

  it('POST /api/checkout - should reject non-existent session', async () => {
    const response = await fetch(`${API_BASE}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'non-existent-session',
      }),
    });

    expect(response.status).toBe(404);

    const data = (await response.json()) as { error: string };
    expect(data.error).toContain('Session not found');
  });

  it('POST /api/checkout - should reject empty cart', async () => {
    const emptySessionId = 'empty-session-' + Date.now();

    // Create empty session
    await fetch(`${API_BASE}/api/cart?sessionId=${emptySessionId}`);

    const response = await fetch(`${API_BASE}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: emptySessionId,
      }),
    });

    expect(response.status).toBe(400);

    const data = (await response.json()) as { error: string };
    expect(data.error).toContain('empty');
  });

  it('POST /api/checkout - should reject missing buyer information', async () => {
    // Use a fresh session without buyer info
    const noBuyerSessionId = 'no-buyer-session-' + Date.now();

    // Add item without setting buyer info
    await fetch(`${API_BASE}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: noBuyerSessionId,
        item: testItem,
        quantity: 1,
      }),
    });

    const response = await fetch(`${API_BASE}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: noBuyerSessionId,
      }),
    });

    expect(response.status).toBe(400);

    const data = (await response.json()) as { error: string };
    expect(data.error).toContain('buyer information');
  });

  it('POST /api/checkout - should generate quote with proper calculations', async () => {
    const response = await fetch(`${API_BASE}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: checkoutSessionId,
      }),
    });

    expect(response.status).toBe(200);

    const data = (await response.json()) as CheckoutResponse;
    expect(data.success).toBe(true);
    expect(data.quote).toBeDefined();
    expect(data.session).toBeDefined();

    // Validate quote structure
    const quote = data.quote!;
    expect(quote.subtotal).toBeDefined();
    expect(quote.total).toBeDefined();
    expect(quote.deliveryCost).toBeDefined();
    expect(quote.tax).toBeDefined();
    expect(quote.breakup).toBeDefined();

    // Validate calculations (2 items * 250 = 500)
    expect(parseFloat(quote.subtotal.value!)).toBe(500);
    expect(quote.subtotal.currency).toBe('INR');

    // Delivery should be 0 for orders above 500
    expect(parseFloat(quote.deliveryCost!.value!)).toBe(0);

    // Tax should be 18% of subtotal = 90
    expect(parseFloat(quote.tax!.value!)).toBe(90);

    // Total = 500 + 0 + 90 = 590
    expect(parseFloat(quote.total.value!)).toBe(590);
  });

  it('POST /api/checkout - should update session status to quote_received', async () => {
    const response = await fetch(`${API_BASE}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: checkoutSessionId,
      }),
    });

    expect(response.status).toBe(200);

    const data = (await response.json()) as CheckoutResponse;
    expect(data.session?.status).toBe('quote_received');
  });

  it('POST /api/checkout - should include quote breakup with items', async () => {
    const response = await fetch(`${API_BASE}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: checkoutSessionId,
      }),
    });

    expect(response.status).toBe(200);

    const data = (await response.json()) as CheckoutResponse;
    const breakup = data.quote?.breakup;

    expect(breakup).toBeDefined();
    expect(breakup!.length).toBeGreaterThan(0);

    // Should have item breakup
    const itemBreakup = breakup!.filter((b) => b.type === 'item');
    expect(itemBreakup.length).toBeGreaterThan(0);

    // Should have delivery breakup
    const deliveryBreakup = breakup!.find((b) => b.type === 'delivery');
    expect(deliveryBreakup).toBeDefined();

    // Should have tax breakup
    const taxBreakup = breakup!.find((b) => b.type === 'tax');
    expect(taxBreakup).toBeDefined();
  });

  it('POST /api/checkout - should include TTL for quote validity', async () => {
    const response = await fetch(`${API_BASE}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: checkoutSessionId,
      }),
    });

    expect(response.status).toBe(200);

    const data = (await response.json()) as CheckoutResponse;
    expect(data.quote?.ttl).toBe('PT10M'); // 10 minutes
  });

  it('POST /api/checkout - should calculate delivery correctly for small orders', async () => {
    const smallOrderSessionId = 'small-order-' + Date.now();

    // Add item with price < 500
    await fetch(`${API_BASE}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: smallOrderSessionId,
        item: { ...testItem, id: 'small-item', price: { value: '100', currency: 'INR' } },
        quantity: 1,
      }),
    });

    // Set buyer info
    await fetch(`${API_BASE}/api/cart/buyer`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: smallOrderSessionId,
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+919876543210',
      }),
    });

    // Checkout
    const response = await fetch(`${API_BASE}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: smallOrderSessionId,
      }),
    });

    expect(response.status).toBe(200);

    const data = (await response.json()) as CheckoutResponse;

    // Subtotal = 100
    expect(parseFloat(data.quote!.subtotal.value!)).toBe(100);

    // Delivery should be 50 for orders below 500
    expect(parseFloat(data.quote!.deliveryCost!.value!)).toBe(50);

    // Tax = 100 * 0.18 = 18
    expect(parseFloat(data.quote!.tax!.value!)).toBe(18);

    // Total = 100 + 50 + 18 = 168
    expect(parseFloat(data.quote!.total.value!)).toBe(168);
  });
});

