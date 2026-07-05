import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Shield, LogOut, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-wider text-slate-100 bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent">
                KASARYAR
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-primary-500 border border-primary-500/30 rounded uppercase bg-primary-500/5">
                Store
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-primary-400 transition-colors">
              Games
            </Link>

            {user && user.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-accent-400 bg-accent-500/10 border border-accent-500/20 rounded-lg hover:bg-accent-500/20 transition-all"
              >
                <Shield size={14} />
                Admin Dashboard
              </Link>
            )}

            {user && user.role === 'USER' && (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-all"
              >
                <LayoutDashboard size={14} />
                My Dashboard
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-dark-800">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200">{user.username}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-dark-800">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-slate-100 px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-lg shadow-lg shadow-primary-500/15 hover:shadow-primary-500/25 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
