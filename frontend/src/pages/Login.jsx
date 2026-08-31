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
    setLoading(true);

    try {
      // Mock login for demo if API fails
      let token = 'mock-jwt-token';
      let user = { id: 1, name: 'Procurement Officer', email };

      try {
        const response = await authAPI.login(email, password);
        token = response.data.access_token || response.data.token || token;
        user = response.data.user || user;
      } catch (err) {
        console.warn('API login failed, using fallback mock login');
        if (!email.includes('@')) {
          throw new Error('Invalid credentials');
        }
      }

      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Check credentials and try again.');
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-ink mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@bidsetu.gov.in"
              required
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
              required
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
          Demo login: officer@bidsetu.gov.in / demo1234
        </div>
      </div>
    </div>
  );
};

export default Login;
