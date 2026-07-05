import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-950 border-t border-dark-800 text-slate-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-black text-slate-200 tracking-wider">
              KASARYAR
            </span>
            <p className="text-xs text-slate-500 mt-1">
              © {new Date().getFullYear()} KasarYar. All rights reserved. Not affiliated with any game publisher.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
