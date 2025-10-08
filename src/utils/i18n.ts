import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../locales/en.json';
import hiTranslation from '../locales/hi.json';
import bnTranslation from '../locales/bn.json';
import teTranslation from '../locales/te.json';
import mrTranslation from '../locales/mr.json';
import taTranslation from '../locales/ta.json';
import urTranslation from '../locales/ur.json';
import guTranslation from '../locales/gu.json';
import knTranslation from '../locales/kn.json';
import orTranslation from '../locales/or.json';
import mlTranslation from '../locales/ml.json';
import paTranslation from '../locales/pa.json';
import asTranslation from '../locales/as.json';
import maiTranslation from '../locales/mai.json';
import satTranslation from '../locales/sat.json';
import ksTranslation from '../locales/ks.json';
import neTranslation from '../locales/ne.json';
import kokTranslation from '../locales/kok.json';
import sdTranslation from '../locales/sd.json';
import doiTranslation from '../locales/doi.json';
import mniTranslation from '../locales/mni.json';
import brxTranslation from '../locales/brx.json';

const resources = {
  en: { translation: enTranslation },
  hi: { translation: hiTranslation },
  bn: { translation: bnTranslation },
  te: { translation: teTranslation },
  mr: { translation: mrTranslation },
  ta: { translation: taTranslation },
  ur: { translation: urTranslation },
  gu: { translation: guTranslation },
  kn: { translation: knTranslation },
  or: { translation: orTranslation },
  ml: { translation: mlTranslation },
  pa: { translation: paTranslation },
  as: { translation: asTranslation },
  mai: { translation: maiTranslation },
  sat: { translation: satTranslation },
  ks: { translation: ksTranslation },
  ne: { translation: neTranslation },
  kok: { translation: kokTranslation },
  sd: { translation: sdTranslation },
  doi: { translation: doiTranslation },
  mni: { translation: mniTranslation },
  brx: { translation: brxTranslation },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('selectedLanguage') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;