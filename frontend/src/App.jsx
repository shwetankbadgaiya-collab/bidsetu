import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTender from './pages/CreateTender';
import Upload from './pages/Upload';
import Processing from './pages/Processing';
import VerificationResult from './pages/VerificationResult';
import Compliance from './pages/Compliance';
import RiskAnalysis from './pages/RiskAnalysis';
import Decision from './pages/Decision';
import AuditTrail from './pages/AuditTrail';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const Layout = () => {
  const location = useLocation();
  const path = location.pathname;

  const getBreadcrumbs = () => {
    const activeTender = sessionStorage.getItem('active_tender_id') || 'Tenders';

    if (path.includes('/verification/')) {
      const id = path.split('/verification/')[1] || 'Overview';
      return [{ label: 'Dashboard', path: '/dashboard' }, { label: `Bid #${id}`, path: `/verification/${id}` }, { label: 'Verification', path }];
    }
    if (path.includes('/compliance/')) {
      const id = path.split('/compliance/')[1] || 'Overview';
      return [{ label: 'Dashboard', path: '/dashboard' }, { label: `Bid #${id}`, path: `/verification/${id}` }, { label: 'Compliance Analysis', path }];
    }
    if (path.includes('/risk/')) {
      const id = path.split('/risk/')[1] || 'Overview';
      return [{ label: 'Dashboard', path: '/dashboard' }, { label: `Bid #${id}`, path: `/verification/${id}` }, { label: 'Risk Analysis', path }];
    }
    if (path.includes('/decision/')) {
      const id = path.split('/decision/')[1] || 'Overview';
      return [{ label: 'Dashboard', path: '/dashboard' }, { label: `Bid #${id}`, path: `/verification/${id}` }, { label: 'Officer Decision', path }];
    }
    if (path.includes('/reports')) {
      return [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Procurement Reports', path }];
    }
    if (path.includes('/audit')) {
      const id = path.split('/audit/')[1];
      return id 
        ? [{ label: 'Dashboard', path: '/dashboard' }, { label: `Bid #${id}`, path: `/verification/${id}` }, { label: 'Audit Trail', path }]
        : [{ label: 'Dashboard', path: '/dashboard' }, { label: 'System Audit Trail', path }];
    }
    if (path.includes('/upload')) {
      return [{ label: 'Dashboard', path: '/dashboard' }, { label: activeTender, path: '/dashboard' }, { label: 'Upload Documents', path }];
    }
    if (path.includes('/processing')) {
      return [{ label: 'Dashboard', path: '/dashboard' }, { label: 'AI Verification Pipeline', path }];
    }
    if (path.includes('/tenders/create')) {
      return [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Create Tender', path }];
    }
    if (path.includes('/settings')) {
      return [{ label: 'Settings', path: '/settings' }, { label: 'Profile', path }];
    }
    return [{ label: 'Government e-Marketplace', path: '/dashboard' }, { label: 'Dashboard', path: '/dashboard' }];
  };

  return (
    <div className="flex h-screen overflow-hidden bg-paper w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar breadcrumbs={getBreadcrumbs()} />
        <main className="flex-1 overflow-y-auto p-8 bg-paper">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tenders/create" element={<CreateTender />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/processing" element={<Processing />} />
            <Route path="/verification/:bidId" element={<VerificationResult />} />
            <Route path="/compliance/:bidId" element={<Compliance />} />
            <Route path="/risk/:bidId" element={<RiskAnalysis />} />
            <Route path="/decision/:bidId" element={<Decision />} />
            <Route path="/audit/:bidId" element={<AuditTrail />} />
            <Route path="/audit" element={<AuditTrail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
