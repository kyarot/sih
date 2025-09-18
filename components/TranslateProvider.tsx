import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import pa from "../locales/pa.json";

type LanguageCode = "en" | "hi" | "pa";

type TranslateContextType = {
  lang: LanguageCode;
  t: (key: string) => string;
  translateDynamic: (text: string) => Promise<string>;
  setLang: (lang: LanguageCode) => void;
};

const TranslateContext = createContext<TranslateContextType | null>(null);

export const useTranslation = () => {
  const ctx = useContext(TranslateContext);
  if (!ctx) throw new Error("useTranslation must be used inside <TranslateProvider>");
  return ctx;
};

const translations: Record<LanguageCode, any> = { en, hi, pa };
const API_BASE = "http://localhost:5000";

export const TranslateProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<LanguageCode>("en");

  const t = (key: string) => translations[lang][key] || key;

  const translateDynamic = async (text: string) => {
    if (!text) return "";
    try {
      const res = await axios.post(`${API_BASE}/api/translate`, { text, target: lang });
      return res.data.translated || text;
    } catch {
      return text;
    }
  };

  return (
    <TranslateContext.Provider value={{ lang, t, translateDynamic, setLang }}>
      {children}
    </TranslateContext.Provider>
  );
};

export default TranslateProvider;
