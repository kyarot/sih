import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter, Stack } from "expo-router";
import { auth } from "@/firebase/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// Explicit union type
type Mode = "register" | "login";

export default function PharmacyPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("register");

  // Registration fields
  const [ownerName, setOwnerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [certificate, setCertificate] = useState("");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ---------------- Register ----------------
  const handleRegister = async () => {
    if (!ownerName || !shopName || !email || !password) {
      return Alert.alert("Error", "Please fill all required fields");
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();

      const res = await fetch(
        "https://7300c4c894de.ngrok-free.app/api/pharmacies/register-pharmacy",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            name: shopName,
            email,
            licenseNumber: certificate || `LIC-${Date.now()}`,
          }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Backend error");

      const storeId = data.pharmacy._id;
      await Clipboard.setStringAsync(storeId);
      Alert.alert("Success 🎉", `Your Store ID: ${storeId} (copied)`);

      setOwnerName("");
      setShopName("");
      setEmail("");
      setPassword("");
      setCertificate("");

      setMode("login");
    } catch (err: any) {
      Alert.alert("Registration Error", err.message);
    }
  };

  // ---------------- Login ----------------
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      return Alert.alert("Error", "Enter login credentials");
    }
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      const idToken = await cred.user.getIdToken();
      const uid = cred.user.uid;

      const res = await fetch(
        `https://7300c4c894de.ngrok-free.app/api/pharmacies/owner/${uid}`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Pharmacy not found");

      await AsyncStorage.setItem("pharmacyId", data.pharmacy._id);
      Alert.alert("Login Success ✅", `Welcome ${data.pharmacy.name}`);
      router.push({
        pathname: "/pharmacy/home",
        params: { pharmacyId: data.pharmacy._id },
      } as any);
    } catch (err: any) {
      Alert.alert("Login Error", err.message);
    }
  };

  // ---------------- UI ----------------
  const TabBar = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, mode === "register" && styles.activeTab]}
        onPress={() => setMode("register")}
      >
        <Text
          style={[styles.tabText, mode === "register" && styles.activeTabText]}
        >
          Register
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, mode === "login" && styles.activeTab]}
        onPress={() => setMode("login")}
      >
        <Text style={[styles.tabText, mode === "login" && styles.activeTabText]}>
          Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={["#1E3A8A", "#3B82F6", "#60A5FA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {mode === "register" ? (
          <>
            <Header
              title="PharmacyConnect"
              subtitle="Join our healthcare network and reach more patients"
              tagline="Register Your Pharmacy"
            />
            <TabBar />
            <FormCard>
              <Input
                label="Owner Name"
                value={ownerName}
                onChange={setOwnerName}
                placeholder="Full name"
                icon="person"
              />
              <Input
                label="Shop Name"
                value={shopName}
                onChange={setShopName}
                placeholder="Pharmacy name"
                icon="store"
              />
              <Input
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                icon="email"
              />
              <Input
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Password"
                secure
                icon="lock"
              />
              <Input
                label="License"
                value={certificate}
                onChange={setCertificate}
                placeholder="License (optional)"
                icon="verified"
              />
              <PrimaryButton text="Create Account" onPress={handleRegister} />
              <SwitchButton
                text="Already have an account? Sign In"
                onPress={() => setMode("login")}
              />
            </FormCard>
          </>
        ) : (
          <>
            <Header
              title="Welcome Back"
              subtitle="Sign in to your pharmacy account"
              tagline="Pharmacy Portal"
            />
            <TabBar />
            <FormCard>
              <Input
                label="Email"
                value={loginEmail}
                onChange={setLoginEmail}
                placeholder="Your email"
                icon="email"
                keyboardType="email-address"
              />
              <Input
                label="Password"
                value={loginPassword}
                onChange={setLoginPassword}
                placeholder="Password"
                secure
                icon="lock"
              />
              <PrimaryButton text="Sign In" onPress={handleLogin} />
              <SwitchButton
                text="New pharmacy? Create Account"
                onPress={() => setMode("register")}
              />
            </FormCard>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

// ---------------- Components ----------------
const Header = ({
  title,
  subtitle,
  tagline,
}: {
  title: string;
  subtitle: string;
  tagline: string;
}) => (
  <View style={styles.headerContainer}>
    <View style={styles.logoCircle}>
      <MaterialIcons name="local-pharmacy" size={32} color="rgba(255,255,255,0.9)" />
    </View>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={styles.dividerContainer}>
      <View style={styles.divider} />
      <Text style={styles.tagline}>{tagline}</Text>
      <View style={styles.divider} />
    </View>
    <Text style={styles.headerSubtitle}>{subtitle}</Text>
  </View>
);

const FormCard = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.formCard}>
    <View style={styles.formContainer}>{children}</View>
  </View>
);

const PrimaryButton = ({ text, onPress }: { text: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.primaryButton} onPress={onPress}>
    <LinearGradient
      colors={["#1E40AF", "#3B82F6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.buttonGradient}
    >
      <Text style={styles.buttonText}>{text}</Text>
      <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
    </LinearGradient>
  </TouchableOpacity>
);

const SwitchButton = ({ text, onPress }: { text: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.switchButton} onPress={onPress}>
    <Text style={styles.switchText}>{text}</Text>
  </TouchableOpacity>
);

interface InputProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  icon?: keyof typeof MaterialIcons.glyphMap;
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  secure = false,
  keyboardType = "default",
  icon,
}: InputProps) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color="rgba(30, 64, 175, 0.6)"
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="rgba(30, 64, 175, 0.6)"
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  headerContainer: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    width: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 12,
  },
  tagline: { fontSize: 14, color: "rgba(255,255,255,0.9)", fontWeight: "300" },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "300",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: { backgroundColor: "rgba(255,255,255,0.9)" },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  activeTabText: { color: "#1E40AF" },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  formContainer: { gap: 20 },
  inputContainer: { marginBottom: 4 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(30, 64, 175, 0.2)",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    shadowColor: "rgba(30, 64, 175, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1E40AF",
    fontWeight: "500",
  },
  primaryButton: {
    borderRadius: 14,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#1E40AF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginTop: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  switchButton: { alignItems: "center", paddingVertical: 12 },
  switchText: { fontSize: 14, color: "#1E40AF", fontWeight: "500" },
});
