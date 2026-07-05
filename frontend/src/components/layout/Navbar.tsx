import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Shield, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-wider text-slate-800 dark:text-slate-100 bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent">
                {t('brandName')}
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-primary-500 border border-primary-500/30 rounded uppercase bg-primary-500/5">
                {t('storeTag')}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Nav Links */}
            <Link 
              to="/" 
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors px-2 py-1"
            >
              {t('games')}
            </Link>

            {/* Admin Dashboard */}
            {user && user.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-accent-600 dark:text-accent-400 bg-accent-500/10 border border-accent-500/20 rounded-lg hover:bg-accent-500/20 transition-all"
              >
                <Shield size={14} />
                <span className="hidden sm:inline">{t('adminDashboard')}</span>
              </Link>
            )}

            {/* User Dashboard */}
            {user && user.role === 'USER' && (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-500 dark:text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-all"
              >
                <LayoutDashboard size={14} />
                <span className="hidden sm:inline">{t('myDashboard')}</span>
              </Link>
            )}

            {/* Day/Night Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800/50 rounded-xl border border-slate-200 dark:border-dark-800 transition-all"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'mm' : 'en')}
              className="px-2.5 py-1.5 text-xs font-extrabold rounded-xl border border-slate-200 dark:border-dark-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800/50 transition-all flex items-center gap-1 cursor-pointer"
              title={language === 'en' ? 'မြန်မာဘာသာသို့ ပြောင်းရန်' : 'Switch to English'}
            >
              <span>{language === 'en' ? '🇲🇲' : '🇺🇸'}</span>
              <span className="text-[10px] tracking-wider uppercase font-mono">{language === 'en' ? 'MM' : 'EN'}</span>
            </button>

            {/* Authentication Buttons */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-dark-800">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{user.username}</span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded-xl transition-all"
                  title={t('logout')}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-dark-800">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 px-2.5 py-2 transition-colors"
                >
                  {t('signIn')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-lg shadow-primary-500/15 hover:shadow-primary-500/25 transition-all"
                >
                  {t('signUp')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
