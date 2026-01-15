import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductEditPage } from './pages/ProductEditPage';
import { AgentChatPage } from './pages/AgentChatPage';

export function App() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1>ONDC Seller POC</h1>
        <nav>
          <a href="/">Dashboard</a> | <a href="/catalog">Catalog</a> | <a href="/agent">Agent</a>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/new" element={<ProductEditPage />} />
          <Route path="/catalog/:id" element={<ProductEditPage />} />
          <Route path="/agent" element={<AgentChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
