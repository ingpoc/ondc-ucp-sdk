/**
 * Beckn Types Tests
 * Verify type exports and type safety
 */

import { describe, it, expect } from 'vitest';
import type {
  BecknContext,
  BecknMessage,
  BecknOnSearchResponse,
  BecknOnSelectResponse,
  BecknOnInitResponse,
  BecknOnConfirmResponse,
  BecknSearchRequest,
  BecknItem,
  BecknAction,
  BecknDomain,
} from '../types/beckn';

describe('Beckn Types', () => {
  describe('BecknContext', () => {
    it('should have required fields', () => {
      const context: BecknContext = {
        domain: 'ONDC:RET10',
        action: 'search',
        country: 'IND',
        city: 'std:080',
        bap_id: 'example-bap.com',
        bap_uri: 'https://example-bap.com/beckn',
        transaction_id: 'txn-123',
        message_id: 'msg-456',
        timestamp: '2024-01-14T10:00:00.000Z',
      };

      expect(context.domain).toBe('ONDC:RET10');
      expect(context.action).toBe('search');
      expect(context.transaction_id).toBe('txn-123');
    });

    it('should allow optional fields', () => {
      const context: BecknContext = {
        domain: 'ONDC:RET10',
        action: 'on_search',
        country: 'IND',
        city: 'std:080',
        bap_id: 'example-bap.com',
        bap_uri: 'https://example-bap.com/beckn',
        bpp_id: 'example-bpp.com',
        bpp_uri: 'https://example-bpp.com/beckn',
        transaction_id: 'txn-123',
        message_id: 'msg-456',
        timestamp: '2024-01-14T10:00:00.000Z',
        ttl: 'PT30S',
        core_version: '1.2.0',
      };

      expect(context.bpp_id).toBe('example-bpp.com');
      expect(context.ttl).toBe('PT30S');
    });
  });

  describe('BecknMessage', () => {
    it('should wrap any message type', () => {
      const message: BecknMessage<{ intent: { descriptor: { name: string } } }> = {
        context: {
          domain: 'ONDC:RET10',
          action: 'search',
          country: 'IND',
          city: 'std:080',
          bap_id: 'example-bap.com',
          bap_uri: 'https://example-bap.com/beckn',
          transaction_id: 'txn-123',
          message_id: 'msg-456',
          timestamp: '2024-01-14T10:00:00.000Z',
        },
        message: {
          intent: {
            descriptor: {
              name: 'sofa',
            },
          },
        },
      };

      expect(message.message.intent.descriptor.name).toBe('sofa');
    });
  });

  describe('BecknSearchRequest', () => {
    it('should have correct structure', () => {
      const request: BecknSearchRequest = {
        context: {
          domain: 'ONDC:RET10',
          action: 'search',
          country: 'IND',
          city: 'std:080',
          bap_id: 'example-bap.com',
          bap_uri: 'https://example-bap.com/beckn',
          transaction_id: 'txn-123',
          message_id: 'msg-456',
          timestamp: '2024-01-14T10:00:00.000Z',
        },
        message: {
          intent: {
            descriptor: {
              name: 'mobile phone',
            },
            fulfillment: {
              type: 'Delivery',
              end: {
                location: {
                  gps: '12.9716,77.5946',
                },
              },
            },
          },
        },
      };

      expect(request.message.intent.descriptor?.name).toBe('mobile phone');
      expect(request.message.intent.fulfillment?.type).toBe('Delivery');
    });
  });

  describe('BecknOnSearchResponse', () => {
    it('should contain catalog with providers and items', () => {
      const response: BecknOnSearchResponse = {
        context: {
          domain: 'ONDC:RET10',
          action: 'on_search',
          country: 'IND',
          city: 'std:080',
          bap_id: 'example-bap.com',
          bap_uri: 'https://example-bap.com/beckn',
          bpp_id: 'example-bpp.com',
          bpp_uri: 'https://example-bpp.com/beckn',
          transaction_id: 'txn-123',
          message_id: 'msg-456',
          timestamp: '2024-01-14T10:00:00.000Z',
        },
        message: {
          catalog: {
            'bpp/descriptor': {
              name: 'Test Store',
            },
            'bpp/providers': [
              {
                id: 'provider-1',
                descriptor: {
                  name: 'Provider One',
                },
                items: [
                  {
                    id: 'item-1',
                    descriptor: {
                      name: 'Test Item',
                      images: [{ url: 'https://example.com/image.jpg' }],
                    },
                    price: {
                      currency: 'INR',
                      value: '999.00',
                    },
                  },
                ],
              },
            ],
          },
        },
      };

      const providers = response.message.catalog['bpp/providers'];
      expect(providers?.[0]?.id).toBe('provider-1');
      expect(providers?.[0]?.items?.[0]?.price?.value).toBe('999.00');
    });
  });

  describe('BecknOnSelectResponse', () => {
    it('should contain order with quote', () => {
      const response: BecknOnSelectResponse = {
        context: {
          domain: 'ONDC:RET10',
          action: 'on_select',
          country: 'IND',
          city: 'std:080',
          bap_id: 'example-bap.com',
          bap_uri: 'https://example-bap.com/beckn',
          bpp_id: 'example-bpp.com',
          bpp_uri: 'https://example-bpp.com/beckn',
          transaction_id: 'txn-123',
          message_id: 'msg-456',
          timestamp: '2024-01-14T10:00:00.000Z',
        },
        message: {
          order: {
            provider: {
              id: 'provider-1',
            },
            items: [
              {
                id: 'item-1',
                quantity: {
                  count: 2,
                },
              },
            ],
            quote: {
              price: {
                currency: 'INR',
                value: '1998.00',
              },
            },
          },
        },
      };

      expect(response.message.order.quote?.price?.value).toBe('1998.00');
    });
  });

  describe('BecknOnInitResponse', () => {
    it('should contain order with billing', () => {
      const response: BecknOnInitResponse = {
        context: {
          domain: 'ONDC:RET10',
          action: 'on_init',
          country: 'IND',
          city: 'std:080',
          bap_id: 'example-bap.com',
          bap_uri: 'https://example-bap.com/beckn',
          bpp_id: 'example-bpp.com',
          bpp_uri: 'https://example-bpp.com/beckn',
          transaction_id: 'txn-123',
          message_id: 'msg-456',
          timestamp: '2024-01-14T10:00:00.000Z',
        },
        message: {
          order: {
            provider: {
              id: 'provider-1',
            },
            items: [{ id: 'item-1' }],
            billing: {
              name: 'John Doe',
              phone: '+919876543210',
              email: 'john@example.com',
            },
            payment: {
              type: 'ON-FULFILLMENT',
              status: 'NOT-PAID',
            },
          },
        },
      };

      expect(response.message.order.billing?.name).toBe('John Doe');
      expect(response.message.order.payment?.type).toBe('ON-FULFILLMENT');
    });
  });

  describe('BecknOnConfirmResponse', () => {
    it('should contain confirmed order with id', () => {
      const response: BecknOnConfirmResponse = {
        context: {
          domain: 'ONDC:RET10',
          action: 'on_confirm',
          country: 'IND',
          city: 'std:080',
          bap_id: 'example-bap.com',
          bap_uri: 'https://example-bap.com/beckn',
          bpp_id: 'example-bpp.com',
          bpp_uri: 'https://example-bpp.com/beckn',
          transaction_id: 'txn-123',
          message_id: 'msg-456',
          timestamp: '2024-01-14T10:00:00.000Z',
        },
        message: {
          order: {
            id: 'order-123',
            state: 'Created',
            provider: {
              id: 'provider-1',
            },
            items: [{ id: 'item-1' }],
            created_at: '2024-01-14T10:05:00.000Z',
          },
        },
      };

      expect(response.message.order.id).toBe('order-123');
      expect(response.message.order.state).toBe('Created');
    });
  });

  describe('BecknItem', () => {
    it('should support ONDC extensions', () => {
      const item: BecknItem = {
        id: 'item-1',
        descriptor: {
          name: 'Test Product',
          short_desc: 'A test product',
          images: [{ url: 'https://example.com/image.jpg' }],
        },
        price: {
          currency: 'INR',
          value: '999.00',
          maximum_value: '1200.00',
        },
        '@ondc/org/returnable': true,
        '@ondc/org/cancellable': true,
        '@ondc/org/return_window': 'P7D',
        '@ondc/org/time_to_ship': 'PT2H',
        '@ondc/org/available_on_cod': false,
      };

      expect(item['@ondc/org/returnable']).toBe(true);
      expect(item['@ondc/org/return_window']).toBe('P7D');
    });
  });

  describe('Type literals', () => {
    it('BecknAction should include all actions', () => {
      const actions: BecknAction[] = [
        'search',
        'on_search',
        'select',
        'on_select',
        'init',
        'on_init',
        'confirm',
        'on_confirm',
      ];

      expect(actions).toHaveLength(8);
    });

    it('BecknDomain should support ONDC domains', () => {
      const domains: BecknDomain[] = [
        'ONDC:RET10',
        'ONDC:RET11',
        'ONDC:RET12',
        'ONDC:TRV10',
        'ONDC:FIS10',
      ];

      expect(domains).toContain('ONDC:RET10');
    });
  });
});
