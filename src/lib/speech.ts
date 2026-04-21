
export const speak = (text: string, lang: 'ar' | 'en' = 'ar') => {
  if (!('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Try to find a better Arabic voice if available
  const voices = window.speechSynthesis.getVoices();
  if (lang === 'ar') {
    const arVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arVoice) utterance.voice = arVoice;
  }

  window.speechSynthesis.speak(utterance);
};
