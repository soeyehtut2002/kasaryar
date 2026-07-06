import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-100 dark:bg-dark-950 border-t border-slate-200 dark:border-dark-800 text-slate-500 dark:text-slate-400 py-8 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-wider">
              {t('brandName')}
            </span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center md:text-left">
              © {new Date().getFullYear()} {t('brandName')}. All rights reserved. Not affiliated with any game publisher.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/terms" className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors">Privacy Policy</Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new Event('open-support-chat'));
              }}
              className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-pointer bg-transparent border-0 font-medium"
            >
              Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
