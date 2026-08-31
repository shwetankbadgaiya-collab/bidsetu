import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';

const TopBar = ({ breadcrumbs = [] }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'O';
  const name = user?.name || 'Officer';

  return (
    <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-10 sticky top-0">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              {isLast ? (
                <span className="font-semibold text-slate-ink">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="text-gray-400 hover:text-ink-navy transition">
                  {crumb.label}
                </Link>
              )}
              {!isLast && <span className="mx-2 text-gray-300">&gt;</span>}
            </React.Fragment>
          );
        })}
      </div>

      {/* Right Items */}
      <div className="flex items-center">
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-2 rounded-full transition"
          >
            <div className="w-8 h-8 rounded-full bg-ink-navy text-white flex items-center justify-center font-semibold text-sm">
              {initial}
            </div>
            <span className="text-sm font-medium text-slate-ink">{name}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
              <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Settings</Link>
              <div className="border-t border-gray-100 my-1"></div>
              <button 
                onClick={() => { setMenuOpen(false); logout(); }}
                className="block w-full text-left px-4 py-2 text-sm text-seal-red hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
