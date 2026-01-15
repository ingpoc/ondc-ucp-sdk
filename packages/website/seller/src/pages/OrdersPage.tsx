import { useState, useEffect } from 'react';
import type { UCPOrder, UCPOrderStatus } from '@ondc-website/shared';

const API_BASE = 'http://localhost:3001';

// Order status grouping for seller
const isPendingStatus = (status: UCPOrderStatus): boolean => status === 'created';
const isAcceptedStatus = (status: UCPOrderStatus): boolean =>
  ['accepted', 'packed'].includes(status);
const isDispatchedStatus = (status: UCPOrderStatus): boolean =>
  ['shipped', 'out_for_delivery'].includes(status);
const isCompletedStatus = (status: UCPOrderStatus): boolean => status === 'delivered';
const isCancelledStatus = (status: UCPOrderStatus): boolean =>
  ['cancelled', 'returned'].includes(status);

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
  if (isCancelledStatus(status)) return '#dc2626';
  if (isCompletedStatus(status)) return '#16a34a';
  if (isPendingStatus(status)) return '#2563eb';
  if (isDispatchedStatus(status)) return '#ea580c';
  return '#059669';
};

type StatusFilter = 'all' | 'pending' | 'accepted' | 'dispatched' | 'completed' | 'cancelled';

interface OrderCardProps {
  order: UCPOrder;
  onAccept?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
  onViewDetails?: (orderId: string) => void;
}

export function OrderCard({ order, onAccept, onReject, onViewDetails }: OrderCardProps) {
  const canAccept = isPendingStatus(order.status);
  const canReject = isPendingStatus(order.status);

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: 'white',
        marginBottom: '16px',
      }}
    >
      {/* Order Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <div>
          <div style={{ fontSize: '0.9em', color: '#6b7280', marginBottom: '4px' }}>
            Order #{order.id}
          </div>
          <div style={{ fontSize: '0.85em', color: '#9ca3af' }}>
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
        <div
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            backgroundColor: `${getStatusColor(order.status)}15`,
            color: getStatusColor(order.status),
            fontSize: '0.9em',
            fontWeight: '600',
            textTransform: 'capitalize',
          }}
        >
          {getStatusLabel(order.status)}
        </div>
      </div>

      {/* Order Items */}
      <div style={{ marginBottom: '16px' }}>
        {order.items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
          >
            <span style={{ color: '#374151' }}>
              {item.quantity}x {item.name}
            </span>
            <span style={{ color: '#6b7280' }}>
              {order.quote.total.currency} {item.price.value}
            </span>
          </div>
        ))}
        {order.items.length > 3 && (
          <div style={{ fontSize: '0.9em', color: '#6b7280', marginTop: '8px' }}>
            +{order.items.length - 3} more items
          </div>
        )}
      </div>

      {/* Customer & Delivery */}
      <div style={{ marginBottom: '16px', fontSize: '0.9em', color: '#6b7280' }}>
        <div>Customer: {order.buyer.name}</div>
        <div>
          Delivery to: {order.deliveryAddress.city}, {order.deliveryAddress.state}
        </div>
      </div>

      {/* Order Total */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid #f3f4f6',
        }}
      >
        <div style={{ fontSize: '1.1em', fontWeight: '600', color: '#374151' }}>
          Total: {order.quote.total.currency} {order.quote.total.value}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {canAccept && onAccept && (
            <button
              onClick={() => onAccept(order.id)}
              style={{
                padding: '8px 16px',
                border: '1px solid #16a34a',
                borderRadius: '6px',
                backgroundColor: '#16a34a',
                color: 'white',
                fontSize: '0.9em',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Accept
            </button>
          )}
          {canReject && onReject && (
            <button
              onClick={() => onReject(order.id)}
              style={{
                padding: '8px 16px',
                border: '1px solid #dc2626',
                borderRadius: '6px',
                backgroundColor: '#dc2626',
                color: 'white',
                fontSize: '0.9em',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Reject
            </button>
          )}
          <button
            onClick={() => onViewDetails?.(order.id)}
            style={{
              padding: '8px 16px',
              border: '1px solid #6b7280',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '0.9em',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrdersPage() {
  const [orders, setOrders] = useState<UCPOrder[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // Load orders
  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/seller/orders`);
      if (!response.ok) {
        throw new Error('Failed to load orders');
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Handle accept order
  const handleAccept = async (orderId: string) => {
    setProcessing(orderId);
    try {
      const response = await fetch(`${API_BASE}/api/seller/orders/${orderId}/accept`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to accept order');
      }
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept order');
    } finally {
      setProcessing(null);
    }
  };

  // Handle reject order
  const handleReject = async (orderId: string) => {
    if (!confirm('Are you sure you want to reject this order?')) {
      return;
    }

    setProcessing(orderId);
    try {
      const response = await fetch(`${API_BASE}/api/seller/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Seller rejected' }),
      });
      if (!response.ok) {
        throw new Error('Failed to reject order');
      }
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject order');
    } finally {
      setProcessing(null);
    }
  };

  // Handle view details
  const handleViewDetails = (orderId: string) => {
    window.location.href = `/orders/${orderId}`;
  };

  // Filter orders based on selected status
  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return isPendingStatus(order.status);
    if (filter === 'accepted') return isAcceptedStatus(order.status);
    if (filter === 'dispatched') return isDispatchedStatus(order.status);
    if (filter === 'completed') return isCompletedStatus(order.status);
    if (filter === 'cancelled') return isCancelledStatus(order.status);
    return true;
  });

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1>Incoming Orders</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1>Incoming Orders</h1>
        <p style={{ color: '#dc2626' }}>Error: {error}</p>
        <button
          onClick={loadOrders}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Incoming Orders</h1>

      {/* Status Filters */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {(['all', 'pending', 'accepted', 'dispatched', 'completed', 'cancelled'] as StatusFilter[]).map(
            (filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  borderBottom:
                    filter === filterOption ? '2px solid #16a34a' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: filter === filterOption ? '#16a34a' : '#6b7280',
                  fontSize: '1em',
                  fontWeight: filter === filterOption ? '600' : '400',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {filterOption}
                <span style={{ marginLeft: '8px', color: '#9ca3af' }}>
                  {
                    orders.filter((o) => {
                      if (filterOption === 'all') return true;
                      if (filterOption === 'pending') return isPendingStatus(o.status);
                      if (filterOption === 'accepted') return isAcceptedStatus(o.status);
                      if (filterOption === 'dispatched') return isDispatchedStatus(o.status);
                      if (filterOption === 'completed') return isCompletedStatus(o.status);
                      if (filterOption === 'cancelled') return isCancelledStatus(o.status);
                      return true;
                    }).length
                  }
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div
          style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb' }}
        >
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            {filter === 'all'
              ? "No incoming orders yet"
              : `No ${filter} orders`}
          </p>
        </div>
      ) : (
        <div>
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAccept={handleAccept}
              onReject={handleReject}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
