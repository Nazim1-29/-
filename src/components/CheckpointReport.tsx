import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Send, X } from 'lucide-react';
import React, { useState } from 'react';
import { Language, Location } from '../types';
import { TRANSLATIONS } from '../constants';
import { cn } from '../lib/utils';
import { speak } from '../lib/speech';

interface CheckpointReportProps {
  language: Language;
  onReport: (location: Location) => void;
}

export default function CheckpointReport({ language, onReport }: CheckpointReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [description, setDescription] = useState('');
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    // Mock user location for demo purposes (Baghdad area)
    const mockLoc: Location = {
      lat: 33.3152 + (Math.random() - 0.5) * 0.05,
      lng: 44.3661 + (Math.random() - 0.5) * 0.05,
      name: isRtl ? "سيطرة جديدة" : "New Checkpoint",
      type: 'checkpoint',
      description: description || (isRtl ? "سيطرة امنية" : "Security Checkpoint"),
      reporter: "System User",
      timestamp: Date.now()
    };

    onReport(mockLoc);
    speak(language === 'ar' ? 'تم استلام التبليغ بنجاح. شكراً لمساعدتك.' : 'Report received successfully. Thank you for your help.', language);
    setDescription('');
    setIsOpen(false);
    setIsConfirmOpen(false);
  };

  return (
    <div 
      className={cn(
        "fixed bottom-14 md:bottom-12 z-50 flex flex-col items-end gap-4",
        isRtl ? "left-4 md:left-8" : "right-4 md:right-8"
      )}
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-[280px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex flex-col">
                <h3 className="font-bold text-slate-900 text-sm leading-tight">
                  {t.reportCheckpoint}
                </h3>
                <span className="text-[10px] text-red-600 font-black uppercase tracking-tighter">
                  Active Intelligence
                </span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isRtl ? "أضف تفاصيل الموقع..." : "Location details..."}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-medium focus:ring-2 focus:ring-red-500/10 transition-all resize-none h-28 focus:outline-none placeholder:text-slate-400"
              />
              
              <button
                type="submit"
                className="w-full bg-red-600 text-white rounded-xl py-3.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                <Send size={14} />
                <span>{isRtl ? "إرسال" : "Submit"}</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 border border-slate-100"
            >
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6">
                <AlertTriangle size={24} />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
                {t.confirmTitle}
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                {t.confirmReport}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  className="bg-slate-100 text-slate-600 rounded-xl py-4 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleConfirmAction}
                  className="bg-blue-600 text-white rounded-xl py-4 text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  {isRtl ? "تأكيد" : "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        layout
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-4 bg-red-600 hover:bg-red-700 text-white px-7 py-4 rounded-full shadow-2xl shadow-red-500/40 transition-all group",
          isOpen && "bg-slate-900 hover:bg-slate-800 shadow-slate-900/40"
        )}
      >
        <div className="flex flex-col items-start leading-none">
          <span className="text-sm font-bold tracking-tight">
            {isOpen ? (isRtl ? 'إلغاء' : 'Cancel') : t.reportCheckpoint}
          </span>
          {!isOpen && (
            <span className="text-[10px] opacity-70 font-black uppercase tracking-tighter mt-1">
              {isRtl ? 'تبليغ فوري' : 'Report now'}
            </span>
          )}
        </div>
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
          <AlertTriangle size={20} />
        </div>
      </motion.button>
    </div>
  );
}
