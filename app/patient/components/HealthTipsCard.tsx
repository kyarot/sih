import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function HealthTipsCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="bulb" size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.cardTitle}>Daily Health Tips</Text>
      </View>
      
      <View style={styles.tipsContainer}>
        <View style={styles.tipItem}>
          <View style={styles.tipIconContainer}>
            <Text style={styles.tipEmoji}>💧</Text>
          </View>
          <Text style={styles.tipText}>Drink 8 glasses of water daily</Text>
        </View>
        
        <View style={styles.tipItem}>
          <View style={styles.tipIconContainer}>
            <Text style={styles.tipEmoji}>🏃‍♂️</Text>
          </View>
          <Text style={styles.tipText}>Exercise for 30 minutes daily</Text>
        </View>
        
        <View style={styles.tipItem}>
          <View style={styles.tipIconContainer}>
            <Text style={styles.tipEmoji}>🍎</Text>
          </View>
          <Text style={styles.tipText}>Eat more fruits and vegetables</Text>
        </View>
        
        <View style={styles.tipItem}>
          <View style={styles.tipIconContainer}>
            <Text style={styles.tipEmoji}>😴</Text>
          </View>
          <Text style={styles.tipText}>Get 7-8 hours of sleep</Text>
        </View>
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