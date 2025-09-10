import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");

export default function HomePage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      <LinearGradient
        colors={["#1E40AF", "#3B82F6", "#60A5FA"]}
        style={styles.gradientContainer}
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>+</Text>
              </View>
            </View>
            <Text style={styles.title}>TeleMedicine</Text>
            <Text style={styles.subtitle}>
              Your Health, Our Priority
            </Text>
            <Text style={styles.description}>
              Connect with healthcare professionals from the comfort of your home
            </Text>
          </View>

          {/* Action Buttons Section */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.primaryButton, styles.shadowEffect]}
              onPress={() => router.push("/auth")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FFFFFF", "#F8FAFC"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Text style={styles.primaryButtonSubtext}>Login or Create Account</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, styles.shadowEffect]}
              onPress={() => router.push("/auth")}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Quick Access</Text>
              <Text style={styles.secondaryButtonSubtext}>For existing patients</Text>
            </TouchableOpacity>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>📱</Text>
              </View>
              <Text style={styles.featureText}>Video Consultations</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>⚡</Text>
              </View>
              <Text style={styles.featureText}>Instant Appointments</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>🔒</Text>
              </View>
              <Text style={styles.featureText}>Secure & Private</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1E40AF",
  },
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 60,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
    fontWeight: "500",
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  actionsSection: {
    paddingHorizontal: 8,
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E40AF",
    marginBottom: 4,
  },
  primaryButtonSubtext: {
    fontSize: 14,
    color: "#64748B",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  secondaryButtonSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  shadowEffect: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  featuresSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  featureIconText: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 16,
  },
});

// Alternative version without LinearGradient dependency
export function HomePageSimple() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      <View style={[styles.container, { backgroundColor: "#1E40AF" }]}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>+</Text>
            </View>
          </View>
          <Text style={styles.title}>TeleMedicine</Text>
          <Text style={styles.subtitle}>Your Health, Our Priority</Text>
          <Text style={styles.description}>
            Connect with healthcare professionals from the comfort of your home
          </Text>
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[simpleStyles.primaryButtonSimple, styles.shadowEffect]}
            onPress={() => router.push("/auth")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Text style={styles.primaryButtonSubtext}>Login or Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, styles.shadowEffect]}
            onPress={() => router.push("/auth")}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Quick Access</Text>
            <Text style={styles.secondaryButtonSubtext}>For existing patients</Text>
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>📱</Text>
            </View>
            <Text style={styles.featureText}>Video Consultations</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>⚡</Text>
            </View>
            <Text style={styles.featureText}>Instant Appointments</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>🔒</Text>
            </View>
            <Text style={styles.featureText}>Secure & Private</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Simple button style for alternative version
const simpleStyles = StyleSheet.create({
  primaryButtonSimple: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});