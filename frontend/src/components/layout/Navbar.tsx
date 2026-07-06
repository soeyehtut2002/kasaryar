import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency, Currency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Shield, LogOut, LayoutDashboard, Sun, Moon, Globe,
  Gamepad2, Newspaper, Users, Menu, X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const navLinks = [
    { to: '/', label: language === 'mm' ? 'ဂိမ်းများ' : 'Games', icon: <Gamepad2 size={13} /> },
    { to: '/news', label: language === 'mm' ? 'သတင်း' : 'News', icon: <Newspaper size={13} /> },
    { to: '/accounts', label: language === 'mm' ? 'အကောင့်ရောင်းဝယ်' : 'Accounts', icon: <Users size={13} /> },
  ];


  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* ── Brand ──────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <img src="/logo.png" alt="Kasar Yar Logo" className="h-10 sm:h-12 w-auto object-contain" />
          </Link>

          {/* ── Desktop Nav Links ───────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-500 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-slate-100/60 dark:hover:bg-dark-800/40'
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* ── Right Controls ─────────────────────────────────────── */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Admin/User Dashboard */}
            {user?.role === 'ADMIN' && (
              <Link to="/admin"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
              >
                <Shield size={12} />
                <span>Admin</span>
              </Link>
            )}
            {user?.role === 'USER' && (
              <Link to="/dashboard"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-primary-500 dark:text-primary-400 bg-primary-500/10 border border-primary-500/20 hover:bg-primary-500/20 transition-all"
              >
                <LayoutDashboard size={12} />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800/50 rounded-lg border border-slate-200 dark:border-dark-800 transition-all"
              title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>

            {/* Language & Currency */}
            <div className="flex bg-slate-100 dark:bg-dark-800/50 rounded-lg border border-slate-200 dark:border-dark-800 p-0.5">
              <button
                onClick={() => setLanguage(language === 'en' ? 'mm' : 'en')}
                className="px-2 py-1 text-[10px] font-bold rounded-md text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-dark-700 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Globe size={12} className="text-slate-400" />
                <span className="tracking-wider uppercase">{language === 'en' ? 'MM' : 'EN'}</span>
              </button>
              
              <div className="w-px bg-slate-300 dark:bg-dark-600 my-1 mx-0.5"></div>
              
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent text-[10px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer outline-none px-1 appearance-none"
              >
                <option value="USD">USD</option>
                <option value="MMK">MMK</option>
                <option value="THB">THB</option>
              </select>
            </div>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-dark-800">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{user.username}</span>
                  <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1 pl-1.5 border-l border-slate-200 dark:border-dark-800">
                <Link to="/login" className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-500 px-2 py-1 transition-colors">
                  {t('signIn')}
                </Link>
                <Link to="/register" className="px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-violet-500 hover:from-primary-600 hover:to-violet-600 rounded-lg shadow-md shadow-primary-500/20 transition-all">
                  {t('signUp')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800/50 transition-all"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Dropdown ─────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-dark-800 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800/40'
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}

            <div className="border-t border-slate-100 dark:border-dark-800 pt-2 mt-2">
              {user ? (
                <div className="space-y-1">
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
                      <Shield size={14} /> Admin Dashboard
                    </Link>
                  )}
                  {user.role === 'USER' && (
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-primary-500 hover:bg-primary-500/10">
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-500/10">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 px-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-dark-700 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-800 transition-all">
                    {t('signIn')}
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-violet-500 rounded-lg shadow-md transition-all">
                    {t('signUp')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
