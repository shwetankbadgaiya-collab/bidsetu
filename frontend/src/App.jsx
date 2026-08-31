import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

// Pages
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

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const Layout = () => {
  const location = useLocation();
  const path = location.pathname;

  const getBreadcrumbs = () => {
    if (path.includes('/verification/')) {
      const id = path.split('/verification/')[1] || 'BID003';
      return [{ label: 'Tenders', path: '/dashboard' }, { label: 'TDR-2026-014', path: '/dashboard' }, { label: `Bid #${id}`, path }];
    }
    if (path.includes('/compliance/')) {
      const id = path.split('/compliance/')[1] || 'BID003';
      return [{ label: 'Tenders', path: '/dashboard' }, { label: 'TDR-2026-014', path: '/dashboard' }, { label: `Bid #${id}`, path: `/verification/${id}` }, { label: 'Compliance', path }];
    }
    if (path.includes('/risk/')) {
      const id = path.split('/risk/')[1] || 'BID003';
      return [{ label: 'Tenders', path: '/dashboard' }, { label: 'TDR-2026-014', path: '/dashboard' }, { label: `Bid #${id}`, path: `/verification/${id}` }, { label: 'Risk Analysis', path }];
    }
    if (path.includes('/decision/')) {
      const id = path.split('/decision/')[1] || 'BID003';
      return [{ label: 'Tenders', path: '/dashboard' }, { label: 'TDR-2026-014', path: '/dashboard' }, { label: `Bid #${id}`, path: `/verification/${id}` }, { label: 'Officer Decision', path }];
    }
    if (path.includes('/reports')) {
      return [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Reports', path }];
    }
    if (path.includes('/audit')) {
      return [{ label: 'Tenders', path: '/dashboard' }, { label: 'TDR-2026-014', path: '/dashboard' }, { label: 'Audit Trail', path }];
    }
    if (path.includes('/upload')) {
      return [{ label: 'Tenders', path: '/dashboard' }, { label: 'TDR-2026-014', path: '/dashboard' }, { label: 'Upload Documents', path }];
    }
    if (path.includes('/processing')) {
      return [{ label: 'Tenders', path: '/dashboard' }, { label: 'TDR-2026-014', path: '/dashboard' }, { label: 'AI Verification', path }];
    }
    if (path.includes('/tenders/create')) {
      return [{ label: 'Tenders', path: '/dashboard' }, { label: 'Create Tender', path }];
    }
    if (path.includes('/settings')) {
      return [{ label: 'Settings', path: '/settings' }, { label: 'Profile', path }];
    }
    return [{ label: 'Tenders', path: '/dashboard' }, { label: 'TDR-2026-014', path: '/dashboard' }, { label: 'Dashboard', path: '/dashboard' }];
  };

  return (
    <div className="flex h-screen overflow-hidden bg-paper w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar breadcrumbs={getBreadcrumbs()} />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tenders/create" element={<CreateTender />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/processing" element={<Processing />} />
            <Route path="/verification/:bidId" element={<VerificationResult />} />
            <Route path="/compliance/:bidId" element={<Compliance />} />
            <Route path="/risk/:bidId" element={<RiskAnalysis />} />
            <Route path="/decision/:bidId" element={<Decision />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit" element={<AuditTrail />} />
            <Route path="/audit/:bidId" element={<AuditTrail />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
