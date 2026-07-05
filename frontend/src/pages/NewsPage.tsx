import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Newspaper, Clock, TrendingUp, Zap, ChevronRight } from 'lucide-react';

interface NewsItem {
  id: number;
  category: string;
  categoryColor: string;
  title: string;
  titleMm: string;
  excerpt: string;
  excerptMm: string;
  date: string;
  readTime: string;
  image: string;
  hot: boolean;
  tags: string[];
}

const NEWS_DATA: NewsItem[] = [
  {
    id: 1,
    category: 'MLBB',
    categoryColor: 'bg-blue-500',
    title: 'Mobile Legends Season 35 Patch Notes — New Hero "Zhuxin" Released',
    titleMm: 'Mobile Legends Season 35 Patch Notes — Hero အသစ် "Zhuxin" ဖြန့်ချိ',
    excerpt: 'Moonton officially released the new hero Zhuxin in Season 35 patch. This support hero brings a unique playstyle with crowd control abilities and team buff mechanics.',
    excerptMm: 'Moonton မှ Season 35 patch တွင် hero အသစ် Zhuxin ကို တရားဝင်ဖြန့်ချိလိုက်ပါပြီ။ ဤ support hero သည် crowd control နှင့် team buff လုပ်ဆောင်ချက်တို့ဖြင့် ထူးခြားသောကစားပုံကို ယူဆောင်လာသည်။',
    date: 'Jul 5, 2025',
    readTime: '3 min',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
    hot: true,
    tags: ['MLBB', 'Patch', 'New Hero']
  },
  {
    id: 2,
    category: 'PUBG Mobile',
    categoryColor: 'bg-amber-500',
    title: 'PUBG Mobile 3.4 Update: New Zombie Mode & Ranked Season Reset',
    titleMm: 'PUBG Mobile 3.4 Update — Zombie Mode အသစ်နှင့် Ranked Season ပြန်လည်စတင်',
    excerpt: 'The biggest PUBG Mobile update of the year brings a new Zombie-themed Limited Time Mode plus Ranked Season 2025 C2 reset with exclusive rewards.',
    excerptMm: 'ယနှစ်အကြီးဆုံး PUBG Mobile update တွင် Zombie Limited Time Mode နှင့် Ranked Season 2025 C2 reset နှင့် exclusive rewards များပါဝင်သည်။',
    date: 'Jul 3, 2025',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600&q=80',
    hot: true,
    tags: ['PUBGM', 'Update', 'Ranked']
  },
  {
    id: 3,
    category: 'MLBB',
    categoryColor: 'bg-blue-500',
    title: 'MLBB World Championship 2025: SEA Teams Qualify for Grand Finals',
    titleMm: 'MLBB World Championship 2025 — SEA အဖွဲ့များ Grand Finals ဝင်ရောက်ကြ',
    excerpt: 'Four Southeast Asian teams have qualified for the MLBB World Championship 2025 Grand Finals to be held in Kuala Lumpur this December.',
    excerptMm: 'အရှေ့တောင်အာရှမှ အဖွဲ့ 4 ဖွဲ့သည် ဒီဇင်ဘာတွင် Kuala Lumpur တွင် ကျင်းပမည့် MLBB World Championship 2025 Grand Finals သို့ ဝင်ရောက်ခွင့်ရခဲ့ကြပြီ။',
    date: 'Jul 1, 2025',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80',
    hot: false,
    tags: ['MLBB', 'Esports', 'Tournament']
  },
  {
    id: 4,
    category: 'PUBG Mobile',
    categoryColor: 'bg-amber-500',
    title: 'PUBG Mobile Collaborates with Arcane Season 2 — Limited Skins Available',
    titleMm: 'PUBG Mobile မှ Arcane Season 2 နှင့် ပူးပေါင်း — Limited Skin များပါဝင်',
    excerpt: 'PUBG Mobile has announced an exciting collaboration with Netflix\'s Arcane Season 2, featuring exclusive character skins and weapon wraps.',
    excerptMm: 'PUBG Mobile သည် Netflix ၏ Arcane Season 2 နှင့် ပူးပေါင်းကြောင်း ကြေငြာပြီး exclusive character skin များနှင့် weapon wrap များပါဝင်သည်။',
    date: 'Jun 28, 2025',
    readTime: '3 min',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80',
    hot: false,
    tags: ['PUBGM', 'Collab', 'Skins']
  },
  {
    id: 5,
    category: 'MLBB',
    categoryColor: 'bg-blue-500',
    title: 'Best META Heroes in MLBB Season 35 — Tier List Guide',
    titleMm: 'MLBB Season 35 တွင် အကောင်းဆုံး META Hero များ — Tier List လမ်းညွှန်',
    excerpt: 'Our experts compiled the complete Tier List for MLBB Season 35. Find out which heroes dominate the current META and which to avoid.',
    excerptMm: 'ကျွမ်းကျင်သူများမှ MLBB Season 35 ၏ Tier List အပြည့်ကို စုစည်းထားပါသည်။ လက်ရှိ META ကို ဘယ် hero တွေ ဦးဆောင်နေသလဲ သိရှိပါ။',
    date: 'Jun 25, 2025',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
    hot: false,
    tags: ['MLBB', 'Guide', 'META']
  },
  {
    id: 6,
    category: 'PUBG Mobile',
    categoryColor: 'bg-amber-500',
    title: 'How to Climb to Conqueror in PUBG Mobile — Pro Tips 2025',
    titleMm: 'PUBG Mobile တွင် Conqueror ရောက်နည်း — Pro Tips 2025',
    excerpt: 'Step-by-step guide on how to rank up efficiently to Conqueror in PUBG Mobile Ranked Season 2025 using proven strategies.',
    excerptMm: 'PUBG Mobile Ranked Season 2025 တွင် Conqueror ရောက်ရှိရန် ထိရောက်သောဗျူဟာများဖြင့် rank တက်ရမည့်နည်းလမ်းများကို တစ်ဆင့်ချင်းရှင်းပြထားသည်။',
    date: 'Jun 20, 2025',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=600&q=80',
    hot: false,
    tags: ['PUBGM', 'Guide', 'Ranked']
  },
];

type FilterType = 'All' | 'MLBB' | 'PUBG Mobile';

export const NewsPage: React.FC = () => {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<FilterType>('All');
  const mm = language === 'mm';

  const filtered = filter === 'All' ? NEWS_DATA : NEWS_DATA.filter(n => n.category === filter);
  const featured = NEWS_DATA.filter(n => n.hot);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-[10px] font-bold text-primary-600 dark:text-primary-400 mb-3">
          <Newspaper size={10} />
          {mm ? 'ဂိမ်းသတင်းများ' : 'Game News & Updates'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-1">
          {mm ? 'နောက်ဆုံးရ ဂိမ်းသတင်းများ' : 'Latest Gaming News'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {mm ? 'MLBB, PUBG Mobile နှင့် တခြား ဂိမ်းများ၏ update များ' : 'Stay updated with MLBB, PUBG Mobile patches, esports & guides'}
        </p>
      </div>

      {/* Hot / Featured */}
      {featured.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-red-500" />
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">
              {mm ? 'ရေပန်းစားသောသတင်း' : 'Trending Now'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map(item => (
              <div key={item.id}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-dark-800 hover:border-primary-500/30 transition-all duration-300 cursor-pointer hover:shadow-lg dark:hover:shadow-primary-500/10 bg-white dark:bg-dark-900"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`${item.categoryColor} text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full`}>{item.category}</span>
                    <span className="bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Zap size={8} /> HOT
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary-500 transition-colors line-clamp-2 mb-1.5">
                    {mm ? item.titleMm : item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {mm ? item.excerptMm : item.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={10} />{item.date}</span>
                      <span>{item.readTime} read</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary-500 flex items-center gap-0.5">
                      {mm ? 'ဆက်ဖတ်ရန်' : 'Read more'} <ChevronRight size={10} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(['All', 'MLBB', 'PUBG Mobile'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filter === f
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                : 'bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 text-slate-600 dark:text-slate-300 hover:border-primary-500/40'
            }`}
          >
            {f === 'All' ? (mm ? 'အားလုံး' : 'All') : f}
          </button>
        ))}
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div key={item.id}
            className="group bg-white dark:bg-dark-900 rounded-xl overflow-hidden border border-slate-200 dark:border-dark-800 hover:border-primary-500/30 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col"
          >
            <div className="relative h-36 overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className={`absolute top-2 left-2 ${item.categoryColor} text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full`}>
                {item.category}
              </span>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-primary-500 transition-colors line-clamp-2 mb-2">
                {mm ? item.titleMm : item.title}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-1">
                {mm ? item.excerptMm : item.excerpt}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-dark-800 pt-2.5">
                <span className="flex items-center gap-1"><Clock size={10} />{item.date}</span>
                <span>{item.readTime} read</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
