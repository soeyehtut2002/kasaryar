import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const TermsPage: React.FC = () => {
  const { language } = useLanguage();
  const mm = language === 'mm';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-6">
        {mm ? 'စည်းကမ်းချက်များ' : 'Terms of Service'}
      </h1>
      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-4">
        <p>
          {mm
            ? 'ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုကို အသုံးပြုခြင်းဖြင့် အောက်ပါ စည်းကမ်းချက်များကို သဘောတူလက်ခံရာရောက်ပါသည်။'
            : 'By using our services, you agree to the following terms and conditions.'}
        </p>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-8 mb-4">1. General Terms</h2>
        <p>This is a placeholder for the Terms of Service. In a real application, you would list your legal terms here.</p>
      </div>
    </div>
  );
};
