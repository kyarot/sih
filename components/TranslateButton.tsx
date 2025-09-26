import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "./TranslateProvider";

const LANGUAGE_LABELS = { en: "English", hi: "हिंदी", pa: "ਪੰਜਾਬੀ" };

export default function TranslateButton() {
  const { lang, setLang } = useTranslation();

  return (
    <View style={styles.wrapper}>
      {(["en", "hi", "pa"] as const).map((code) => (
        <TouchableOpacity
          key={code}
          style={[styles.btn, lang === code && styles.activeBtn]}
          onPress={() => setLang(code)}
        >
          <Text style={[styles.text, lang === code && styles.activeText]}>
            {LANGUAGE_LABELS[code]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: "row", gap: 10 },
  btn: { padding: 8, borderRadius: 6, backgroundColor: "transparent" },
  activeBtn: { backgroundColor: "white" },
  text: { color: "#fff", fontWeight: "500" },
  activeText: { color: "#1E40AF", fontWeight: "700" },
});
