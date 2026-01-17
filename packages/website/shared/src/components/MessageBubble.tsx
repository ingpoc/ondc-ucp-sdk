import React, { useState } from 'react';

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
    <span className="star-rating" style={{ color: '#f39c12' }}>
      {'★'.repeat(fullStars)}
      {hasHalf && '☆'}
      {'☆'.repeat(emptyStars)}
      <span style={{ color: '#666', marginLeft: '0.25rem' }}>({rating})</span>
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
        border: '1px solid #e0e0e0',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        backgroundColor: '#fff',
        width: '200px',
        flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      {/* Header with image and wishlist */}
      <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
        <img
          src={card.image || 'https://via.placeholder.com/150?text=No+Image'}
          alt={card.name}
          style={{
            width: '100%',
            height: '120px',
            objectFit: 'cover',
            borderRadius: '0.25rem',
            backgroundColor: '#f5f5f5'
          }}
        />
        <button
          onClick={handleWishlist}
          style={{
            position: 'absolute',
            top: '0.25rem',
            right: '0.25rem',
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          {isWishlisted ? '❤️' : '♡'}
        </button>
      </div>

      {/* Product name */}
      <h4
        style={{
          margin: '0 0 0.25rem 0',
          fontSize: '0.9rem',
          fontWeight: '600',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
        title={card.name}
      >
        {card.name}
      </h4>

      {/* Price and rating */}
      <div style={{ marginBottom: '0.25rem' }}>
        <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#2c3e50' }}>
          ₹{card.price}
        </span>
      </div>

      <div style={{ marginBottom: '0.25rem', fontSize: '0.8rem' }}>
        <StarRating rating={card.rating} />
      </div>

      {/* Provider and delivery */}
      <div
        style={{
          fontSize: '0.75rem',
          color: '#666',
          marginBottom: '0.5rem'
        }}
      >
        {card.provider} | {card.delivery}
      </div>

      {/* Stock status */}
      {!card.inStock && (
        <div
          style={{
            fontSize: '0.75rem',
            color: '#e74c3c',
            marginBottom: '0.5rem'
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
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #ddd',
              borderRadius: '0.25rem'
            }}
          >
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                border: 'none',
                background: 'none',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              -
            </button>
            <span style={{ padding: '0 0.5rem', minWidth: '20px', textAlign: 'center' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{
                border: 'none',
                background: 'none',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            style={{
              flex: 1,
              padding: '0.4rem 0.5rem',
              backgroundColor: '#27ae60',
              color: '#fff',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '500'
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
          fontSize: '0.75rem'
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            cursor: 'pointer'
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
            color: '#3498db',
            cursor: 'pointer',
            fontSize: '0.75rem',
            textDecoration: 'underline'
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
        <p style={{ margin: '0 0 0.75rem 0', color: '#333' }}>{response.message}</p>
      )}

      {/* Cards grid */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
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
            margin: '0.5rem 0 0 0',
            fontSize: '0.8rem',
            color: '#666'
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
        marginBottom: '1rem',
        maxWidth: productCards ? '100%' : '80%'
      }}
    >
      {isToolProgress && (
        <div
          className="tool-indicator"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: '#666'
          }}
        >
          <span
            className="spinner"
            style={{
              display: 'inline-block',
              width: '1rem',
              height: '1rem',
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          <span>Searching...</span> {/* Don't expose tool names */}
        </div>
      )}

      {productCards ? (
        <div
          className="message-content product-cards"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#f9f9f9',
            width: '100%'
          }}
        >
          <ProductCardsGrid response={productCards} onAction={onCardAction} />
        </div>
      ) : (
        <div
          className="message-content"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: isUser ? '#3498db' : '#f5f5f5',
            color: isUser ? '#fff' : '#333',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
