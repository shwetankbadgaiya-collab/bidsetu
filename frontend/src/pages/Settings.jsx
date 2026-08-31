import React from 'react';
import { useAuth } from '../App';
import StatusPill from '../components/StatusPill';

export default function Settings() {
  const { user } = useAuth() || { user: { name: 'Priya Sharma', email: 'priya.sharma@gov.in', role: 'Officer' } };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="font-display text-3xl text-ink-navy">Settings</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-ink-navy text-white flex items-center justify-center text-2xl font-bold font-display">
          {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink-navy">{user?.name || 'User Name'}</h2>
          <p className="text-gray-500 mb-2">{user?.email || 'user@example.com'}</p>
          <StatusPill status="verified" /> {/* using verified status pill styling for the role as placeholder, or default */}
          <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-slate-ink text-xs font-bold rounded-full">
            Role: {user?.role || 'Officer'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-lg text-ink-navy mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-ink mb-1">Current Password</label>
            <input type="password" disabled className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-ink mb-1">New Password</label>
            <input type="password" disabled className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-ink mb-1">Confirm Password</label>
            <input type="password" disabled className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50" />
          </div>
          <button 
            disabled 
            title="Available in production"
            className="mt-4 bg-ink-navy text-white px-6 py-2 rounded-lg font-medium opacity-50 cursor-not-allowed"
          >
            Update Password
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-lg text-ink-navy mb-4">Preferences</h3>
        <div className="space-y-6 max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-ink">Email notifications for bid status changes</span>
            <div className="w-11 h-6 bg-verified-teal rounded-full relative cursor-pointer opacity-80">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-slate-ink block mb-2">Theme</span>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="radio" checked readOnly className="text-ink-navy focus:ring-ink-navy" /> Light
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
