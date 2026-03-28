import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN', dir: 'ltr' as const },
  { code: 'ar', label: 'AR', dir: 'rtl' as const },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('ar') ? 'ar' : 'en';

  useEffect(() => {
    const lang = LANGUAGES.find((l) => l.code === currentLang);
    if (lang) {
      document.documentElement.dir = lang.dir;
      document.documentElement.lang = lang.code;
    }
  }, [currentLang]);

  const toggleLanguage = () => {
    const next = currentLang === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggleLanguage}
      title={currentLang === 'en' ? 'Switch to Arabic' : 'التحويل إلى الإنجليزية'}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
    >
      <span className={`text-xs font-bold transition-colors ${currentLang === 'en' ? 'text-white' : 'text-white/40'}`}>EN</span>
      <span className="text-white/30 text-xs">|</span>
      <span className={`text-xs font-bold transition-colors ${currentLang === 'ar' ? 'text-white' : 'text-white/40'}`}>AR</span>
    </button>
  );
};

export default LanguageSwitcher;
