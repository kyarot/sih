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

      Alert.alert("Login Success ✅", `Welcome ${data.pharmacy.name}`);
      router.push("/pharmacy/home" as any);
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
  mainContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  iconText: { fontSize: 36 },
  title: { fontSize: 32, fontWeight: '800', color: '#1E293B', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24 },
  formContainer: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { width: '100%', height: 56, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, backgroundColor: '#FFFFFF', color: '#1F2937' },
  btnPrimary: { width: '100%', height: 56, backgroundColor: '#0EA5E9', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 24, elevation: 8 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 16, fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
  btnSecondary: { width: '100%', height: 56, backgroundColor: 'transparent', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB' },
  btnSecondaryText: { color: '#0EA5E9', fontSize: 16, fontWeight: '600' },
});
