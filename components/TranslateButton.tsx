import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";

type LanguageCode = "en" | "hi" | "pa";

type TranslateButtonProps = {
  style?: ViewStyle;
  initialLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
};

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: "English",
  hi: "हिंदी",
  pa: "ਪੰਜਾਬੀ",
};

export default function TranslateButton({
  style,
  initialLanguage = "en",
  onLanguageChange,
}: TranslateButtonProps) {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>(initialLanguage);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setOpen(false);
    onLanguageChange && onLanguageChange(code);
  };

  return (
    <View style={[styles.wrapper, style]}> 
      <TouchableOpacity
        onPress={() => setOpen(prev => !prev)}
        activeOpacity={0.8}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{LANGUAGE_LABELS[language]}</Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleSelect("en")}>
            <Text style={styles.menuItemText}>English</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={() => handleSelect("hi")}>
            <Text style={styles.menuItemText}>हिंदी</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={() => handleSelect("pa")}>
            <Text style={styles.menuItemText}>ਪੰਜਾਬੀ</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  chevron: {
    color: "#FFFFFF",
    marginLeft: 6,
    opacity: 0.9,
  },
  menu: {
    position: "absolute",
    top: 44,
    right: 0,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
    minWidth: 140,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuItemText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});


