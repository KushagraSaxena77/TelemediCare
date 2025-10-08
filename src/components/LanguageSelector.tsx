import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { languages } from '../data/languages';
import { storage } from '../utils/localStorage';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className }) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    storage.setLanguage(languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  return (
    <div className={`relative ${className}`}>
      <select
        value={i18n.language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="appearance-none bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3 pr-10 text-sm font-semibold text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 shadow-2xl"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code} className="bg-gray-900 text-white">
            {language.nativeName}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400 pointer-events-none" />
    </div>
  );
};

export default LanguageSelector;