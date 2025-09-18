import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "./TranslateProvider";

const LANGUAGE_LABELS = { en: "English", hi: "हिंदी", pa: "ਪੰਜਾਬੀ" };

export default function TranslateButton() {
  const { lang, setLang } = useTranslation();

  return (
    <View style={styles.wrapper}>
      {(["en","hi","pa"] as const).map(code => (
        <TouchableOpacity key={code} onPress={() => setLang(code)}>
          <Text style={styles.text}>{LANGUAGE_LABELS[code]}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: "row", gap: 10 },
  text: { color: "#fff" },
});
