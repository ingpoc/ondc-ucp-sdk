import { useState, useEffect, useCallback, useMemo } from 'react';
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

// Extract filter logic to reuse
const filterOrders = (orders: UCPOrder[], filter: StatusFilter): UCPOrder[] => {
  if (filter === 'all') return orders;

  const filterMap: Record<StatusFilter, (status: UCPOrderStatus) => boolean> = {
    all: () => true,
    pending: isPendingStatus,
    accepted: isAcceptedStatus,
    dispatched: isDispatchedStatus,
    completed: isCompletedStatus,
    cancelled: isCancelledStatus,
  };

  return orders.filter((order) => filterMap[filter](order.status));
};

const countOrdersByFilter = (orders: UCPOrder[], filter: StatusFilter): number => {
  return filterOrders(orders, filter).length;
};

interface OrderCardProps {
  order: UCPOrder;
  onAccept?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
  onViewDetails?: (orderId: string) => void;
}

export function OrderCard({ order, onAccept, onReject, onViewDetails }: OrderCardProps) {
  const canAccept = isPendingStatus(order.status);
  const canReject = isPendingStatus(order.status);

  const CARD_STYLE = {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: 'white',
    marginBottom: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s ease',
  };

  const HEADER_STYLE = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
  };

  const ORDER_ID_STYLE = {
    fontSize: '13px',
    color: '#475569',
    marginBottom: '4px',
  };

  const DATE_STYLE = {
    fontSize: '12px',
    color: '#94a3b8',
  };

  const STATUS_BADGE_STYLE = {
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'capitalize' as const,
  };

  const ITEM_ROW_STYLE = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
  };

  const INFO_ROW_STYLE = {
    fontSize: '13px',
    color: '#475569',
    marginBottom: '4px',
  };

  const FOOTER_STYLE = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9',
  };

  const TOTAL_STYLE = {
    fontSize: '16px',
    fontWeight: 600,
    color: '#0f172a',
  };

  const ACTIONS_STYLE = {
    display: 'flex',
    gap: '8px',
  };

  const BUTTON_SUCCESS_STYLE = {
    padding: '8px 16px',
    border: '1px solid #10b981',
    borderRadius: '6px',
    backgroundColor: '#10b981',
    color: 'white',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const BUTTON_DANGER_STYLE = {
    padding: '8px 16px',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const BUTTON_SECONDARY_STYLE = {
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#0f172a',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  };

  return (
    <div style={CARD_STYLE}>
      <div style={HEADER_STYLE}>
        <div>
          <div style={ORDER_ID_STYLE}>
            Order #{order.id}
          </div>
          <div style={DATE_STYLE}>
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
        <div
          style={{
            ...STATUS_BADGE_STYLE,
            backgroundColor: `${getStatusColor(order.status)}15`,
            color: getStatusColor(order.status),
          }}
        >
          {getStatusLabel(order.status)}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        {order.items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            style={ITEM_ROW_STYLE}
          >
            <span style={{ color: '#0f172a' }}>
              {item.quantity}x {item.name}
            </span>
            <span style={{ color: '#475569' }}>
              {order.quote?.total?.currency} {item.price.value ?? item.price.amount}
            </span>
          </div>
        ))}
        {order.items.length > 3 && (
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '8px' }}>
            +{order.items.length - 3} more items
          </div>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={INFO_ROW_STYLE}>
          Customer: {order.buyer?.name}
        </div>
        <div style={INFO_ROW_STYLE}>
          Delivery to: {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
        </div>
      </div>

      <div style={FOOTER_STYLE}>
        <div style={TOTAL_STYLE}>
          Total: {order.quote?.total?.currency} {order.quote?.total?.value ?? order.quote?.total?.amount}
        </div>

        <div style={ACTIONS_STYLE}>
          {canAccept && onAccept && (
            <button
              onClick={() => onAccept(order.id)}
              style={BUTTON_SUCCESS_STYLE}
            >
              Accept
            </button>
          )}
          {canReject && onReject && (
            <button
              onClick={() => onReject(order.id)}
              style={BUTTON_DANGER_STYLE}
            >
              Reject
            </button>
          )}
          <button
            onClick={() => onViewDetails?.(order.id)}
            style={BUTTON_SECONDARY_STYLE}
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

  const loadOrders = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleAccept = useCallback(async (orderId: string) => {
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
  }, [loadOrders]);

  const handleReject = useCallback(async (orderId: string) => {
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
  }, [loadOrders]);

  const handleViewDetails = useCallback((orderId: string) => {
    window.location.href = `/orders/${orderId}`;
  }, []);

  const filteredOrders = useMemo(() => filterOrders(orders, filter), [orders, filter]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', color: '#475569', fontSize: '14px' }}>
          Loading orders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px', color: '#0f172a', margin: '0 0 24px 0' }}>Incoming Orders</h1>
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '14px' }}>
            <p style={{ margin: 0, fontWeight: 600 }}>Error</p>
            <p style={{ margin: '4px 0 0 0' }}>{error}</p>
            <button
              onClick={loadOrders}
              style={{ marginTop: '16px', padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', color: '#0f172a', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filterOptions: StatusFilter[] = ['all', 'pending', 'accepted', 'dispatched', 'completed', 'cancelled'];

  const PAGE_CONTAINER_STYLE = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '0',
    width: '100%',
  };

  const CONTENT_STYLE = {
    maxWidth: '100%',
    padding: '0 80px',
  };

  const HEADER_STYLE = {
    marginBottom: '32px',
    padding: '64px 80px 40px 80px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    borderBottom: '2px solid #e2e8f0',
  };

  const PAGE_TITLE_STYLE = {
    fontSize: '42px',
    fontWeight: 800,
    letterSpacing: '-1.5px',
    color: '#0f172a',
    margin: '0 0 24px 0',
  };

  const FILTERS_STYLE = {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '16px',
    overflowX: 'auto' as const,
  };

  const FILTER_BUTTON_STYLE = {
    padding: '10px 20px',
    border: 'none',
    borderBottom: '2px solid transparent',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    textTransform: 'capitalize' as const,
    whiteSpace: 'nowrap' as const,
  };

  const EMPTY_STATE_STYLE = {
    textAlign: 'center' as const,
    padding: '48px 24px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  };

  const EMPTY_TITLE_STYLE = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#0f172a',
    margin: '0 0 8px 0',
  };

  const EMPTY_MESSAGE_STYLE = {
    fontSize: '14px',
    color: '#475569',
    margin: 0,
  };

  return (
    <div style={PAGE_CONTAINER_STYLE}>
      <div style={CONTENT_STYLE}>
        <div style={HEADER_STYLE}>
          <h1 style={PAGE_TITLE_STYLE}>Incoming Orders</h1>

          <div style={FILTERS_STYLE}>
            {filterOptions.map((filterOption) => {
              const count = countOrdersByFilter(orders, filterOption);
              return (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  style={{
                    ...FILTER_BUTTON_STYLE,
                    borderBottomColor: filter === filterOption ? '#10b981' : 'transparent',
                    color: filter === filterOption ? '#10b981' : '#475569',
                    fontWeight: filter === filterOption ? 600 : 500,
                  }}
                >
                  {filterOption}
                  <span style={{ marginLeft: '8px', color: '#94a3b8' }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div style={EMPTY_STATE_STYLE}>
            <p style={EMPTY_TITLE_STYLE}>
              {filter === 'all'
                ? "No incoming orders yet"
                : `No ${filter} orders`}
            </p>
            <p style={EMPTY_MESSAGE_STYLE}>
              {filter === 'all'
                ? 'Orders will appear here when customers place them'
                : `There are no ${filter} orders at the moment`}
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
    </div>
  );
}
