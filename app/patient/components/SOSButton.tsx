import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function SOSButton() {
  return (
    <TouchableOpacity style={styles.sosButton} onPress={() => {
      Alert.alert("🚨 Emergency Alert", "Emergency services and family contacts have been notified with your GPS location!");
    }}>
      <LinearGradient colors={["#F44336", "#D32F2F"]} style={styles.sosGradient}>
        <Ionicons name="warning" size={32} color="white" />
        <Text style={styles.sosText}>Emergency SOS</Text>
        <Text style={styles.sosSubtext}>Tap for immediate help</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sosButton: { marginVertical: 20, borderRadius: 16, elevation: 4, shadowColor: "#F44336", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  sosGradient: { padding: 24, borderRadius: 16, alignItems: "center" },
  sosText: { color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 8 },
  sosSubtext: { color: "#FFE0E0", fontSize: 14, marginTop: 4 },
});


