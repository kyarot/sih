import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "../../../components/TranslateProvider"; 

export default function HealthTipsCard() {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="bulb" size={20} color="#FFFFFF" />
        <Text style={styles.cardTitle}>{t("daily_health_tips")}</Text>
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipText}>💧 {t("drink_water")}</Text>
        <Text style={styles.tipText}>🏃‍♂️ {t("exercise_daily")}</Text>
        <Text style={styles.tipText}>🍎 {t("eat_fruits")}</Text>
        <Text style={styles.tipText}>😴 {t("sleep_hours")}</Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    elevation: 8,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    paddingBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#1E40AF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E40AF",
    letterSpacing: 0.3,
  },
  tipsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tipEmoji: {
    fontSize: 16,
  },
  tipText: {
    fontSize: 15,
    color: "#1E40AF",
    fontWeight: "600",
    lineHeight: 22,
    flex: 1,
    letterSpacing: 0.2,
  },
});