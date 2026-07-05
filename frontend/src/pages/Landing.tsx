import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { AlertCircle, ChevronLeft, ChevronRight, Zap, Flame, Gift } from 'lucide-react';

interface Game {
  id: string;
  name: string;
  slug: string;
  category: string;
  thumbnailUrl: string;
  description?: string;
}

const BANNERS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80',
    title: 'Mobile Legends Starlight',
    subtitle: 'Get 30% bonus diamonds on first recharge this month.',
    color: 'from-blue-600/90 to-indigo-900/90'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1200&q=80',
    title: 'PUBG Mobile UC Sale',
    subtitle: 'Exclusive outfits and weapon skins available now.',
    color: 'from-amber-600/90 to-orange-900/90'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200&q=80',
    title: 'Valorant Points Drop',
    subtitle: 'New Night Market is here. Top up now!',
    color: 'from-red-600/90 to-rose-900/90'
  }
];

export const Landing: React.FC = () => {
  const { t, language } = useLanguage();
  const mm = language === 'mm';
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBanner, setCurrentBanner] = useState(0);

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

  // Auto-slide banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-colors duration-300">
      
      {/* ── 1. Hero Carousel Banner (Midasbuy style) ── */}
      <div className="relative w-full h-[200px] sm:h-[320px] md:h-[400px] rounded-2xl overflow-hidden mb-10 group shadow-lg">
        {BANNERS.map((banner, idx) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} via-black/50 to-transparent`} />
            
            <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 md:px-24">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-2 max-w-lg drop-shadow-md leading-tight">
                {banner.title}
              </h2>
              <p className="text-white/90 text-xs sm:text-sm md:text-base max-w-md drop-shadow font-medium mb-6">
                {banner.subtitle}
              </p>
              <button className="w-max px-6 py-2.5 bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-100 transition-colors shadow-lg cursor-pointer">
                {mm ? 'ယခုဝယ်မည်' : 'Top Up Now'}
              </button>
            </div>
          </div>
        ))}

        {/* Controls */}
        <button onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
          <ChevronLeft size={20} />
        </button>
        <button onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
          <ChevronRight size={20} />
        </button>
        
        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentBanner ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── 2. Flash Sale Section ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Zap size={18} className="text-red-500 fill-red-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              {mm ? 'အထူးလျှော့စျေးများ' : 'Flash Sales'}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold animate-pulse">
            03 : 45 : 12
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Mock Flash Sale Items */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-dark-900 rounded-xl border border-red-100 dark:border-red-900/30 overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
              <div className="relative h-28 bg-gradient-to-br from-red-50 to-orange-50 dark:from-dark-800 dark:to-dark-800 flex items-center justify-center overflow-hidden">
                <Gift size={40} className="text-red-400 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                  -20%
                </div>
              </div>
              <div className="p-3 text-center">
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-1">PUBGM 660 UC</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-red-500 font-black text-sm">18,500K</p>
                  <p className="text-[10px] text-slate-400 line-through">22,000K</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Promotional Ad Banner ── */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 sm:p-8 mb-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold tracking-widest uppercase mb-3">
            {mm ? 'အထူးပရိုမိုးရှင်း' : 'Special Promo'}
          </span>
          <h3 className="text-2xl font-black mb-2 leading-tight">
            {mm ? 'KbzPay ဖြင့် ဝယ်ယူပြီး Cash Back ရယူပါ' : 'Get 5% Cashback with KBZPay'}
          </h3>
          <p className="text-sm text-white/80 max-w-md">
            {mm ? 'ရက်သတ္တပတ်တိုင်း သောကြာနေ့တိုင်းတွင် KBZPay ဖြင့် ငွေပေးချေမှုတိုင်းအတွက် ၅% ငွေပြန်အမ်းပေးပါသည်။' : 'Enjoy 5% cashback on all top-ups every Friday when you pay using KBZPay.'}
          </p>
        </div>
        <button className="shrink-0 px-6 py-3 bg-white text-indigo-600 font-black text-sm rounded-xl hover:scale-105 transition-transform shadow-xl">
          {mm ? 'အသေးစိတ်ကြည့်ရန်' : 'Learn More'}
        </button>
      </div>

      {/* ── 4. Popular Games Grid ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <Flame size={18} className="text-primary-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('popularGames')}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-dark-900 rounded-xl overflow-hidden aspect-[3/4] border border-slate-200 dark:border-dark-800">
                <div className="bg-slate-200 dark:bg-dark-800 h-full w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8 bg-white dark:bg-dark-900 rounded-xl border border-red-500/20 max-w-xl mx-auto gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={24} />
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Catalog Error</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
            {games.map((game) => (
              <Link
                key={game.id}
                to={`/game/${game.slug}`}
                className="group relative bg-white dark:bg-dark-900 rounded-xl overflow-hidden aspect-[3/4] border border-slate-200 dark:border-dark-800 hover:border-primary-500/50 hover:shadow-lg dark:hover:shadow-primary-500/20 transition-all duration-300"
              >
                <img
                  src={game.thumbnailUrl}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end">
                  <span className="text-[8px] font-extrabold text-primary-400 uppercase tracking-widest mb-0.5">
                    {game.category}
                  </span>
                  <h3 className="font-bold text-xs text-white line-clamp-2 leading-tight">
                    {game.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
