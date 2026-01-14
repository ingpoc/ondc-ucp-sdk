/**
 * Beckn Protocol Message Types
 * Main message wrapper and action-specific message types
 */

import type { BecknContext } from './context';
import type { BecknError } from './common';

/** Generic Beckn message wrapper */
export interface BecknMessage<T = unknown> {
  context: BecknContext;
  message: T;
  error?: BecknError;
}

/** Acknowledgement response */
export interface BecknAck {
  status: 'ACK' | 'NACK';
}

/** Acknowledgement message wrapper */
export interface BecknAckMessage {
  context: BecknContext;
  message: {
    ack: BecknAck;
  };
  error?: BecknError;
}
