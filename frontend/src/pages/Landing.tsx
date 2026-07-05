import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Gamepad2, AlertCircle } from 'lucide-react';

interface Game {
  id: string;
  name: string;
  slug: string;
  category: string;
  thumbnailUrl: string;
  description?: string;
}

export const Landing: React.FC = () => {
  const { t } = useLanguage();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch('/api/games');
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          setGames(data.data.games);
        } else {
          setError(data.message || 'Failed to load games catalog');
        }
      } catch (err) {
        console.error(err);
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-800 dark:to-dark-900 border border-slate-200/80 dark:border-dark-800 p-8 sm:p-12 mb-12 shadow-xl dark:shadow-2xl transition-colors duration-300">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-semibold text-primary-600 dark:text-primary-400 mb-6">
            <Gamepad2 size={12} />
            {t('sloganTag')}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white leading-tight mb-4">
            {t('heroTitlePrefix')} <br />
            <span className="text-primary-500 bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
              {t('heroTitleSuffix')}
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mb-8 leading-relaxed">
            {t('heroDescription')}
          </p>
        </div>
      </div>

      {/* Popular Games Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-primary-500 rounded-full animate-pulse" />
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          {t('popularGames')}
        </h2>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse glass-card rounded-2xl overflow-hidden aspect-[4/5] border border-slate-200 dark:border-dark-800">
              <div className="bg-slate-200 dark:bg-dark-800 h-[65%] w-full" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-dark-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-dark-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-12 glass-card rounded-2xl border-red-500/20 max-w-xl mx-auto gap-4">
          <AlertCircle className="text-red-500 dark:text-red-400 shrink-0" size={32} />
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white">Catalog Loading Error</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{error}</p>
          </div>
        </div>
      ) : (
        /* Game Catalog Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/game/${game.slug}`}
              className="glass-card glass-card-hover rounded-2xl overflow-hidden group flex flex-col h-full border border-slate-200 dark:border-dark-800 hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary-500/5"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-dark-900">
                <img
                  src={game.thumbnailUrl}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 dark:opacity-80" />
              </div>
              <div className="p-4 flex flex-col flex-grow bg-white/40 dark:bg-transparent">
                <span className="text-[10px] font-extrabold text-accent-600 dark:text-accent-400 uppercase tracking-widest mb-1">
                  {game.category}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                  {game.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
