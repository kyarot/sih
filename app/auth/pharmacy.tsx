import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert 
} from "react-native";
import * as Clipboard from "expo-clipboard"; 
import { useRouter, Stack } from "expo-router";
import { auth } from "@/firebase/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function PharmacyPage() {
  const router = useRouter();

  // Mode
  const [mode, setMode] = useState<"register" | "login">("register");

  // Registration fields
  const [ownerName, setOwnerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [certificate, setCertificate] = useState("");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ---------------- Register Pharmacy ----------------
  const handleRegister = async () => {
    if (!ownerName || !shopName || !email || !password) {
      return Alert.alert("Error", "Please fill all required fields");
    }

    try {
      // Firebase signup
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid; 
      const idToken = await cred.user.getIdToken();

      // Save to backend
      const res = await fetch("http://localhost:5000/api/pharmacies/register-pharmacy", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  },
  body: JSON.stringify({
    name: shopName,
    email,
    phone: null,
    address: "",
    city: "",
    state: "",
    pincode: "",
    licenseNumber: certificate || `LIC-${Date.now()}`,
    licenseImageURL: "",
    openingHours: "",
    services: [],
  }),
});

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Backend error");

      const storeId = data.pharmacy._id;
      await Clipboard.setStringAsync(storeId);

      Alert.alert("Registration Success 🎉", `Your Store ID: ${storeId} (copied to clipboard)`);

      // Clear fields
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

  // ---------------- Login Pharmacy ----------------
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      return Alert.alert("Error", "Enter login credentials");
    }

    try {
      // Firebase login
      const cred = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const idToken = await cred.user.getIdToken();

      // Fetch pharmacy by UID
      const uid = cred.user.uid;
      const res = await fetch(`http://localhost:5000/api/pharmacies/owner/${uid}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Pharmacy not found");
       const pharmacyId = data.pharmacy._id;
      await AsyncStorage.setItem("pharmacyId", pharmacyId);

      Alert.alert("Login Success ✅", `Welcome ${data.pharmacy.name}`);
      router.push({
      pathname: "/pharmacy/home",
      params: { pharmacyId },
    } as any);
    } catch (err: any) {
      Alert.alert("Login Error", err.message);
    }
  };

  // ---------------- UI ----------------
  if (mode === "register") {
    return (
      <View style={styles.mainContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}><Text style={styles.iconText}>⚕️</Text></View>
            <Text style={styles.title}>Pharmacy Registration</Text>
            <Text style={styles.subtitle}>Create your pharmacy account</Text>
          </View>

          <View style={styles.formContainer}>
            <Input label="Owner Name" value={ownerName} onChange={setOwnerName} placeholder="Enter owner full name" />
            <Input label="Shop Name" value={shopName} onChange={setShopName} placeholder="Enter pharmacy name" />
            <Input label="Email" value={email} onChange={setEmail} placeholder="Enter email" keyboardType="email-address" />
            <Input label="Password" value={password} onChange={setPassword} placeholder="Create password" secure />
            <Input label="Pharmacy Certificate" value={certificate} onChange={setCertificate} placeholder="License number" />

            <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister}>
              <Text style={styles.btnPrimaryText}>Create Account</Text>
            </TouchableOpacity>

            <Divider />
            <TouchableOpacity style={styles.btnSecondary} onPress={() => setMode("login")}>
              <Text style={styles.btnSecondaryText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (mode === "login") {
    return (
      <View style={styles.mainContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}><Text style={styles.iconText}>⚕️</Text></View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your pharmacy account</Text>
          </View>

          <View style={styles.formContainer}>
            <Input label="Email" value={loginEmail} onChange={setLoginEmail} placeholder="Enter your email" />
            <Input label="Password" value={loginPassword} onChange={setLoginPassword} placeholder="Enter your password" secure />

            <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
              <Text style={styles.btnPrimaryText}>Sign In</Text>
            </TouchableOpacity>

            <Divider />
            <TouchableOpacity style={styles.btnSecondary} onPress={() => setMode("register")}>
              <Text style={styles.btnSecondaryText}>New pharmacy? Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

// ---------------- Reusable UI Components ----------------
interface InputProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  secure = false,
  keyboardType = "default",
}: InputProps) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

function Divider() {
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>or</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  iconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(30,64,175,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  iconText: { fontSize: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E40AF', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(30,64,175,0.8)', textAlign: 'center', lineHeight: 20 },
  formContainer: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  inputContainer: { marginBottom: 12 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#1E40AF', marginBottom: 6 },
  input: { width: '100%', height: 48, borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, fontSize: 15, backgroundColor: '#FFFFFF', color: '#0F172A', shadowColor: '#1E40AF', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  btnPrimary: { width: '100%', height: 48, backgroundColor: '#1E40AF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 6, marginBottom: 16, elevation: 6, shadowColor: '#1E40AF', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: '#64748B', fontWeight: '600' },
  btnSecondary: { width: '100%', height: 48, backgroundColor: 'transparent', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#1E40AF' },
  btnSecondaryText: { color: '#1E40AF', fontSize: 16, fontWeight: '700' },
});
