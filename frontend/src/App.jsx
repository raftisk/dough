import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Transactions from './pages/Transactions';

// Placeholder components for future pages
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{title}</h1>
    <p style={{ color: '#666', marginTop: '1rem' }}>Coming soon...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallets" element={<PlaceholderPage title="Wallets" />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/budgets" element={<PlaceholderPage title="Budgets" />} />
        <Route path="/wishlist" element={<PlaceholderPage title="Wishlist" />} />
        <Route path="/insights" element={<PlaceholderPage title="Insights" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
