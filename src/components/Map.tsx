import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { INITIAL_CENTER } from '../constants';
import { Location } from '../types';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet + React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  checkpoints: Location[];
  onMapClick: (lat: number, lng: number) => void;
  center?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number } | null;
  destination?: { lat: number; lng: number; name: string } | null;
}

const isValidLatLng = (val: any): val is { lat: number; lng: number } => {
  return (
    val &&
    typeof val.lat === 'number' &&
    typeof val.lng === 'number' &&
    isFinite(val.lat) &&
    isFinite(val.lng)
  );
};

function ChangeView({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (!isValidLatLng(center)) return;
    
    map.flyTo([center.lat, center.lng], 15, {
      duration: 1.5,
      easeLinearity: 0.25
    });
  }, [center, map]);
  return null;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (e.latlng && isFinite(e.latlng.lat) && isFinite(e.latlng.lng)) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

const checkpointIcon = L.divIcon({
  className: 'checkpoint-marker-container',
  html: `<div class="relative group">
          <div class="absolute -inset-4 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/30 transition-all marker-pulse"></div>
          <div class="relative w-10 h-10 flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(239,68,68,0.4)]">
            <svg viewBox="0 0 40 40" class="w-10 h-10">
              <path d="M20 2 L4 8 C4 18 10 28 20 34 C30 28 36 18 36 8 L20 2 Z" fill="#0f172a" stroke="#ef4444" stroke-width="2.5" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-red-500 animate-pulse"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>
        </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const centerIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const userMarkerIcon = L.divIcon({
  className: 'user-marker-icon',
  html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-blue-400 rounded-full animate-ping opacity-25"></div>
          <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
        </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const destinationIcon = L.divIcon({
  className: 'destination-marker-icon',
  html: `<div class="relative flex items-center justify-center">
          <div class="absolute -inset-2 bg-green-500/20 rounded-full blur-md animate-pulse"></div>
          <div class="w-8 h-8 bg-black rounded-lg border-2 border-green-500 flex items-center justify-center shadow-lg transform rotate-45">
            <div class="transform -rotate-45">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-green-500"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function Map({ checkpoints, onMapClick, center, userLocation, destination }: MapProps) {
  return (
    <MapContainer 
      center={[INITIAL_CENTER.lat, INITIAL_CENTER.lng]} 
      zoom={13} 
      className="w-full h-full"
      zoomControl={false}
    >
      <MapClickHandler onClick={onMapClick} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        className="map-tiles-filter"
      />
      {isValidLatLng(center) && (
        <>
          <ChangeView center={center} />
          <Marker position={[center.lat, center.lng]} icon={centerIcon} />
        </>
      )}

      {isValidLatLng(userLocation) && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userMarkerIcon} zIndexOffset={1000} />
      )}

      {isValidLatLng(destination) && (
        <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} zIndexOffset={1100}>
          <Popup className="geometric-popup">
            <div className="p-2 min-w-[120px]">
              <span className="text-[8px] font-black text-green-500 uppercase tracking-widest block mb-1">Target Path</span>
              <h3 className="font-black text-slate-900 text-[11px] uppercase truncate">{destination.name}</h3>
              <p className="text-[9px] text-slate-400 font-mono mt-1">COORD: {destination.lat.toFixed(3)}, {destination.lng.toFixed(3)}</p>
            </div>
          </Popup>
        </Marker>
      )}
      
      {checkpoints.filter(cp => isValidLatLng(cp)).map((cp, idx) => (
        <Marker 
          key={idx} 
          position={[cp.lat, cp.lng]} 
          icon={checkpointIcon}
        >
          <Popup className="geometric-popup" closeButton={true} autoClose={false}>
            <div className="p-1 min-w-[180px]">
              <div className="flex flex-col border-b border-slate-100 mb-3 pb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Signal Detected</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Live Alert</span>
                  </div>
                </div>
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-tight">
                  {cp.name}
                </h3>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-800 leading-snug">
                  {cp.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button 
                  className="bg-slate-900 text-white text-[9px] font-black py-2 rounded-lg uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                  onClick={() => alert('Validation recorded.')}
                >
                  <div className="w-1 h-1 rounded-full bg-green-400" />
                  Active
                </button>
                <button 
                  className="bg-white text-slate-400 text-[9px] font-black py-2 rounded-lg uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 border border-slate-200"
                  onClick={() => alert('Resolution reported.')}
                >
                  Cleared
                </button>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-100">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Reporter:</span>
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">{cp.reporter || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[8px] font-bold text-slate-300">{new Date(cp.timestamp || Date.now()).toLocaleDateString()}</span>
                    <span className="text-[8px] font-bold text-slate-300">{new Date(cp.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
