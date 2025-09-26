// [id].tsx
import axios from "axios";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { JSX, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

import Navbar from "../components/Navbar";
import { FamilyProfile } from "../components/FamilyMembers";

const API_BASE = "http://localhost:5000";
const { height } = Dimensions.get("window");

export default function PatientHome(): JSX.Element {
  const { id } = useLocalSearchParams();
  const accountId = (id as string) || "";

  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfile[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyProfile | null>(null);

  const [sheetY] = useState(new Animated.Value(height * 0.7));
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10,
    onPanResponderMove: (_, g) => {
      const newY = Math.max(height * 0.3, height * 0.7 + g.dy);
      sheetY.setValue(newY);
    },
    onPanResponderRelease: (_, g) => {
      if (g.dy < -50) {
        Animated.spring(sheetY, { toValue: height * 0.3, useNativeDriver: false }).start();
      } else {
        Animated.spring(sheetY, { toValue: height * 0.7, useNativeDriver: false }).start();
      }
    },
  });

  useEffect(() => {
    if (!accountId) return;
    fetchFamilyProfiles();
  }, [accountId]);

  async function fetchFamilyProfiles() {
    try {
      const res = await axios.get(`${API_BASE}/api/patients/family/${accountId}`);
      const data = res.data || [];
      setFamilyProfiles(data);
      if (data.length > 0 && !selectedFamily) {
        setSelectedFamily(data[0]);
      }
    } catch (err) {
      console.error("fetchFamilyProfiles:", err);
      Toast.show({ type: "error", text1: "Failed to load family profiles" });
    }
  }

  const selectedFamilyId = useMemo(
    () => selectedFamily?._id || selectedFamily?.uid || null,
    [selectedFamily]
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      {/* Navbar */}
      <Navbar
        userName={selectedFamily?.name}
        familyProfiles={familyProfiles}
        selectedFamilyId={selectedFamilyId}
        onSelectFamily={(profile) => setSelectedFamily(profile)}
      />

      {/* Greeting */}
      <View style={styles.greetingBox}>
        <Text style={styles.greeting}>Hi, {selectedFamily?.name || "User"} 👋</Text>
        <Text style={styles.subText}>How can I help you today?</Text>
      </View>

      {/* Mic Button */}
      <View style={styles.micBox}>
        <TouchableOpacity style={styles.micButton}>
          <Ionicons name="mic" size={36} color="white" />
        </TouchableOpacity>
      </View>

      {/* Text Input */}
      <View style={styles.inputBox}>
        <TextInput
          style={styles.textInput}
          placeholder="Type your symptoms..."
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Sliding Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, { top: sheetY }]} {...panResponder.panHandlers}>
        <View style={styles.handle} />
        <ScrollView>
          <Text style={styles.sheetTitle}>Quick Access</Text>
          <View style={styles.iconGrid}>
            <TouchableOpacity style={styles.iconBox}>
              <Ionicons name="calendar" size={28} color="#1E40AF" />
              <Text style={styles.iconLabel}>Appointments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBox}>
              <Ionicons name="medkit" size={28} color="#1E40AF" />
              <Text style={styles.iconLabel}>Prescriptions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBox}>
              <Ionicons name="leaf" size={28} color="#1E40AF" />
              <Text style={styles.iconLabel}>Health Tips</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBox}>
              <Ionicons name="warning" size={28} color="#DC2626" />
              <Text style={styles.iconLabel}>Emergency</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBox}>
              <Ionicons name="settings" size={28} color="#1E40AF" />
              <Text style={styles.iconLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  greetingBox: { padding: 20, alignItems: "center" },
  greeting: { fontSize: 22, fontWeight: "700", color: "#1E40AF" },
  subText: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  micBox: { alignItems: "center", marginTop: 20 },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  inputBox: { paddingHorizontal: 20, marginTop: 16 },
  textInput: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 14,
    color: "#111827",
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: height,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    elevation: 10,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: "#D1D5DB",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  iconBox: {
    width: "30%",
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 18,
    alignItems: "center",
  },
  iconLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
});
