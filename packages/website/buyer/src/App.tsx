import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { SearchPage } from './pages/SearchPage';
import { ResultsPage } from './pages/ResultsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AgentChatPage } from './pages/AgentChatPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';

const APP_CONTAINER_STYLE = {
  width: '100%',
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
};

const HEADER_STYLE = {
  backgroundColor: 'white',
  borderBottom: '2px solid #e2e8f0',
  padding: '0 80px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const HEADER_CONTENT_STYLE = {
  maxWidth: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '64px',
};

const LOGO_STYLE = {
  fontSize: '20px',
  fontWeight: 800,
  letterSpacing: '-0.5px',
  color: '#0f172a',
  textDecoration: 'none',
};

const NAV_STYLE = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
};

const NAV_LINK_STYLE = {
  padding: '8px 16px',
  borderRadius: '6px',
  color: '#475569',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap' as const,
};

const NAV_LINK_ACTIVE_STYLE = {
  backgroundColor: '#f1f5f9',
  color: '#0f172a',
};

const NAV_LINK_HOVER_STYLE = {
  backgroundColor: '#f8fafc',
  color: '#0f172a',
};

export function App() {
  const location = useLocation();

  const isActivePath = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={APP_CONTAINER_STYLE}>
      <header style={HEADER_STYLE}>
        <div style={HEADER_CONTENT_STYLE}>
          <Link to="/" style={LOGO_STYLE}>
            ONDC
          </Link>
          <nav style={NAV_STYLE}>
            <Link
              to="/search"
              style={{
                ...NAV_LINK_STYLE,
                ...(isActivePath('/search') ? NAV_LINK_ACTIVE_STYLE : {}),
              }}
            >
              Search
            </Link>
            <Link
              to="/cart"
              style={{
                ...NAV_LINK_STYLE,
                ...(isActivePath('/cart') ? NAV_LINK_ACTIVE_STYLE : {}),
              }}
            >
              Cart
            </Link>
            <Link
              to="/orders"
              style={{
                ...NAV_LINK_STYLE,
                ...(isActivePath('/orders') ? NAV_LINK_ACTIVE_STYLE : {}),
              }}
            >
              Orders
            </Link>
            <Link
              to="/agent"
              style={{
                ...NAV_LINK_STYLE,
                ...(isActivePath('/agent') ? NAV_LINK_ACTIVE_STYLE : {}),
              }}
            >
              Agent
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/agent" element={<AgentChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
