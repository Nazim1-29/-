import { Translations } from './types';

export const TRANSLATIONS: Record<'ar' | 'en', Translations> = {
  ar: {
    title: "دليلي - العراق",
    searchPlaceholder: "إلى أين نذهب اليوم؟",
    reportCheckpoint: "تبليغ عن سيطرة",
    languageToggle: "English",
    reportSuccess: "تم التبليغ بنجاح!",
    reportError: "حدث خطأ أثناء التبليغ.",
    smartSearchDesc: "ابحث باستخدام الذكاء الاصطناعي...",
    back: "رجوع",
    confirmTitle: "تأكيد التبليغ",
    confirmReport: "هل أنت متأكد من رغبتك في إرسال هذا التبليغ؟",
    cancel: "إلغاء",
    locateMe: "تحديد موقعي"
  },
  en: {
    title: "Dalili - Iraq",
    searchPlaceholder: "Where to go today?",
    reportCheckpoint: "Report Checkpoint",
    languageToggle: "عربي",
    reportSuccess: "Reported successfully!",
    reportError: "Error while reporting.",
    smartSearchDesc: "Search with AI...",
    back: "Back",
    confirmTitle: "Confirm Report",
    confirmReport: "Are you sure you want to submit this checkpoint report?",
    cancel: "Cancel",
    locateMe: "Locate Me"
  }
};

export const INITIAL_CENTER = {
  lat: 33.3152,
  lng: 44.3661
};
