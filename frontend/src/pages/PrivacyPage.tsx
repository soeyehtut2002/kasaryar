import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPage: React.FC = () => {
  const { language } = useLanguage();
  const mm = language === 'mm';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-6">
        {mm ? 'ကိုယ်ရေးကိုယ်တာမူဝါဒ' : 'Privacy Policy'}
      </h1>
      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-4">
        <p>
          {mm
            ? 'ကျွန်ုပ်တို့သည် သင့်ကိုယ်ရေးအချက်အလက်များကို လုံခြုံစွာထိန်းသိမ်းရန် ကတိပြုပါသည်။'
            : 'We are committed to protecting your privacy and personal information.'}
        </p>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-8 mb-4">1. Data Collection</h2>
        <p>This is a placeholder for the Privacy Policy. In a real application, you would detail your data practices here.</p>
      </div>
    </div>
  );
};
