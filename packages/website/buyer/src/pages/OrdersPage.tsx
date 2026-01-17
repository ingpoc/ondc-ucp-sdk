import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UCPOrder, UCPOrderStatus } from '@ondc-website/shared';

type StatusFilter = 'all' | 'pending' | 'active' | 'complete';

// Status grouping helpers
const isPendingStatus = (status: UCPOrderStatus): boolean =>
  status === 'created' || status === 'accepted';

const isActiveStatus = (status: UCPOrderStatus): boolean =>
  status === 'in_progress' ||
  status === 'packed' ||
  status === 'shipped' ||
  status === 'out_for_delivery';

const isCompleteStatus = (status: UCPOrderStatus): boolean =>
  status === 'delivered';

// Mock orders - to be replaced with API call in SDK-BUYER-ORDERS-003
const mockOrders: UCPOrder[] = [];

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
  marginBottom: '48px',
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
  marginBottom: '32px',
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
  transition: 'all 0.2s ease',
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
  margin: '0 0 24px 0',
};

const BUTTON_PRIMARY_STYLE = {
  padding: '12px 24px',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#10b981',
  color: 'white',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

const ORDERS_GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
  gap: '24px',
};

const ORDER_CARD_STYLE = {
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
};

const ORDER_CARD_HOVER_STYLE = {
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
  transform: 'translateY(-2px)',
};

export function OrdersPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<StatusFilter>('all');

  // Filter orders based on selected status
  const filteredOrders = mockOrders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return isPendingStatus(order.status);
    if (filter === 'active') return isActiveStatus(order.status);
    if (filter === 'complete') return isCompleteStatus(order.status);
    return true;
  });

  const getStatusLabel = (status: UCPOrderStatus): string => {
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

  const getStatusColor = (status: UCPOrderStatus): string => {
    if (status === 'cancelled' || status === 'returned') return '#dc2626';
    if (status === 'delivered') return '#16a34a';
    if (isPendingStatus(status)) return '#2563eb';
    if (isActiveStatus(status)) return '#ea580c';
    return '#6b7280';
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div style={PAGE_CONTAINER_STYLE}>
      <div style={CONTENT_STYLE}>
        <div style={HEADER_STYLE}>
          <h1 style={PAGE_TITLE_STYLE}>My Orders</h1>

          <div style={FILTERS_STYLE}>
            {(['all', 'pending', 'active', 'complete'] as StatusFilter[]).map(
              (filterOption) => (
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
                  <span style={{ marginLeft: '8px', color: '#94a3b8' }}>
                    {filterOption === 'all'
                      ? mockOrders.length
                      : mockOrders.filter((o) => {
                          if (filterOption === 'pending') return isPendingStatus(o.status);
                          if (filterOption === 'active') return isActiveStatus(o.status);
                          if (filterOption === 'complete') return isCompleteStatus(o.status);
                          return true;
                        }).length}
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div style={EMPTY_STATE_STYLE}>
            <p style={EMPTY_TITLE_STYLE}>
              {filter === 'all'
                ? "You haven't placed any orders yet"
                : `No ${filter} orders`}
            </p>
            {filter === 'all' && (
              <>
                <p style={EMPTY_MESSAGE_STYLE}>
                  Start shopping to see your orders here
                </p>
                <button
                  onClick={() => navigate('/search')}
                  style={BUTTON_PRIMARY_STYLE}
                >
                  Start Shopping
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={ORDERS_GRID_STYLE}>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                style={ORDER_CARD_STYLE}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, ORDER_CARD_HOVER_STYLE);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                    Order #{order.id}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}
                    >
                      <span style={{ color: '#0f172a' }}>
                        {item.quantity}x {item.name}
                      </span>
                      <span style={{ color: '#475569' }}>
                        {item.price.currency} {item.price.value}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '8px' }}>
                      +{order.items.length - 3} more items
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    {order.provider?.name}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                    {order.quote?.total?.currency} {order.quote?.total?.value ?? order.quote?.total?.amount}
                  </div>
                </div>

                <div style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  backgroundColor: `${getStatusColor(order.status)}15`,
                  color: getStatusColor(order.status),
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  display: 'inline-block',
                  marginTop: '12px',
                }}>
                  {getStatusLabel(order.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
