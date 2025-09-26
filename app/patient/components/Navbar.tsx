// components/Navbar.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PatientLocation from "./loc";
import FamilyMembers, { FamilyProfile } from "./FamilyMembers";

const { width } = Dimensions.get("window");

type Props = {
  userName?: string;
  familyProfiles: FamilyProfile[];
  selectedFamilyId: string | null;
  onSelectFamily: (profile: FamilyProfile) => void;
};

export default function Navbar({ userName, familyProfiles, selectedFamilyId, onSelectFamily }: Props) {
  const [sidebarAnim] = useState(new Animated.Value(-width * 0.7));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    if (sidebarOpen) {
      Animated.timing(sidebarAnim, { toValue: -width * 0.7, duration: 300, useNativeDriver: false }).start(() => {
        setSidebarOpen(false);
      });
    } else {
      setSidebarOpen(true);
      Animated.timing(sidebarAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
    }
  };

  return (
    <View>
      {/* Navbar row */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>AIHR</Text>
        <PatientLocation uid={undefined} />
        <TouchableOpacity onPress={toggleSidebar} style={styles.profileBtn}>
          <Ionicons name="person-circle" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { left: sidebarAnim }]}>
        <Text style={styles.sidebarTitle}>Profile</Text>
        <FamilyMembers
          familyProfiles={familyProfiles}
          selectedFamilyId={selectedFamilyId}
          onSelect={onSelectFamily}
          onAddPress={() => {}}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E40AF",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  profileBtn: {
    padding: 4,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: width * 0.7,
    backgroundColor: "white",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
});
