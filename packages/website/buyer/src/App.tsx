import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { DRAMS, NAV, SPACING, TYPOGRAPHY, TRANSITIONS } from '@ondc-agent/shared/design-system';
import { SearchPage } from './pages/SearchPage';
import { ResultsPage } from './pages/ResultsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AgentChatPage } from './pages/AgentChatPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';

// DRAMS: Clean white background, minimal chrome
const APP_CONTAINER_STYLE = {
  width: '100%',
  minHeight: '100vh',
  backgroundColor: '#ffffff',
  fontFamily: DRAMS.fontFamily,
};

// DRAMS: Unobtrusive header with soft shadow
const HEADER_STYLE = {
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  padding: '0 80px',
  position: 'sticky' as const,
  top: 0,
  zIndex: 10,
};

const HEADER_CONTENT_STYLE = {
  maxWidth: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '64px',
};

// DRAMS: Bold, clean logo
const LOGO_STYLE = {
  ...TYPOGRAPHY.h4,
  color: DRAMS.textDark,
  textDecoration: 'none',
  transition: TRANSITIONS.hover,
};

const NAV_STYLE = {
  display: 'flex',
  gap: SPACING.sm,
  alignItems: 'center',
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
            {[
              { path: '/search', label: 'Search' },
              { path: '/cart', label: 'Cart' },
              { path: '/orders', label: 'Orders' },
              { path: '/agent', label: 'Agent' },
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                style={{
                  ...NAV.link,
                  ...(isActivePath(path) ? NAV.linkActive : {}),
                }}
                onMouseEnter={(e) => {
                  if (!isActivePath(path)) {
                    Object.assign(e.currentTarget.style, NAV.linkHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActivePath(path)) {
                    Object.assign(e.currentTarget.style, { background: 'transparent', color: DRAMS.textDark });
                  }
                }}
              >
                {label}
              </Link>
            ))}
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
