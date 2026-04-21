import { useState, useEffect } from 'react';
import Header from './components/Header';
import Map from './components/Map';
import SearchBar from './components/SearchBar';
import CheckpointReport from './components/CheckpointReport';
import { Language, Location } from './types';
import { INITIAL_CENTER, TRANSLATIONS } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X } from 'lucide-react';
import { cn } from './lib/utils';
import { speak } from './lib/speech';

import { Crosshair } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const [checkpoints, setCheckpoints] = useState<Location[]>([]);
  const [mapCenter, setMapCenter] = useState(INITIAL_CENTER);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [destination, setDestination] = useState<{lat: number, lng: number, name: string} | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isFirstLocationAcquired, setIsFirstLocationAcquired] = useState(false);

  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const calculateDistance = (l1: {lat: number, lng: number}, l2: {lat: number, lng: number}) => {
    const R = 6371; // km
    const dLat = (l2.lat - l1.lat) * Math.PI / 180;
    const dLng = (l2.lng - l1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(l1.lat * Math.PI / 180) * Math.cos(l2.lat * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  // User location tracking
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) return;

          const newLoc = { lat, lng };
          setUserLocation(newLoc);
          
          // Auto-center only once when location is first found
          if (!isFirstLocationAcquired) {
            setMapCenter(newLoc);
            setIsFirstLocationAcquired(true);
          }
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isFirstLocationAcquired]);

  const handleLocateMe = () => {
    if (userLocation && isFinite(userLocation.lat) && isFinite(userLocation.lng)) {
      setMapCenter({ ...userLocation });
    }
  };

  // Initial mock checkpoints
  useEffect(() => {
    setCheckpoints([
      {
        lat: 33.32,
        lng: 44.38,
        name: "سيطرة الصقور",
        type: 'checkpoint',
        description: "إجراءات تفتيش روتينية",
        reporter: "A. Husseini",
        timestamp: Date.now() - 1000 * 60 * 30
      },
      {
        lat: 33.31,
        lng: 44.35,
        name: "سيطرة المنصور",
        type: 'checkpoint',
        description: "زحام شديد",
        reporter: "Z. Khalid",
        timestamp: Date.now() - 1000 * 60 * 15
      }
    ]);

    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    // Welcome voice
    setTimeout(() => {
      speak(language === 'ar' ? 'أهلاً بك في دليلي. نظام الملاحة الذكي مفعّل.' : 'Welcome to Dalili. Navigational intelligence activated.', language);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleReport = (newLoc: Location) => {
    if (!newLoc || typeof newLoc.lat !== 'number' || typeof newLoc.lng !== 'number' || !isFinite(newLoc.lat) || !isFinite(newLoc.lng)) {
      console.error("Invalid report location detected and blocked:", newLoc);
      return;
    }
    setCheckpoints(prev => [newLoc, ...prev]);
    setMapCenter({ lat: newLoc.lat, lng: newLoc.lng });
  };

  return (
    <div className="relative w-screen h-screen bg-slate-100 overflow-hidden select-none font-sans">
      {/* Background Map */}
      <div className="absolute inset-0">
        <Map 
          checkpoints={checkpoints} 
          onMapClick={(lat, lng) => {
            setDestination({ lat, lng, name: language === 'ar' ? 'البوابة المختارة' : 'Selected Point' });
            speak(language === 'ar' ? 'تم تحديد الوجهة.' : 'Destination set.', language);
          }}
          center={mapCenter}
          userLocation={userLocation}
          destination={destination}
        />
      </div>

      {/* Layered UI Components */}
      <Header 
        language={language} 
        onLanguageToggle={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')} 
      />
      
      <SearchBar 
        language={language} 
        onSearchResult={(lat, lng, name) => {
          if (isFinite(lat) && isFinite(lng)) {
            setMapCenter({ lat, lng });
            setDestination({ lat, lng, name });
            speak(language === 'ar' ? `تم تحديد الوجهة إلى ${name}` : `Destination set to ${name}`, language);
          }
        }}
      />

      {/* Side Overlays (Geometric Theme) - Hidden on Mobile */}
      <div 
        className={cn(
          "absolute top-24 bottom-12 w-64 hidden md:flex flex-col gap-4 pointer-events-none z-30 transition-all",
          language === 'ar' ? "right-8" : "left-8"
        )}
        style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
      >
        {/* Family Heritage Card */}
        <motion.div 
          initial={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl pointer-events-auto border border-slate-100 overflow-hidden"
        >
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden group">
            <img 
              src="https://picsum.photos/seed/family-heritage/400/600" 
              alt="Family" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-right">
              <p className="text-[10px] font-black text-white uppercase tracking-widest">{language === 'ar' ? 'أصدقاء دليلي' : 'Dalili Friends'}</p>
              <p className="text-[8px] text-white/70 font-bold uppercase">{language === 'ar' ? 'رحلة آمنة' : 'Safe Journey'}</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Locations Card */}
        <motion.div 
          initial={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl pointer-events-auto border border-slate-100"
        >
          <h3 className="text-slate-900 font-black text-xs mb-4 flex items-center justify-between uppercase tracking-tighter">
            <span>{language === 'ar' ? 'المواقع القريبة' : 'Nearby Sites'}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          </h3>
          <div className="space-y-3">
            {[
              { id: 1, name: language === 'ar' ? 'مول المنصور' : 'Mansour Mall', dist: '1.2 km', color: 'bg-blue-50 text-blue-600' },
              { id: 2, name: language === 'ar' ? 'ساحة التحرير' : 'Tahrir Square', dist: '0.8 km', color: 'bg-slate-50 text-slate-600' },
            ].map(site => (
              <div key={site.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px]", site.color)}>
                  {site.name[0]}
                </div>
                <div className="leading-snug">
                  <p className="text-[12px] font-bold text-slate-900">{site.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{site.dist}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Status Card */}
        <motion.div 
          initial={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl pointer-events-auto border border-slate-100"
        >
          <div className="flex items-center justify-between mb-3">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{language === 'ar' ? 'حالة النظام' : 'System Status'}</span>
             <div className="px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black rounded-full uppercase italic">Stable</div>
          </div>
          <div className="flex items-end justify-between">
            <div className="leading-none">
              <p className="text-xl font-black text-slate-900 tracking-tighter">24°C</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Baghdad / {language === 'ar' ? 'مشمس' : 'Sunny'}</p>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-500 border border-slate-100">
               <Info size={16} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Destination Info Overlay */}
      <AnimatePresence>
        {destination && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed bottom-40 left-4 right-4 md:left-auto md:right-8 md:w-80 z-40",
              "bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 p-5",
              isRtl ? "md:left-8 md:right-auto" : "md:right-8 md:left-auto"
            )}
            style={{ direction: isRtl ? 'rtl' : 'ltr' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Active Navigation</span>
                <h3 className="text-sm font-black text-slate-900 uppercase truncate max-w-[180px]">
                  {destination.name}
                </h3>
              </div>
              <button 
                onClick={() => setDestination(null)}
                className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex-1">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mb-1">Estimated Distance</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">
                    {userLocation ? calculateDistance(userLocation, destination) : '---'}
                  </span>
                  <span className="text-xs font-bold text-slate-500">KM</span>
                </div>
              </div>
              <div className="w-[1px] h-10 bg-slate-100" />
              <div className="flex-1">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mb-1">Status</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-900 uppercase">Calculating</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => speak(isRtl ? `وجهتك إلى ${destination.name} تبعد حوالي ${userLocation ? calculateDistance(userLocation, destination) : ''} كيلو متر` : `Your destination is ${destination.name}, approximately ${userLocation ? calculateDistance(userLocation, destination) : ''} kilometers away`, language)}
              className="w-full mt-5 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-900/10"
            >
              {isRtl ? 'بدأ الإرشاد الصوتي' : 'Start Voice Guidance'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={cn(
          "fixed bottom-32 md:bottom-32 z-40 flex flex-col items-end gap-3",
          isRtl ? "left-4 md:left-8" : "right-4 md:right-8"
        )}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLocateMe}
          className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-blue-600 border border-slate-100 hover:bg-slate-50 transition-colors"
          title={t.locateMe}
        >
          <Crosshair size={24} className={cn(isFirstLocationAcquired ? "animate-pulse" : "opacity-40")} />
        </motion.button>
      </div>

      <CheckpointReport 
        language={language} 
        onReport={handleReport}
      />

      {/* Dynamic Overlay Elements */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-md text-white px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border-2 border-blue-500/30 shrink-0">
               <img 
                 src="https://picsum.photos/seed/family-heritage/100/100" 
                 alt="Welcome" 
                 className="w-full h-full object-cover"
                 referrerPolicy="no-referrer"
               />
            </div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest line-clamp-1">
              {language === 'ar' 
                ? "دليلي - الذكاء الملاحي مفعل" 
                : "Dalili - Navigational Intelligence Active"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Coordinate Bar (Geometric Theme) */}
      <div className="absolute bottom-0 left-0 right-0 h-10 md:h-8 bg-slate-900 flex items-center px-4 md:px-8 justify-between text-[8px] md:text-[10px] text-slate-500 font-mono z-50 overflow-hidden">
        <div className="flex gap-4 md:gap-6">
          <span className="flex items-center gap-1"><span className="text-slate-700">LAT:</span> 33.315°</span>
          <span className="flex items-center gap-1"><span className="text-slate-700">LON:</span> 44.366°</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
            <span className="uppercase tracking-tighter font-bold hidden sm:inline">GPS Connected</span>
          </div>
          <div className="w-[1px] h-3 bg-slate-800 hidden sm:block" />
          <span className="uppercase tracking-tighter opacity-70">v2.4.0</span>
        </div>
      </div>
    </div>
  );
}

