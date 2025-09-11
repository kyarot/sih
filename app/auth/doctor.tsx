import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";


export default function DoctorAuth() {
   const router = useRouter();
  const [code, setCode] = useState("");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

   const handleRequestOtp = () => {
    // For demo, just navigate to profile page
    router.replace("/doctor");
  };

  const handleLogin = () => {
    // Verify OTP and log the doctor in
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#1E40AF", "#3B82F6", "#60A5FA"]}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Doctor Login</Text>
          <Text style={styles.subtitle}>
            Enter your unique code and verify via Email / Phone
          </Text>

          {/* Doctor Code */}
          <TextInput
            style={styles.input}
            placeholder="Unique Doctor Code"
            placeholderTextColor="#A5B4FC"
            value={code}
            onChangeText={setCode}
          />

          {/* Email / Phone */}
          <TextInput
            style={styles.input}
            placeholder="Email or Phone Number"
            placeholderTextColor="#A5B4FC"
            value={contact}
            onChangeText={setContact}
            keyboardType="email-address"
          />

          {/* OTP Request */}
          {!otpSent ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRequestOtp}
            >
              <Text style={styles.primaryButtonText}>Request OTP</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                placeholderTextColor="#A5B4FC"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
              >
                <Text style={styles.primaryButtonText}>Login</Text>
              </TouchableOpacity>
            </>
          )}
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
