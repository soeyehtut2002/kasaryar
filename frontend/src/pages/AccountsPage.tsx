import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  Star, CheckCircle, AlertTriangle, Award, Medal, Hexagon,
  MessageCircle, Search, Crown, Swords, Zap, Users
} from 'lucide-react';

type GameTab = 'MLBB' | 'PUBGM';

interface AccountListing {
  id: number;
  game: GameTab;
  seller: string;
  rating: number;
  reviewCount: number;
  rank: string;
  rankIcon: React.ReactNode;
  level: number;
  heroes?: number;
  skins?: number;
  characters?: number;
  outfits?: number;
  price: number;
  verified: boolean;
  hot: boolean;
  badge: string;
  badgeColor: string;
  description: string;
  descriptionMm: string;
  features: string[];
  featuresMm: string[];
}

const LISTINGS: AccountListing[] = [
  {
    id: 1, game: 'MLBB', seller: 'ProSeller_99', rating: 4.9, reviewCount: 128,
    rank: 'Mythical Glory', rankIcon: <Crown size={18} className="text-amber-400" />, level: 305,
    heroes: 120, skins: 85,
    price: 15, verified: true, hot: true,
    badge: 'TOP SELLER', badgeColor: 'bg-amber-500',
    description: 'Mythical Glory account with 85 rare skins including collector items. All heroes unlocked.',
    descriptionMm: 'Collector skins 85 ခုပါသော Mythical Glory အကောင့်။ Hero အားလုံးဖွင့်ထားသည်။',
    features: ['120 Heroes', '85 Skins', 'Mythical Glory', 'No ban history'],
    featuresMm: ['Hero 120 ကောင်', 'Skin 85 ခု', 'Mythical Glory', 'Ban မရှိ'],
  },
  {
    id: 2, game: 'MLBB', seller: 'MLBBStore_MM', rating: 4.7, reviewCount: 64,
    rank: 'Crown', rankIcon: <Hexagon size={18} className="text-purple-400" />, level: 68,
    outfits: 65,
    price: 10, verified: true, hot: false,
    badge: 'VERIFIED', badgeColor: 'bg-emerald-500',
    description: 'Solid Mythic account with many legendary skins. Great value for money.',
    descriptionMm: 'Legendary skin များပါသော Mythic အကောင့်။ ကောင်းမွန်သောတန်ဖိုး။',
    features: ['80 Heroes', '45 Skins', 'Mythic Rank', 'Season exclusive skins'],
    featuresMm: ['Hero 80 ကောင်', 'Skin 45 ခု', 'Mythic Rank', 'Season exclusive skin'],
  },
  {
    id: 3, game: 'MLBB', seller: 'GalaxyAcc', rating: 4.5, reviewCount: 41,
    rank: 'Legend', rankIcon: <Star size={18} className="text-emerald-400" />, level: 155,
    heroes: 55, skins: 22,
    price: 5, verified: false, hot: false,
    badge: 'BUDGET', badgeColor: 'bg-sky-500',
    description: 'Good Legend rank account, perfect for beginners looking to skip the early grind.',
    descriptionMm: 'Legend rank အကောင့်၊ ကစားမှုစတင်သူများအတွက် ကောင်းမွန်သည်။',
    features: ['55 Heroes', '22 Skins', 'Legend Rank', 'Email included'],
    featuresMm: ['Hero 55 ကောင်', 'Skin 22 ခု', 'Legend Rank', 'Email ပါဝင်'],
  },
  {
    id: 4, game: 'PUBGM', seller: 'PUBGKing_01', rating: 4.8, reviewCount: 97,
    rank: 'Conqueror', rankIcon: <Crown size={18} className="text-amber-400" />, level: 85,
    outfits: 120,
    price: 20, verified: true, hot: true,
    badge: 'TOP SELLER', badgeColor: 'bg-amber-500',
    description: 'Conqueror account with 60+ rare outfits, Glacier M416 and exclusive set items.',
    descriptionMm: 'Outfit 60+ ခု၊ Glacier M416 နှင့် exclusive set ပါသော Conqueror အကောင့်။',
    features: ['Conqueror', '60+ Outfits', 'Glacier M416', 'RP Royale Pass Max'],
    featuresMm: ['Conqueror', 'Outfit 60+ ခု', 'Glacier M416', 'RP Royale Pass Max'],
  },
  {
    id: 5, game: 'PUBGM', seller: 'TopUp_Center', rating: 4.6, reviewCount: 53,
    rank: 'Ace', rankIcon: <Award size={18} className="text-amber-300" />, level: 65,
    characters: 3, outfits: 30,
    price: 40000, verified: true, hot: false,
    badge: 'VERIFIED', badgeColor: 'bg-emerald-500',
    description: 'Ace rank with classic crates items and several premium outfits. Smooth gameplay record.',
    descriptionMm: 'Ace rank နှင့် classic crate item များ၊ premium outfit များပါသော အကောင့်။',
    features: ['Ace Rank', '30+ Outfits', 'Classic Crate Items', 'Clean history'],
    featuresMm: ['Ace Rank', 'Outfit 30+ ခု', 'Classic Crate Items', 'Clean history'],
  },
  {
    id: 6, game: 'PUBGM', seller: 'BudgetAcc_MM', rating: 4.2, reviewCount: 28,
    rank: 'Platinum', rankIcon: <Medal size={18} className="text-slate-300" />, level: 45,
    characters: 2, outfits: 12,
    price: 15000, verified: false, hot: false,
    badge: 'BUDGET', badgeColor: 'bg-sky-500',
    description: 'Starter Platinum account with some rare skins. Perfect for new players.',
    descriptionMm: 'Rare skin အနည်းငယ်ပါသော Platinum starter အကောင့်။ ကစားသားသစ်များအတွက်ကောင်း',
    features: ['Platinum Rank', '12 Outfits', 'Some rare items', 'Affordable'],
    featuresMm: ['Platinum Rank', 'Outfit 12 ခု', 'Rare item အနည်းငယ်', 'စျေးသင့်'],
  },
];

export const AccountsPage: React.FC = () => {
  const { language } = useLanguage();
  const { formatPrice } = useCurrency();
  const mm = language === 'mm';
  const [activeGame, setActiveGame] = useState<GameTab>('MLBB');
  const [searchQ, setSearchQ] = useState('');

  const filtered = LISTINGS.filter(l =>
    l.game === activeGame &&
    (searchQ === '' ||
      l.rank.toLowerCase().includes(searchQ.toLowerCase()) ||
      l.seller.toLowerCase().includes(searchQ.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-600 dark:text-violet-400 mb-3">
          <Users size={10} />
          {mm ? 'အကောင့်ရောင်းဝယ်ခြင်း' : 'Account Marketplace'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-1">
          {mm ? 'Game အကောင့်ရောင်းဝယ်ရေး' : 'Buy & Sell Game Accounts'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {mm
            ? 'MLBB နှင့် PUBGM အကောင့်များကို လုံခြုံစိတ်ချစွာ ရောင်းဝယ်ပါ'
            : 'Safe & verified MLBB and PUBG Mobile account trading platform'}
        </p>
      </div>

      {/* Safety Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 mb-6">
        <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-0.5">
            {mm ? 'ဝယ်ယူမတိုင်မီ သတိထားပါ' : 'Trading Safety Notice'}
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-500">
            {mm
              ? 'KasarYar မှ escrow service ဖြင့် ပွင့်လင်းမြင်သာသောငွေပေးချေမှုကို အာမခံပါသည်။ မည်သည့်ကြားညှပ်အဖြစ်မျှ ဆောင်ရွက်ပေးသည်'
              : 'KasarYar provides escrow-based payment protection. We act as a trusted middleman to ensure safe transactions for both buyers and sellers.'}
          </p>
        </div>
      </div>

      {/* Game Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(['MLBB', 'PUBGM'] as GameTab[]).map(g => (
          <button
            key={g}
            onClick={() => setActiveGame(g)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
              activeGame === g
                ? g === 'MLBB'
                  ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/25'
                  : 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 text-slate-600 dark:text-slate-300 hover:border-primary-500/40'
            }`}
          >
            {g === 'MLBB' ? <Swords size={15} /> : <Zap size={15} />}
            {g === 'MLBB' ? 'Mobile Legends' : 'PUBG Mobile'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          placeholder={mm ? 'Rank သို့မဟုတ် ရောင်းသူ ရှာပါ...' : 'Search by rank or seller...'}
          className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
        />
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div
            key={item.id}
            className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-800 hover:border-primary-500/30 hover:shadow-lg dark:hover:shadow-primary-500/10 transition-all duration-300 overflow-hidden flex flex-col group"
          >
            {/* Card Header */}
            <div className={`relative p-4 pb-3 ${
              item.game === 'MLBB'
                ? 'bg-gradient-to-br from-blue-600 to-indigo-700'
                : 'bg-gradient-to-br from-amber-500 to-orange-600'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 bg-white/10 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                    {item.rankIcon}
                    <div>
                      <p className="text-white font-black text-sm leading-tight">{item.rank}</p>
                      <p className="text-white/70 text-[10px]">Lv. {item.level}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`${item.badgeColor} text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full`}>
                    {item.badge}
                  </span>
                  {item.hot && (
                    <span className="bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full tracking-wider">
                      HOT
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 flex flex-col flex-1">
              {/* Seller Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    {item.seller.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.seller}</span>
                  {item.verified && <CheckCircle size={11} className="text-emerald-500" />}
                </div>
                <div className="flex items-center gap-0.5">
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{item.rating}</span>
                  <span className="text-[10px] text-slate-400">({item.reviewCount})</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {item.game === 'MLBB' ? (
                  <>
                    <div className="bg-slate-50 dark:bg-dark-800/60 rounded-lg p-2 text-center">
                      <p className="text-xs font-black text-slate-800 dark:text-white">{item.heroes}</p>
                      <p className="text-[9px] text-slate-400">{mm ? 'Hero' : 'Heroes'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-dark-800/60 rounded-lg p-2 text-center">
                      <p className="text-xs font-black text-slate-800 dark:text-white">{item.skins}</p>
                      <p className="text-[9px] text-slate-400">{mm ? 'Skin' : 'Skins'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-slate-50 dark:bg-dark-800/60 rounded-lg p-2 text-center">
                      <p className="text-xs font-black text-slate-800 dark:text-white">{item.characters}</p>
                      <p className="text-[9px] text-slate-400">{mm ? 'Character' : 'Characters'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-dark-800/60 rounded-lg p-2 text-center">
                      <p className="text-xs font-black text-slate-800 dark:text-white">{item.outfits}+</p>
                      <p className="text-[9px] text-slate-400">{mm ? 'Outfit' : 'Outfits'}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1 mb-3">
                {(mm ? item.featuresMm : item.features).slice(0, 3).map((f, i) => (
                  <span key={i} className="text-[9px] font-semibold px-1.5 py-0.5 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded">
                    ✓ {f}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-1">
                {mm ? item.descriptionMm : item.description}
              </p>

              {/* Price + CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-dark-800">
                <div>
                  <p className="text-[9px] text-slate-400 mb-0.5">{mm ? 'ရောင်းဈေး' : 'Price'}</p>
                  <p className="text-base font-black text-slate-800 dark:text-white">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary-500 to-violet-500 hover:from-primary-600 hover:to-violet-600 text-white text-[11px] font-bold rounded-xl shadow-md shadow-primary-500/20 transition-all cursor-pointer"
                >
                  <MessageCircle size={12} />
                  {mm ? 'ဆက်သွယ်ရန်' : 'Inquire'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sell Your Account CTA */}
      <div className="mt-10 rounded-2xl bg-gradient-to-br from-violet-600 via-primary-500 to-blue-600 p-8 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <Crown size={28} className="mx-auto mb-3 text-amber-300" />
        <h2 className="text-xl font-black mb-2">
          {mm ? 'သင်၏ Game အကောင့်ကို ရောင်းချပါ' : 'Sell Your Game Account'}
        </h2>
        <p className="text-white/80 text-xs mb-5 max-w-md mx-auto">
          {mm
            ? 'KasarYar တွင် MLBB နှင့် PUBGM အကောင့်များကို လုံခြုံစိတ်ချစွာ ရောင်းချနိုင်သည်။ ကျွန်ုပ်တို့ Escrow system ဖြင့် ငွေပေးချေမှုကို ကာကွယ်ပေးသည်။'
            : 'List your MLBB or PUBG Mobile account on KasarYar. Our escrow system protects both buyer and seller in every transaction.'}
        </p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all shadow-xl cursor-pointer"
        >
          <MessageCircle size={15} />
          {mm ? 'ကျွန်ုပ်တို့ကို ဆက်သွယ်ပါ' : 'Contact Us to List'}
        </button>
      </div>
    </div>
  );
};
