import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, Stack } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "../../components/TranslateProvider";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DoctorAuth() {
  const router = useRouter();
  const [uniqueKey, setUniqueKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!uniqueKey) {
      Alert.alert("Error", "Please enter your unique doctor key");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("https://7300c4c894de.ngrok-free.app/api/doctors/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueKey }),
      });

      const data = await res.json();
      if (data.success) {
        // Save doctor data locally
        await AsyncStorage.setItem("doctorId", data.doctor._id);
        await AsyncStorage.setItem("doctorName", data.doctor.name);
        await AsyncStorage.setItem("specialization", data.doctor.specialization);

        Alert.alert("Success", "Login successful");
        router.replace("/doctor");
      } else {
        Alert.alert("Error", data.message || "Invalid key");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={["#1E40AF", "#3B82F6", "#60A5FA"]}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Doctor Login</Text>
          <Text style={styles.subtitle}>
            Enter your unique doctor key to login
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Unique Doctor Key"
            placeholderTextColor="#A5B4FC"
            value={uniqueKey}
            onChangeText={setUniqueKey}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#FFF",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  primaryButton: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E40AF",
  },
});
