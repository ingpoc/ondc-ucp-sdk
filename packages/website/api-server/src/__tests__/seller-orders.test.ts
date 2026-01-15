/**
 * Seller Orders API Tests (SDK-SELLER-ORDERS-001)
 * Tests for seller orders endpoints: list, details, accept, reject, dispatch
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

describe('Seller Orders API (SDK-SELLER-ORDERS-001)', () => {
  describe('GET /api/seller/orders', () => {
    it('should list seller orders', async () => {
      const response = await request(app)
        .get('/api/seller/orders')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('orders');
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body).toHaveProperty('count');
    });

    it('should support status filter', async () => {
      const response = await request(app)
        .get('/api/seller/orders?status=created')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.orders)).toBe(true);

      // Verify filter is applied
      response.body.orders.forEach((order: { status: string }) => {
        expect(order.status).toBe('created');
      });
    });

    it('should support limit parameter', async () => {
      const response = await request(app)
        .get('/api/seller/orders?limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.orders.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/seller/orders/:id', () => {
    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/seller/orders/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return order details for valid order', async () => {
      // First create an order via buyer API
      const createResponse = await request(app)
        .post('/api/orders/create')
        .send({
          sessionId: 'test-session-seller-001',
          paymentMethod: 'cod',
        });

      if (createResponse.status === 200) {
        const orderId = createResponse.body.order.id;

        const response = await request(app)
          .get(`/api/seller/orders/${orderId}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('order');
        expect(response.body.order).toHaveProperty('id', orderId);
      }
    });
  });

  describe('POST /api/seller/orders/:id/accept', () => {
    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .post('/api/seller/orders/non-existent/accept')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept order with created status', async () => {
      // Create an order first
      const createResponse = await request(app)
        .post('/api/orders/create')
        .send({
          sessionId: 'test-session-seller-002',
          paymentMethod: 'cod',
        });

      if (createResponse.status === 200) {
        const orderId = createResponse.body.order.id;

        const response = await request(app)
          .post(`/api/seller/orders/${orderId}/accept`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('order');
        expect(response.body.order.status).toBe('accepted');
        expect(response.body).toHaveProperty('message', 'Order accepted successfully');
      }
    });

    it('should reject accepting already accepted order', async () => {
      // Create and accept an order
      const createResponse = await request(app)
        .post('/api/orders/create')
        .send({
          sessionId: 'test-session-seller-003',
          paymentMethod: 'cod',
        });

      if (createResponse.status === 200) {
        const orderId = createResponse.body.order.id;

        await request(app)
          .post(`/api/seller/orders/${orderId}/accept`)
          .expect(200);

        // Try to accept again
        const response = await request(app)
          .post(`/api/seller/orders/${orderId}/accept`)
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('cannot be accepted');
      }
    });
  });

  describe('POST /api/seller/orders/:id/reject', () => {
    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .post('/api/seller/orders/non-existent/reject')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject order with created status', async () => {
      // Create an order first
      const createResponse = await request(app)
        .post('/api/orders/create')
        .send({
          sessionId: 'test-session-seller-004',
          paymentMethod: 'cod',
        });

      if (createResponse.status === 200) {
        const orderId = createResponse.body.order.id;
        const reason = 'Out of stock';

        const response = await request(app)
          .post(`/api/seller/orders/${orderId}/reject`)
          .send({ reason })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('order');
        expect(response.body.order.status).toBe('cancelled');
        expect(response.body.order.cancellation).toHaveProperty('cancelledBy', 'seller');
        expect(response.body.order.cancellation).toHaveProperty('reason', reason);
        expect(response.body).toHaveProperty('message', 'Order rejected successfully');
      }
    });

    it('should support default rejection reason', async () => {
      // Create an order first
      const createResponse = await request(app)
        .post('/api/orders/create')
        .send({
          sessionId: 'test-session-seller-005',
          paymentMethod: 'cod',
        });

      if (createResponse.status === 200) {
        const orderId = createResponse.body.order.id;

        const response = await request(app)
          .post(`/api/seller/orders/${orderId}/reject`)
          .send({})
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.order.cancellation).toHaveProperty('reason');
      }
    });

    it('should reject rejecting already processed order', async () => {
      // Create and reject an order
      const createResponse = await request(app)
        .post('/api/orders/create')
        .send({
          sessionId: 'test-session-seller-006',
          paymentMethod: 'cod',
        });

      if (createResponse.status === 200) {
        const orderId = createResponse.body.order.id;

        await request(app)
          .post(`/api/seller/orders/${orderId}/reject`)
          .send({ reason: 'Test' })
          .expect(200);

        // Try to reject again
        const response = await request(app)
          .post(`/api/seller/orders/${orderId}/reject`)
          .send({ reason: 'Test again' })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('cannot be rejected');
      }
    });
  });

  describe('POST /api/seller/orders/:id/dispatch', () => {
    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .post('/api/seller/orders/non-existent/dispatch')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should dispatch accepted order', async () => {
      // Create and accept an order
      const createResponse = await request(app)
        .post('/api/orders/create')
        .send({
          sessionId: 'test-session-seller-007',
          paymentMethod: 'cod',
        });

      if (createResponse.status === 200) {
        const orderId = createResponse.body.order.id;

        await request(app)
          .post(`/api/seller/orders/${orderId}/accept`)
          .expect(200);

        const trackingId = 'TRACK-12345';
        const providerName = 'DelhiCourier';

        const response = await request(app)
          .post(`/api/seller/orders/${orderId}/dispatch`)
          .send({ trackingId, providerName })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('order');
        expect(response.body.order.status).toBe('shipped');
        expect(response.body.order.fulfillment.status).toBe('in_transit');
        expect(response.body.order.fulfillment.tracking).toHaveProperty('id', trackingId);
        expect(response.body.order.fulfillment.tracking).toHaveProperty('url');
        expect(response.body.order.fulfillment).toHaveProperty('providerName', providerName);
        expect(response.body).toHaveProperty('message', 'Order dispatched successfully');
      }
    });

    it('should use default tracking ID if not provided', async () => {
      // Create and accept an order
      const createResponse = await request(app)
        .post('/api/orders/create')
        .send({
          sessionId: 'test-session-seller-008',
          paymentMethod: 'cod',
        });

      if (createResponse.status === 200) {
        const orderId = createResponse.body.order.id;

        await request(app)
          .post(`/api/seller/orders/${orderId}/accept`)
          .expect(200);

        const response = await request(app)
          .post(`/api/seller/orders/${orderId}/dispatch`)
          .send({})
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.order.fulfillment.tracking).toHaveProperty('id');
        expect(response.body.order.fulfillment.tracking.id).toContain('track-');
      }
    });

    it('should reject dispatching created order', async () => {
      // Create an order without accepting
      const createResponse = await request(app)
        .post('/api/orders/create')
        .send({
          sessionId: 'test-session-seller-009',
          paymentMethod: 'cod',
        });

      if (createResponse.status === 200) {
        const orderId = createResponse.body.order.id;

        const response = await request(app)
          .post(`/api/seller/orders/${orderId}/dispatch`)
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('cannot be dispatched');
      }
    });
  });

  describe('Order state transitions', () => {
    it('should support full order lifecycle: created -> accepted -> shipped', async () => {
      // Create order
      const createResponse = await request(app)
        .post('/api/orders/create')
        .send({
          sessionId: 'test-session-seller-010',
          paymentMethod: 'cod',
        });

      if (createResponse.status === 200) {
        const orderId = createResponse.body.order.id;
        expect(createResponse.body.order.status).toBe('created');

        // Accept order
        const acceptResponse = await request(app)
          .post(`/api/seller/orders/${orderId}/accept`)
          .expect(200);

        expect(acceptResponse.body.order.status).toBe('accepted');

        // Dispatch order
        const dispatchResponse = await request(app)
          .post(`/api/seller/orders/${orderId}/dispatch`)
          .send({ trackingId: 'TRACK-LIFECYCLE' })
          .expect(200);

        expect(dispatchResponse.body.order.status).toBe('shipped');
        expect(dispatchResponse.body.order.fulfillment.status).toBe('in_transit');
      }
    });

    it('should support rejection lifecycle: created -> cancelled', async () => {
      // Create order
      const createResponse = await request(app)
        .post('/api/orders/create')
        .send({
          sessionId: 'test-session-seller-011',
          paymentMethod: 'cod',
        });

      if (createResponse.status === 200) {
        const orderId = createResponse.body.order.id;
        expect(createResponse.body.order.status).toBe('created');

        // Reject order
        const rejectResponse = await request(app)
          .post(`/api/seller/orders/${orderId}/reject`)
          .send({ reason: 'Test rejection' })
          .expect(200);

        expect(rejectResponse.body.order.status).toBe('cancelled');
        expect(rejectResponse.body.order.cancellation).toHaveProperty('cancelledBy', 'seller');
      }
    });
  });
});
