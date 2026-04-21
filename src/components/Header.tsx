import { motion } from 'motion/react';
import { Languages, ShieldAlert } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { speak } from '../lib/speech';

interface HeaderProps {
  language: Language;
  onLanguageToggle: () => void;
}

export default function Header({ language, onLanguageToggle }: HeaderProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const handleLangToggle = () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    onLanguageToggle();
    speak(nextLang === 'ar' ? 'تم تحويل اللغة إلى العربية' : 'Language changed to English', nextLang);
  };

  return (
    <header 
      className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-4 md:px-8"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg shrink-0">
          {language === 'ar' ? 'د' : 'D'}
        </div>
        <div className="min-w-0">
          <h1 className="text-slate-900 font-black leading-none tracking-tight text-sm md:text-lg truncate">
            {t.title}
          </h1>
          <p className="text-[9px] md:text-[11px] text-blue-600 font-black tracking-[0.2em] uppercase mt-1 hidden sm:block italic opacity-80">
            {language === 'ar' ? 'نظام الملاحة الذكي' : 'Navigation System'}
          </p>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4 md:gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLangToggle}
          className="text-[10px] md:text-xs font-black tracking-widest text-slate-400 hover:text-blue-600 uppercase border-r border-slate-200 pr-4 md:pr-6 h-10 flex items-center"
        >
          {t.languageToggle}
        </motion.button>
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm shrink-0">
          <ShieldAlert size={18} className="md:size-5" />
        </div>
      </div>
    </header>
  );
}
