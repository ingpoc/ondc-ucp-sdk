import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { UCPOrder, UCPOrderStatus, UCPFulfillmentStatus } from '@ondc-website/shared';

// Mock order fetch - to be replaced with API call
const fetchOrder = async (_orderId: string): Promise<UCPOrder | null> => {
  // TODO: Replace with actual API call
  return null;
};

// Order statuses that can be cancelled
const CANCELLABLE_STATUSES: UCPOrderStatus[] = ['created', 'accepted', 'in_progress'];

const isCancellable = (status: UCPOrderStatus): boolean => CANCELLABLE_STATUSES.includes(status);

const getOrderStatusLabel = (status: UCPOrderStatus): string => {
  const labels: Record<UCPOrderStatus, string> = {
    created: 'Created',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    packed: 'Packed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
  };
  return labels[status] || status;
};

const getOrderStatusColor = (status: UCPOrderStatus): string => {
  if (status === 'cancelled' || status === 'returned') return '#dc2626';
  if (status === 'delivered') return '#16a34a';
  if (status === 'created' || status === 'accepted') return '#2563eb';
  return '#ea580c';
};

const getFulfillmentStatusLabel = (status: UCPFulfillmentStatus): string => {
  const labels: Record<UCPFulfillmentStatus, string> = {
    pending: 'Pending',
    searching_agent: 'Searching for Agent',
    agent_assigned: 'Agent Assigned',
    picking_up: 'Picking Up',
    picked_up: 'Picked Up',
    in_transit: 'In Transit',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
};

const formatPrice = (currency: string, value: string | undefined, quantity: number = 1): string => {
  const numValue = value ? parseFloat(value) : 0;
  return `${currency} ${(numValue * quantity).toFixed(2)}`;
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<UCPOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Load order data
  useEffect(() => {
    const loadOrder = async () => {
      if (!id) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchOrder(id);
        if (!data) {
          setError('Order not found');
        } else {
          setOrder(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!order || !id) return;

    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancelling(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/orders/${id}/cancel`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ reason: 'Buyer requested cancellation' }),
      // });
      //
      // if (!response.ok) throw new Error('Failed to cancel order');
      //
      // const updatedOrder = (await response.json()).order as UCPOrder;
      // setOrder(updatedOrder);

      // Mock cancellation for now
      setOrder({
        ...order,
        status: 'cancelled',
        cancellation: {
          cancelledBy: 'buyer',
          cancelledAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <p style={{ color: '#dc2626', marginBottom: '16px' }}>Error: {error}</p>
        <button
          onClick={() => navigate('/orders')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <p>Order not found</p>
        <button
          onClick={() => navigate('/orders')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const canCancel = isCancellable(order.status);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/orders')}
        style={{
          padding: '8px 16px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: 'white',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        ← Back to Orders
      </button>

      {/* Order Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 8px 0' }}>Order #{order.id}</h1>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9em' }}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: `${getOrderStatusColor(order.status)}15`,
            color: getOrderStatusColor(order.status),
            fontSize: '1em',
            fontWeight: '600',
            textTransform: 'capitalize',
          }}
        >
          {getOrderStatusLabel(order.status)}
        </div>
      </div>

      {/* Cancellation Notice */}
      {order.cancellation && (
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            marginBottom: '24px',
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#991b1b' }}>
            Order Cancelled
          </p>
          <p style={{ margin: '0', color: '#7f1d1d', fontSize: '0.9em' }}>
            Cancelled by: {order.cancellation.cancelledBy}
            {order.cancellation.reason && ` - ${order.cancellation.reason}`}
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#7f1d1d', fontSize: '0.85em' }}>
            {new Date(order.cancellation.cancelledAt).toLocaleString()}
          </p>
          {order.cancellation.refund && (
            <p style={{ margin: '8px 0 0 0', color: '#059669', fontSize: '0.9em' }}>
              Refund: {order.cancellation.refund.amount.currency}{' '}
              {order.cancellation.refund.amount.value} - {order.cancellation.refund.status}
            </p>
          )}
        </div>
      )}

      {/* Provider Info */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1em' }}>Seller</h3>
        <p style={{ margin: '0', fontWeight: '600' }}>{order.provider.name}</p>
        {order.provider.verified && (
          <span style={{ color: '#16a34a', fontSize: '0.9em' }}>✓ Verified</span>
        )}
      </div>

      {/* Order Items */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2em', marginBottom: '16px' }}>Items</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {order.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{item.name}</p>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9em' }}>
                  Quantity: {item.quantity}
                </p>
                {item.customizations && (
                  <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.85em' }}>
                    {Object.entries(item.customizations).map(([key, value]) => (
                      <span key={key}>
                        {key}: {value}
                      </span>
                    )).join(' | ')}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0', fontWeight: '600' }}>
                  {formatPrice(item.price.currency, item.price.value, item.quantity)}
                </p>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '0.85em' }}>
                  {item.price.currency} {item.price.value} each
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote/Pricing Breakdown */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}
      >
        <h2 style={{ fontSize: '1.2em', marginBottom: '16px' }}>Order Summary</h2>
        {order.quote.breakup?.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '0.95em',
            }}
          >
            <span style={{ color: '#6b7280' }}>{item.title}</span>
            <span>{item.price.currency} {item.price.value}</span>
          </div>
        ))}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #e5e7eb',
            fontWeight: '600',
            fontSize: '1.1em',
          }}
        >
          <span>Total</span>
          <span>
            {order.quote.total.currency} {order.quote.total.value}
          </span>
        </div>
      </div>

      {/* Delivery Address */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2em', marginBottom: '12px' }}>Delivery Address</h2>
        <div style={{ color: '#374151', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
            {order.deliveryAddress.line1}
          </p>
          {order.deliveryAddress.line2 && (
            <p style={{ margin: '0 0 4px 0' }}>{order.deliveryAddress.line2}</p>
          )}
          <p style={{ margin: '0 0 4px 0' }}>
            {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
            {order.deliveryAddress.postalCode}
          </p>
          <p style={{ margin: '0' }}>{order.deliveryAddress.country}</p>
        </div>
      </div>

      {/* Fulfillment & Tracking */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2em', marginBottom: '12px' }}>
          {order.fulfillment.type === 'delivery' ? 'Delivery' : 'Fulfillment'} Status
        </h2>
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
            Status: {getFulfillmentStatusLabel(order.fulfillment.status)}
          </p>
          {order.fulfillment.estimatedTime && (
            <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>
              Est. Delivery:{' '}
              {order.fulfillment.estimatedTime.start
                ? new Date(order.fulfillment.estimatedTime.start).toLocaleString()
                : 'TBD'}{' '}
              -{' '}
              {order.fulfillment.estimatedTime.end
                ? new Date(order.fulfillment.estimatedTime.end).toLocaleString()
                : 'TBD'}
            </p>
          )}
          {order.fulfillment.providerName && (
            <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>
              Provider: {order.fulfillment.providerName}
            </p>
          )}

          {/* Tracking Info */}
          {order.fulfillment.tracking && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Tracking</p>
              {order.fulfillment.tracking.id && (
                <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>
                  Tracking ID: {order.fulfillment.tracking.id}
                </p>
              )}
              {order.fulfillment.tracking.statusMessage && (
                <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>
                  {order.fulfillment.tracking.statusMessage}
                </p>
              )}
              {order.fulfillment.tracking.url && (
                <a
                  href={order.fulfillment.tracking.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#16a34a',
                    textDecoration: 'none',
                    fontWeight: '600',
                  }}
                >
                  Track Package →
                </a>
              )}
            </div>
          )}

          {/* Delivery Agent */}
          {order.fulfillment.agent && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Delivery Agent</p>
              {order.fulfillment.agent.name && (
                <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>
                  Name: {order.fulfillment.agent.name}
                </p>
              )}
              {order.fulfillment.agent.phone && (
                <p style={{ margin: '0', color: '#6b7280' }}>
                  Phone: {order.fulfillment.agent.phone}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Info */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2em', marginBottom: '12px' }}>Payment</h2>
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>Method</span>
            <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
              {order.payment.type}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>Amount</span>
            <span style={{ fontWeight: '600' }}>
              {order.payment.amount.currency} {order.payment.amount.value}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>Status</span>
            <span
              style={{
                fontWeight: '600',
                color:
                  order.payment.status === 'completed'
                    ? '#16a34a'
                    : order.payment.status === 'failed'
                      ? '#dc2626'
                      : '#ea580c',
                textTransform: 'capitalize',
              }}
            >
              {order.payment.status}
            </span>
          </div>
          {order.payment.transactionId && (
            <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '0.9em' }}>
              Transaction ID: {order.payment.transactionId}
            </p>
          )}
          {order.payment.completedAt && (
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.9em' }}>
              Completed: {new Date(order.payment.completedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Documents */}
      {order.documents && order.documents.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.2em', marginBottom: '12px' }}>Documents</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {order.documents.map((doc, index) => (
              <a
                key={index}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  textDecoration: 'none',
                  color: '#16a34a',
                  fontWeight: '600',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{doc.label || doc.type}</span>
                <span>↓</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Button (for cancellable orders) */}
      {canCancel && !order.cancellation && (
        <div
          style={{
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
          }}
        >
          <p style={{ margin: '0 0 12px 0', color: '#991b1b' }}>
            Need to cancel this order?
          </p>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            style={{
              padding: '10px 20px',
              border: '1px solid #dc2626',
              borderRadius: '6px',
              backgroundColor: '#dc2626',
              color: 'white',
              fontSize: '1em',
              fontWeight: '600',
              cursor: cancelling ? 'not-allowed' : 'pointer',
              opacity: cancelling ? 0.6 : 1,
            }}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      )}
    </div>
  );
}
