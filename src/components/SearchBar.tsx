import React, { useState, useRef } from 'react';
import { Search, Sparkles, X, MapPin, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { smartSearch } from '../lib/gemini';
import { cn } from '../lib/utils';
import { speak } from '../lib/speech';

interface SearchBarProps {
  language: Language;
  onSearchResult: (lat: number, lng: number, name: string) => void;
}

export default function SearchBar({ language, onSearchResult }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const recognitionRef = useRef<any>(null);
  
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      alert(isRtl ? "متصفحك لا يدعم التعرف على الصوت" : "Speech recognition not supported in this browser");
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      speak(isRtl ? "أنا أسمعك" : "I'm listening", language);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsAiSearching(true);
    const result = await smartSearch(query, language);
    setAiResult(result);
    if (result && result.name) {
      speak(`${result.name}. ${result.description}`, language);
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lng);
      if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
        onSearchResult(lat, lng, result.name);
      }
    }
    setIsAiSearching(false);
  };

  return (
    <div 
      className="absolute top-20 left-4 right-4 z-40 max-w-xl mx-auto"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      <form 
        onSubmit={handleSearch}
        className="relative flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-xl shadow-slate-200 border border-slate-200 p-1.5 overflow-hidden ring-offset-2 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all font-sans"
      >
        <div className="flex-1 flex items-center px-4 gap-3">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isListening ? (isRtl ? "جاري الاستماع..." : "Listening...") : t.searchPlaceholder}
            className="w-full bg-transparent border-none focus:outline-none text-slate-800 py-2 text-sm font-medium placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              isListening 
                ? "bg-red-100 text-red-600 animate-pulse ring-4 ring-red-50" 
                : "text-slate-400 hover:bg-slate-100 hover:text-blue-600"
            )}
            title={isRtl ? "البحث بالصوت" : "Voice Search"}
          >
            {isListening ? <Mic size={18} /> : <Mic size={18} />}
          </button>

          <button
            type="submit"
            disabled={isAiSearching}
            className={cn(
              "flex items-center gap-2 px-4 md:px-6 py-2 rounded-full text-xs font-black transition-all uppercase tracking-wider shrink-0",
              isAiSearching 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95"
            )}
          >
            {isAiSearching ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Sparkles size={14} className="md:size-4" />
              </motion.div>
            ) : (
              <Sparkles size={14} className="md:size-4" />
            )}
            <span className="hidden xs:inline">{isRtl ? 'ذكاء' : 'AI'}</span>
          </button>
        </div>
      </form>
      
      {/* Quick Access POI Chips */}
      <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1 px-2">
        {[
          { id: 'fuel', icon: '⛽', labelAr: 'وقود', labelEn: 'Fuel', query: 'أقرب محطة وقود' },
          { id: 'food', icon: '🍽️', labelAr: 'مطاعم', labelEn: 'Food', query: 'مطاعم قريبة' },
          { id: 'hospital', icon: '🏥', labelAr: 'مستشفيات', labelEn: 'Hospitals', query: 'أقرب مستشفى' },
          { id: 'park', icon: '🌳', labelAr: 'منتزهات', labelEn: 'Parks', query: 'منتزهات عامة' },
        ].map(poi => (
          <motion.button
            key={poi.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setQuery(isRtl ? poi.labelAr : poi.labelEn);
              handleSearch(new Event('submit') as any);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-full shadow-sm hover:shadow-md transition-all whitespace-nowrap"
          >
            <span className="text-xs">{poi.icon}</span>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">
              {isRtl ? poi.labelAr : poi.labelEn}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {aiResult && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-4 bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <button 
              onClick={() => setAiResult(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 text-blue-600">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                System Insight
              </span>
            </div>
            
            <p className="text-slate-700 leading-relaxed text-sm font-medium">
              <span className="block text-slate-900 font-black mb-1">{aiResult.name}</span>
              {aiResult.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
