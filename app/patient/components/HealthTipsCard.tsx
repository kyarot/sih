import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "../../../components/TranslateProvider"; 

export default function HealthTipsCard() {
  const { t } = useTranslation();

  const healthTips = [
    {
      icon: "water" as keyof typeof Ionicons.glyphMap,
      text: t("hydration_text"),
      category: t("hydration")
    },
    {
      icon: "fitness" as keyof typeof Ionicons.glyphMap,
      text: t("exercise_text"),
      category: t("exercise")
    },
    {
      icon: "nutrition" as keyof typeof Ionicons.glyphMap, // 👈 change this to a valid Ionicon if missing
      text: t("nutrition_text"),
      category: t("nutrition")
    },
    {
      icon: "moon" as keyof typeof Ionicons.glyphMap,
      text: t("rest_text"),
      category: t("rest")
    },
    {
      icon: "heart" as keyof typeof Ionicons.glyphMap,
      text: t("mental_health_text"),
      category: t("mental_health")
    },
    {
      icon: "medical" as keyof typeof Ionicons.glyphMap,
      text: t("prevention_text"),
      category: t("prevention")
    }
  ];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="bulb" size={18} color="#FFFFFF" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.cardTitle}>{t("wellness_tips")}</Text>
          <Text style={styles.cardSubtitle}>{t("guidance")}</Text>
        </View>
      </View>

      <View style={styles.tipsContainer}>
        {healthTips.slice(0, 4).map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <View style={styles.tipIconContainer}>
              <Ionicons 
                name={tip.icon} 
                size={16} 
                color="#1E40AF" 
              />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipCategory}>{tip.category}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerText}>{t("consult")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    backgroundColor: "#1E40AF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E40AF",
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    letterSpacing: 0.1,
  },
  tipsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tipIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipCategory: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E40AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  footerDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 12,
  },
  footerText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
    fontStyle: "italic",
    letterSpacing: 0.2,
  },
});
