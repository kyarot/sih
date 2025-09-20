import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { v4 as uuidv4 } from "uuid";
import { MaterialIcons } from '@expo/vector-icons';

// ✅ Firebase compat (needed for Recaptcha)
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import React from "react";

// ---------------- Firebase Config ----------------
const firebaseConfig = {
  apiKey: "AIzaSyB6teSgKvK5rutg2Slvr8KEQsL3HSgLhN4",
  authDomain: "medi-connect-fd1f4.firebaseapp.com",
  projectId: "medi-connect-fd1f4",
  storageBucket: "medi-connect-fd1f4.appspot.com",
  messagingSenderId: "620614772458",
  appId: "1:620614772458:web:2e29ef433cb9719bfd5993",
  measurementId: "G-MZDP6ZN43B",
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

export default function PatientAuth() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [usePhone, setUsePhone] = useState(true);

  // States
  const [name, setName] = useState("");
  const [patientCode, setPatientCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);

  // Generate Family Patient Code
  const generatePatientCode = () =>
    "PAT-" + uuidv4().slice(0, 8).toUpperCase();

  // ---------------- MongoDB API Call ----------------
  const saveToMongoDB = async ({
    uid,
    code,
    accountId,
    email,
    phone,
  }: {
    uid: string;
    code: string;
    accountId: string;
    email?: string;
    phone?: string;
  }) => {
    try {
      await fetch("https://5aa83c1450d9.ngrok-free.app/api/patients/register-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, code, accountId, email, phone }),
      });
    } catch (err) {
      console.error("MongoDB save error:", err);
    }
  };

  // ---------------- Signup ----------------
  const handleSignup = async () => {
    setLoading(true);
    try {
      if (usePhone) {
        if (!phone) return Alert.alert("Error", "Enter phone number");

        if (!verificationId) {
          // Send OTP
          const provider = new firebase.auth.PhoneAuthProvider();
          const id = await provider.verifyPhoneNumber(
            phone,
            recaptchaVerifier.current!
          );
          setVerificationId(id);
          Alert.alert("OTP Sent", "Check your phone for verification code");
        } else {
          if (!otp) return Alert.alert("Error", "Enter OTP");

          const credential =
            firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
          const result = await auth.signInWithCredential(credential);

          const code = generatePatientCode();
          setPatientCode(code);
          await Clipboard.setStringAsync(code);

          // Save in MongoDB (family-level record)
          await saveToMongoDB({
            uid: code, // 🔑 family UID is PAT-XXXX
            code,
            accountId: result.user?.uid!,
            phone,
          });

          Alert.alert(
            "Signup Success 🎉",
            `Your Patient Code: ${code} (copied to clipboard)`,
            [{ text: "OK", onPress: () => setIsLogin(true) }]
          );
          setVerificationId(null);
        }
      } else {
        // Email signup
        if (!email || !password) {
          return Alert.alert("Error", "Enter email and password");
        }
        const result = await auth.createUserWithEmailAndPassword(
          email,
          password
        );

        const code = generatePatientCode();
        setPatientCode(code);
        await Clipboard.setStringAsync(code);

        await saveToMongoDB({
          uid: code, // 🔑 family UID is PAT-XXXX
          code,
          accountId: result.user?.uid!,
          email,
        });

        Alert.alert(
          "Signup Success 🎉",
          `Your Patient Code: ${code} (copied to clipboard)`,
          [{ text: "OK", onPress: () => setIsLogin(true) }]
        );
      }
    } catch (err: any) {
      Alert.alert("Signup Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Login with Patient Code ----------------
  const handleLogin = async () => {
    if (!patientCode) return Alert.alert("Error", "Enter your Patient Code");

    try {
      // Verify with backend
      const res = await fetch(
        `https://5aa83c1450d9.ngrok-free.app/api/patients/${patientCode}`
      );
      const data = await res.json();

      if (!data.success || !data.patient) {
        return Alert.alert("Login Error", "Invalid Patient Code");
      }

      const patient = data.patient; // ✅ family object

      // Save locally
      await AsyncStorage.setItem("currentPatient", JSON.stringify(patient));
      await AsyncStorage.setItem("PatientUid", patient.uid);
      await AsyncStorage.setItem("patientId", patient._id);

      // Navigate using UID (PAT-XXXX), not _id
      router.push({
        pathname: "/patient/home/[id]",
        params: { id: patient.uid }, // ✅ use uid (PAT-XXXX)
      });
    } catch (err: any) {
      Alert.alert("Login Error", err.message);
    }
  };

  // ---------------- UI ----------------
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Stack.Screen options={{ headerShown: false }} />

        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
        />

        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="person" size={34} color="#1E40AF" />
          </View>
          <Text style={styles.headerTitle}>PatientConnect</Text>
          <Text style={styles.headerSubtitle}>Fast, secure access with your Patient Code or phone</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, isLogin && styles.activeTab]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isLogin && styles.activeTab]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---------------- Login ---------------- */}
        {isLogin ? (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Patient Code (PAT-XXXX)"
              placeholderTextColor="#94A3B8"
              value={patientCode}
              onChangeText={setPatientCode}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>Tip: You received your Patient Code during signup. It looks like PAT-1A2B3C4D.</Text>
          </View>
        ) : (
          // ---------------- Signup ----------------
          <View style={styles.formContainer}>
            {usePhone ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="+91 9876543210"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                {verificationId ? (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter OTP"
                    placeholderTextColor="#94A3B8"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                  />
                ) : (
                  <TextInput
                    style={styles.input}
                    placeholder="Set Password (optional)"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                )}
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSignup}
                >
                  <Text style={styles.buttonText}>
                    {verificationId ? "Verify OTP" : "Sign Up with Phone"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setUsePhone(false)}>
                  <Text style={styles.linkText}>
                    Prefer Email? Sign up with Email
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSignup}
                >
                  <Text style={styles.buttonText}>Sign Up with Email</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setUsePhone(true)}>
                  <Text style={styles.linkText}>
                    Prefer Phone? Sign up with Phone
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(30,64,175,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1E40AF', marginBottom: 6 },
  headerSubtitle: { fontSize: 14, color: 'rgba(30,64,175,0.8)', textAlign: 'center' },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#1E40AF" },
  tabText: { fontSize: 16, fontWeight: "700", color: "#1E40AF" },
  activeTabText: { color: "#FFFFFF" },
  formContainer: { gap: 16 },
  input: {
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    shadowColor: '#1E40AF', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }
  },
  primaryButton: {
    backgroundColor: "#1E40AF",
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 6,
    shadowColor: '#1E40AF', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }
  },
  buttonText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  linkText: {
    marginTop: 12,
    fontSize: 14,
    color: "#1E40AF",
    textAlign: "center",
  },
  helperText: { marginTop: 8, fontSize: 12, color: '#475569', textAlign: 'center' }
});
