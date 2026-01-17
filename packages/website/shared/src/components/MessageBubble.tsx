import React, { useState } from 'react';
import { DRAMS_CARD, SPACING, TYPOGRAPHY, DRAMS, RADIUS, PILL_BUTTON, QUANTITY_CONTROL } from '@ondc-agent/shared/design-system';

export interface SDKMessage {
  type: 'assistant' | 'user' | 'result' | 'system' | 'tool_progress' | 'auth_status';
  subtype?: string;
  content?: string;
  result?: string;
  errors?: string[];
  tool_name?: string;
  session_id?: string;
  structured_data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CardAction {
  type: 'add_to_cart' | 'compare' | 'view_details' | 'wishlist';
  label: string;
  hasQtyPicker?: boolean;
  isCheckbox?: boolean;
  isIcon?: boolean;
}

export interface AgentProductCard {
  id: string;
  name: string;
  price: number;
  currency: string;
  rating: number;
  image?: string;
  provider: string;
  delivery: string;
  inStock: boolean;
  actions: CardAction[];
}

export interface ProductCardsResponse {
  type: 'product_cards';
  cards: AgentProductCard[];
  totalCount?: number;
  query?: string;
  message?: string;
}

interface MessageBubbleProps {
  message: SDKMessage;
  onCardAction?: (action: string, itemId: string, quantity?: number) => void;
}

/**
 * Render star rating
 */
function StarRating({ rating }: { rating: number }): React.ReactElement {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="star-rating" style={{ color: DRAMS.orange }}>
      {'★'.repeat(fullStars)}
      {hasHalf && '☆'}
      {'☆'.repeat(emptyStars)}
      <span style={{ color: DRAMS.textLight, marginLeft: '0.25rem' }}>({rating})</span>
    </span>
  );
}

/**
 * Product Card Component
 */
function ProductCardComponent({
  card,
  onAction
}: {
  card: AgentProductCard;
  onAction?: (action: string, itemId: string, quantity?: number) => void;
}): React.ReactElement {
  const [quantity, setQuantity] = useState(1);
  const [isComparing, setIsComparing] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = () => {
    onAction?.('add_to_cart', card.id, quantity);
  };

  const handleCompare = () => {
    setIsComparing(!isComparing);
    onAction?.('compare', card.id);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onAction?.('wishlist', card.id);
  };

  const handleViewDetails = () => {
    onAction?.('view_details', card.id);
  };

  return (
    <div
      className="product-card"
      style={{
        ...DRAMS_CARD.base,
        width: '200px',
        flexShrink: 0,
      }}
    >
      {/* Header with image and wishlist */}
      <div style={{ position: 'relative', marginBottom: SPACING.sm }}>
        <img
          src={card.image || 'https://via.placeholder.com/150?text=No+Image'}
          alt={card.name}
          style={{
            width: '100%',
            height: '120px',
            objectFit: 'cover',
            borderRadius: RADIUS.card,
            backgroundColor: DRAMS.grayTrack,
          }}
        />
        <button
          onClick={handleWishlist}
          style={{
            position: 'absolute',
            top: SPACING.xs,
            right: SPACING.xs,
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: RADIUS.circle,
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          {isWishlisted ? '❤️' : '♡'}
        </button>
      </div>

      {/* Product name */}
      <h4
        style={{
          ...TYPOGRAPHY.label,
          margin: `0 0 ${SPACING.xs} 0`,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={card.name}
      >
        {card.name}
      </h4>

      {/* Price and rating */}
      <div style={{ marginBottom: SPACING.xs }}>
        <span style={{ ...TYPOGRAPHY.label, fontWeight: 600, fontSize: '1rem', color: DRAMS.textDark }}>
          ₹{card.price}
        </span>
      </div>

      <div style={{ marginBottom: SPACING.xs, ...TYPOGRAPHY.bodySmall }}>
        <StarRating rating={card.rating} />
      </div>

      {/* Provider and delivery */}
      <div
        style={{
          ...TYPOGRAPHY.bodySmall,
          color: DRAMS.textLight,
          marginBottom: SPACING.sm,
        }}
      >
        {card.provider} | {card.delivery}
      </div>

      {/* Stock status */}
      {!card.inStock && (
        <div
          style={{
            ...TYPOGRAPHY.bodySmall,
            color: DRAMS.orange,
            marginBottom: SPACING.sm,
          }}
        >
          Out of Stock
        </div>
      )}

      {/* Quantity picker and Add to Cart */}
      {card.inStock && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACING.sm,
            marginBottom: SPACING.sm,
          }}
        >
          <div style={QUANTITY_CONTROL.container}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={QUANTITY_CONTROL.button}
            >
              -
            </button>
            <span style={QUANTITY_CONTROL.value}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={QUANTITY_CONTROL.button}
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            style={{
              ...PILL_BUTTON.orange,
              flex: 1,
              padding: `${SPACING.xs} ${SPACING.sm}`,
            }}
          >
            🛒 Add
          </button>
        </div>
      )}

      {/* Secondary actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...TYPOGRAPHY.bodySmall,
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACING.xs,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={isComparing}
            onChange={handleCompare}
            style={{ margin: 0 }}
          />
          Compare
        </label>

        <button
          onClick={handleViewDetails}
          style={{
            background: 'none',
            border: 'none',
            color: DRAMS.orange,
            cursor: 'pointer',
            ...TYPOGRAPHY.bodySmall,
            textDecoration: 'underline',
          }}
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

/**
 * Product Cards Grid Component
 */
function ProductCardsGrid({
  response,
  onAction
}: {
  response: ProductCardsResponse;
  onAction?: (action: string, itemId: string, quantity?: number) => void;
}): React.ReactElement {
  return (
    <div className="product-cards-container">
      {/* Message header */}
      {response.message && (
        <p style={{ ...TYPOGRAPHY.body, margin: `0 0 ${SPACING.md} 0`, color: DRAMS.textDark }}>{response.message}</p>
      )}

      {/* Cards grid */}
      <div
        style={{
          display: 'flex',
          gap: SPACING.md,
          overflowX: 'auto',
          paddingBottom: SPACING.sm,
        }}
      >
        {response.cards.map((card) => (
          <ProductCardComponent key={card.id} card={card} onAction={onAction} />
        ))}
      </div>

      {/* Total count */}
      {response.totalCount && response.totalCount > response.cards.length && (
        <p
          style={{
            ...TYPOGRAPHY.bodySmall,
            margin: `${SPACING.sm} 0 0 0`,
            color: DRAMS.textLight,
          }}
        >
          Showing {response.cards.length} of {response.totalCount} results
        </p>
      )}
    </div>
  );
}

/**
 * Extract product cards from message
 * Checks structured_data from backend first, then falls back to content parsing
 */
function tryParseProductCards(message: SDKMessage): ProductCardsResponse | null {
  const structuredData = message.structured_data as { type?: string; cards?: unknown[] } | undefined;

  if (structuredData?.type === 'product_cards' && Array.isArray(structuredData.cards)) {
    return structuredData as ProductCardsResponse;
  }

  if (!message.content) return null;

  try {
    const toolResultMatch = message.content.match(/\[TOOL_RESULT\]([\s\S]*?)\[\/TOOL_RESULT\]/);
    if (toolResultMatch) {
      const parsed = JSON.parse(toolResultMatch[1].trim());
      if (parsed.type === 'product_cards' && Array.isArray(parsed.cards)) {
        return parsed as ProductCardsResponse;
      }
    }

    const jsonMatch = message.content.match(/\{[\s\S]*"type":\s*"product_cards"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.type === 'product_cards' && Array.isArray(parsed.cards)) {
        return parsed as ProductCardsResponse;
      }
    }
  } catch {
    // Not JSON or not product cards
  }

  return null;
}

/**
 * Extract display content from message based on type
 */
function getMessageContent(message: SDKMessage): string {
  if (message.type === 'result') {
    if (message.errors && message.errors.length > 0) {
      return `Error: ${message.errors.join(', ')}`;
    }
    if (message.result) {
      return message.result;
    }
  }

  if (message.type === 'tool_progress') {
    return 'Working on it...';
  }

  if (typeof message.content === 'string') {
    return message.content;
  }

  return '';
}

export function MessageBubble({
  message,
  onCardAction
}: MessageBubbleProps): React.ReactElement | null {
  const isUser = message.type === 'user';
  const isAssistant = message.type === 'assistant';
  const isToolProgress = message.type === 'tool_progress';

  if (message.type === 'system' && message.subtype === 'init') {
    return null;
  }

  const content = getMessageContent(message);
  const productCards = isAssistant ? tryParseProductCards(message) : null;

  const shouldRender = productCards || (isUser && content) || (!isUser && (content || isToolProgress));

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`message-bubble ${isUser ? 'user-message' : 'assistant-message'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: SPACING.lg,
        maxWidth: productCards ? '100%' : '80%',
      }}
    >
      {isToolProgress && (
        <div
          className="tool-indicator"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACING.sm,
            ...TYPOGRAPHY.bodySmall,
            color: DRAMS.textLight,
          }}
        >
          <span
            className="spinner"
            style={{
              display: 'inline-block',
              width: '1rem',
              height: '1rem',
              border: `2px solid ${DRAMS.grayTrack}`,
              borderTop: `2px solid ${DRAMS.orange}`,
              borderRadius: RADIUS.circle,
              animation: 'spin 1s linear infinite',
            }}
          />
          <span>Searching...</span> {/* Don't expose tool names */}
        </div>
      )}

      {productCards ? (
        <div
          className="message-content product-cards"
          style={{
            ...DRAMS_CARD.base,
            padding: `${SPACING.md} ${SPACING.lg}`,
            width: '100%',
          }}
        >
          <ProductCardsGrid response={productCards} onAction={onCardAction} />
        </div>
      ) : (
        <div
          className="message-content"
          style={{
            ...DRAMS_CARD.base,
            padding: `${SPACING.md} ${SPACING.lg}`,
            backgroundColor: isUser ? DRAMS.orange : DRAMS.grayTrack,
            color: isUser ? '#fff' : DRAMS.textDark,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
