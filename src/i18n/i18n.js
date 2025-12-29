import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import uk from './locales/uk.json';

i18n.use(initReactI18next).init({
	resources: {
		en: { translation: en },
		uk: { translation: uk },
	},
	lng: localStorage.getItem('clipcraft-lang') || 'en',
	fallbackLng: 'en',
	interpolation: {
		escapeValue: false,
	},
});

i18n.on('languageChanged', (lng) => {
	localStorage.setItem('clipcraft-lang', lng);
});

export default i18n;
