import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const translations: Record<LanguageCode, Record<string, string>> = { en, hi, pa };
const API_BASE = "http://localhost:5000";

export const TranslateProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<LanguageCode>("en");

  // Load saved language on startup
  useEffect(() => {
    const loadLang = async () => {
      const savedLang = await AsyncStorage.getItem("appLanguage");
      if (savedLang && ["en", "hi", "pa"].includes(savedLang)) {
        setLangState(savedLang as LanguageCode);
      }
    };
    loadLang();
  }, []);

  // Save new language to AsyncStorage
  const setLang = async (newLang: LanguageCode) => {
    setLangState(newLang);
    await AsyncStorage.setItem("appLanguage", newLang);
  };

  // Translation function (sync)
  const t = (key: string) => translations[lang][key] || key;

  // Dynamic translation via backend API (async)
  const translateDynamic = async (text: string) => {
    if (!text) return "";
    try {
      const res = await axios.post(`${API_BASE}/api/translate`, { text, target: lang });
      return res.data.translatedText || text;
    } catch (err) {
      console.error("translateDynamic error:", err);
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
