import { Stack } from "expo-router";
import FloatingBottomNav from "./components/FloatingBottomNav";
import { View, StyleSheet } from "react-native";
import React from "react";

export default function Layout() {
  return (
    <View style={styles.container}>
      {/* All your screens (no built-in nav bar) */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* Your custom bottom navbar */}
      <FloatingBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
