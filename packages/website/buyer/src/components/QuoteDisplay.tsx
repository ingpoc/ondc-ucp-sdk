import type { UCPQuote } from '@ondc-website/shared';

export interface QuoteDisplayProps {
  quote: UCPQuote;
  currency: string;
}

export function QuoteDisplay({ quote, currency }: QuoteDisplayProps) {
  const formatPrice = (price?: { value?: string | number; amount?: string | number }) => {
    const value = price?.value ?? price?.amount ?? '0';
    return typeof value === 'number' ? value.toFixed(2) : String(value);
  };

  const getBreakupTitle = (type: string) => {
    const titles: Record<string, string> = {
      item: 'Items',
      delivery: 'Delivery',
      tax: 'Tax',
      discount: 'Discount',
      fee: 'Fees',
      other: 'Other',
    };
    return titles[type] || type;
  };

  // Group breakup items by type
  const groupedBreakup = quote.breakup?.reduce((acc, item) => {
    const type = item.type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {} as Record<string, typeof quote.breakup>) ?? {};

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Quote Details</h2>

      {/* Validity warning */}
      {quote.ttl && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '4px',
            color: '#92400e',
            fontSize: '0.9em',
            marginBottom: '16px',
          }}
        >
          ⏱ Quote valid for {parseDuration(quote.ttl)}
        </div>
      )}

      {/* Price breakdown */}
      <div style={{ marginBottom: '16px' }}>
        {Object.entries(groupedBreakup).map(([type, items]) => (
          <div key={type} style={{ marginBottom: '12px' }}>
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '0.9em',
                color: '#666',
                marginBottom: '4px',
                textTransform: 'uppercase',
              }}
            >
              {getBreakupTitle(type)}
            </div>
            {items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '0.95em',
                }}
              >
                <span>
                  {item.quantity && item.quantity > 1 ? `${item.title} × ${item.quantity}` : item.title}
                </span>
                <span style={{ fontWeight: '500' }}>
                  {currency} {formatPrice(item.price)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Totals */}
      <div
        style={{
          borderTop: '2px solid #e5e7eb',
          paddingTop: '16px',
          marginTop: '16px',
        }}
      >
        {/* Subtotal */}
        {quote.subtotal && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '0.95em',
            }}
          >
            <span style={{ color: '#666' }}>Subtotal</span>
            <span>
              {currency} {formatPrice(quote.subtotal)}
            </span>
          </div>
        )}

        {/* Delivery */}
        {quote.deliveryCost && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '0.95em',
            }}
          >
            <span style={{ color: '#666' }}>Delivery</span>
            <span>
              {currency} {formatPrice(quote.deliveryCost)}
            </span>
          </div>
        )}

        {/* Tax */}
        {quote.tax && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '0.95em',
            }}
          >
            <span style={{ color: '#666' }}>Tax</span>
            <span>
              {currency} {formatPrice(quote.tax)}
            </span>
          </div>
        )}

        {/* Discount */}
        {quote.discount && parseFloat(formatPrice(quote.discount)) > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '0.95em',
            }}
          >
            <span style={{ color: '#16a34a' }}>Discount</span>
            <span style={{ color: '#16a34a' }}>
              -{currency} {formatPrice(quote.discount)}
            </span>
          </div>
        )}

        {/* Total */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid #e5e7eb',
            fontSize: '1.2em',
            fontWeight: 'bold',
          }}
        >
          <span>Total</span>
          <span style={{ color: '#16a34a', fontSize: '1.4em' }}>
            {currency} {formatPrice(quote.total)}
          </span>
        </div>
      </div>

      {/* Savings badge if discount exists */}
      {quote.discount && parseFloat(formatPrice(quote.discount)) > 0 && (
        <div
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#d1fae5',
            border: '1px solid #a7f3d0',
            borderRadius: '4px',
            color: '#065f46',
            fontSize: '0.9em',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          You save {currency} {formatPrice(quote.discount)} on this order!
        </div>
      )}
    </div>
  );
}

/**
 * Parse ISO 8601 duration to human readable format
 * Example: PT10M -> 10 minutes, PT1H -> 1 hour
 */
function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  if (hours > 0 && minutes > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return duration;
}
