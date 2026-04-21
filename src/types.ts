export type Language = 'ar' | 'en';

export interface Location {
  lat: number;
  lng: number;
  name: string;
  type: 'checkpoint' | 'landmark' | 'other';
  description?: string;
  reporter?: string;
  timestamp?: number;
}

export interface Translations {
  title: string;
  searchPlaceholder: string;
  reportCheckpoint: string;
  languageToggle: string;
  reportSuccess: string;
  reportError: string;
  smartSearchDesc: string;
  back: string;
  confirmTitle: string;
  confirmReport: string;
  cancel: string;
  locateMe: string;
}
