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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>My Orders</h1>

      {/* Status Filters */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {(['all', 'pending', 'active', 'complete'] as StatusFilter[]).map(
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

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div
          style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb' }}
        >
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            {filter === 'all'
              ? "You haven't placed any orders yet"
              : `No ${filter} orders`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => navigate('/search')}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#16a34a',
                color: 'white',
                fontSize: '1em',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Start Shopping
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => handleOrderClick(order.id)}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
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
                      {item.price.currency} {item.price.value}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div style={{ fontSize: '0.9em', color: '#6b7280', marginTop: '8px' }}>
                    +{order.items.length - 3} more items
                  </div>
                )}
              </div>

              {/* Order Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid #f3f4f6',
                }}
              >
                <div style={{ fontSize: '0.9em', color: '#6b7280' }}>
                  {order.provider?.name}
                </div>
                <div style={{ fontSize: '1.1em', fontWeight: '600', color: '#374151' }}>
                  Total: {order.quote?.total?.currency} {order.quote?.total?.value ?? order.quote?.total?.amount}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
