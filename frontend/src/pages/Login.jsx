import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { authAPI } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email ? email.trim() : '';
    const trimmedPassword = password ? password.trim() : '';

    // Validation: Empty email/ID or empty password must be rejected
    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter both Email/ID and Password.');
      return;
    }

    setLoading(true);

    try {
      // Prototype / Demo Mode Authentication:
      // Accepts any non-empty email/ID and password while preserving the demo Officer profile (Priya Sharma)
      let token = 'demo-jwt-token-' + Date.now();
      let user = { 
        id: 1, 
        name: 'Priya Sharma', 
        email: trimmedEmail,
        role: 'officer'
      };

      try {
        const response = await authAPI.login(trimmedEmail, trimmedPassword);
        const resData = response?.data || response;
        if (resData?.access_token) {
          token = resData.access_token;
        }
        if (resData?.user) {
          user = {
            ...user,
            ...resData.user,
            name: resData.user.name || 'Priya Sharma',
            role: 'officer'
          };
        }
      } catch (err) {
        // Fallback for offline or prototype demo mode
        console.log('Prototype demo login active for:', trimmedEmail);
      }

      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-ink-navy font-bold mb-1">BidSetu</h1>
          <p className="text-slate-ink text-sm">Procurement Compliance Platform</p>
          <p className="text-gray-500 text-xs italic mt-2">"Automate verification, not authority"</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-seal-red/10 border border-seal-red/20 rounded-lg text-seal-red text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-ink mb-1">Email / Officer ID</label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@bidsetu.gov.in"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-ink-navy focus:ring-1 focus:ring-ink-navy outline-none transition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-ink mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-ink-navy focus:ring-1 focus:ring-ink-navy outline-none transition"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-ink-navy text-white py-3 rounded-lg font-semibold hover:bg-ink-navy/90 transition disabled:opacity-70 mt-2"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-8 bg-gray-50 rounded-lg p-3 text-xs text-gray-500 text-center border border-gray-100">
          Demo login: Enter any email/ID and password (e.g. test@gmail.com / 1234)
        </div>
      </div>
    </div>
  );
};

export default Login;
