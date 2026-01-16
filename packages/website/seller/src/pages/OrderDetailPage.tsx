import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { UCPOrder, UCPOrderStatus } from '@ondc-website/shared';

const API_BASE = 'http://localhost:3001';

// Order statuses that can be acted on by seller
const canAcceptOrder = (status: UCPOrderStatus): boolean => status === 'created';
const canRejectOrder = (status: UCPOrderStatus): boolean => status === 'created';
const canDispatchOrder = (status: UCPOrderStatus): boolean =>
  ['accepted', 'packed'].includes(status);

const getStatusLabel = (status: UCPOrderStatus): string => {
  const labels: Record<UCPOrderStatus, string> = {
    created: 'Pending',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    packed: 'Packed',
    shipped: 'Dispatched',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
  };
  return labels[status] || status;
};

const getStatusColor = (status: UCPOrderStatus): string => {
  if (status === 'cancelled' || status === 'returned') return '#dc2626';
  if (status === 'delivered') return '#16a34a';
  if (status === 'created') return '#2563eb';
  if (['accepted', 'packed'].includes(status)) return '#059669';
  return '#ea580c';
};

interface TimelineEvent {
  status: string;
  label: string;
  timestamp?: string;
  completed: boolean;
}

const getOrderTimeline = (order: UCPOrder): TimelineEvent[] => {
  const events: TimelineEvent[] = [
    {
      status: 'created',
      label: 'Order Placed',
      timestamp: order.createdAt,
      completed: true,
    },
  ];

  if (order.status === 'accepted' || ['accepted', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(order.status)) {
    events.push({
      status: 'accepted',
      label: 'Order Accepted',
      completed: true,
    });
  }

  if (order.fulfillment?.status === 'in_transit' || order.status === 'shipped') {
    events.push({
      status: 'packed',
      label: 'Order Packed',
      completed: true,
    });
  }

  if (order.status === 'shipped' || order.fulfillment?.status === 'in_transit') {
    events.push({
      status: 'shipped',
      label: 'Order Dispatched',
      completed: true,
    });
  }

  if (order.status === 'cancelled') {
    events.push({
      status: 'cancelled',
      label: 'Order Cancelled',
      timestamp: order.cancellation?.cancelledAt,
      completed: true,
    });
  }

  return events;
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<UCPOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // Load order data
  useEffect(() => {
    const loadOrder = async () => {
      if (!id) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/seller/orders/${id}`);
        if (!response.ok) {
          throw new Error('Order not found');
        }
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  // Handle accept order
  const handleAccept = async () => {
    if (!order || !id) return;

    setProcessing('accept');
    try {
      const response = await fetch(`${API_BASE}/api/seller/orders/${id}/accept`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to accept order');
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept order');
    } finally {
      setProcessing(null);
    }
  };

  // Handle reject order
  const handleReject = async () => {
    if (!order || !id) return;

    if (!confirm('Are you sure you want to reject this order?')) {
      return;
    }

    setProcessing('reject');
    try {
      const response = await fetch(`${API_BASE}/api/seller/orders/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Seller rejected the order' }),
      });
      if (!response.ok) {
        throw new Error('Failed to reject order');
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject order');
    } finally {
      setProcessing(null);
    }
  };

  // Handle dispatch order
  const handleDispatch = async () => {
    if (!order || !id) return;

    const trackingId = prompt('Enter tracking ID:');
    if (!trackingId) return;

    setProcessing('dispatch');
    try {
      const response = await fetch(`${API_BASE}/api/seller/orders/${id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId,
          providerName: 'Standard Courier',
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to dispatch order');
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispatch order');
    } finally {
      setProcessing(null);
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

  const timeline = getOrderTimeline(order);

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
            backgroundColor: `${getStatusColor(order.status)}15`,
            color: getStatusColor(order.status),
            fontSize: '1em',
            fontWeight: '600',
            textTransform: 'capitalize',
          }}
        >
          {getStatusLabel(order.status)}
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {canAcceptOrder(order.status) && (
          <button
            onClick={handleAccept}
            disabled={processing === 'accept'}
            style={{
              padding: '10px 20px',
              border: '1px solid #16a34a',
              borderRadius: '6px',
              backgroundColor: '#16a34a',
              color: 'white',
              fontSize: '1em',
              fontWeight: '600',
              cursor: processing === 'accept' ? 'not-allowed' : 'pointer',
              opacity: processing === 'accept' ? 0.6 : 1,
            }}
          >
            {processing === 'accept' ? 'Processing...' : 'Accept Order'}
          </button>
        )}
        {canRejectOrder(order.status) && (
          <button
            onClick={handleReject}
            disabled={processing === 'reject'}
            style={{
              padding: '10px 20px',
              border: '1px solid #dc2626',
              borderRadius: '6px',
              backgroundColor: '#dc2626',
              color: 'white',
              fontSize: '1em',
              fontWeight: '600',
              cursor: processing === 'reject' ? 'not-allowed' : 'pointer',
              opacity: processing === 'reject' ? 0.6 : 1,
            }}
          >
            {processing === 'reject' ? 'Processing...' : 'Reject Order'}
          </button>
        )}
        {canDispatchOrder(order.status) && (
          <button
            onClick={handleDispatch}
            disabled={processing === 'dispatch'}
            style={{
              padding: '10px 20px',
              border: '1px solid #ea580c',
              borderRadius: '6px',
              backgroundColor: '#ea580c',
              color: 'white',
              fontSize: '1em',
              fontWeight: '600',
              cursor: processing === 'dispatch' ? 'not-allowed' : 'pointer',
              opacity: processing === 'dispatch' ? 0.6 : 1,
            }}
          >
            {processing === 'dispatch' ? 'Processing...' : 'Dispatch Order'}
          </button>
        )}
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
        </div>
      )}

      {/* Buyer Information */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1em' }}>Buyer Information</h3>
        <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{order.buyer?.name}</p>
        {order.buyer?.contact?.phone && (
          <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>
            Phone: {order.buyer.contact.phone}
          </p>
        )}
        {order.buyer?.contact?.email && (
          <p style={{ margin: '0', color: '#6b7280' }}>
            Email: {order.buyer.contact.email}
          </p>
        )}
      </div>

      {/* Delivery Address */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1em', marginBottom: '12px' }}>Delivery Address</h3>
        <div style={{ color: '#374151', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
            {order.deliveryAddress?.line1}
          </p>
          {order.deliveryAddress?.line2 && (
            <p style={{ margin: '0 0 4px 0' }}>{order.deliveryAddress.line2}</p>
          )}
          <p style={{ margin: '0 0 4px 0' }}>
            {order.deliveryAddress?.city}, {order.deliveryAddress?.state}{' '}
            {order.deliveryAddress?.postalCode}
          </p>
          <p style={{ margin: '0' }}>{order.deliveryAddress?.country}</p>
        </div>
      </div>

      {/* Order Items */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1em', marginBottom: '12px' }}>Order Items</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {order.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
              }}
            >
              <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{item.name}</p>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9em' }}>
                  Quantity: {item.quantity}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0', fontWeight: '600' }}>
                  {order.quote?.total?.currency} {item.price.value ?? item.price.amount}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Total */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '1.1em', fontWeight: '600' }}>Order Total</span>
        <span style={{ fontSize: '1.2em', fontWeight: '700', color: '#16a34a' }}>
          {order.quote?.total?.currency} {order.quote?.total?.value ?? order.quote?.total?.amount}
        </span>
      </div>

      {/* Order Timeline */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1em', marginBottom: '16px' }}>Order Timeline</h3>
        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div
            style={{
              position: 'absolute',
              left: '8px',
              top: 0,
              bottom: 0,
              width: '2px',
              backgroundColor: '#e5e7eb',
            }}
          />

          {/* Timeline events */}
          {timeline.map((event, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                paddingLeft: '32px',
                paddingBottom: index < timeline.length - 1 ? '20px' : 0,
              }}
            >
              {/* Timeline dot */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: event.completed ? '#16a34a' : '#e5e7eb',
                  border: '2px solid white',
                  boxShadow: '0 0 0 2px ' + (event.completed ? '#16a34a' : '#e5e7eb'),
                }}
              />

              {/* Event content */}
              <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#374151' }}>
                  {event.label}
                </p>
                {event.timestamp && (
                  <p style={{ margin: '0', color: '#6b7280', fontSize: '0.85em' }}>
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Info (if dispatched) */}
      {order.fulfillment?.tracking && (
        <div
          style={{
            marginBottom: '24px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1em' }}>Tracking Information</h3>
          {order.fulfillment.tracking.id && (
            <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>
              Tracking ID: {order.fulfillment.tracking.id}
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
    </div>
  );
}
