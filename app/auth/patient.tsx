import { useState, useRef } from "react";
import { useRouter, Stack } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { v4 as uuidv4 } from "uuid";

// ✅ Firebase compat (needed for Recaptcha)
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

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
  const [usePhone, setUsePhone] = useState(true); // default → phone signup for rural patients

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

  // Generate Patient Code
  const generatePatientCode = () => "PAT-" + uuidv4().slice(0, 8).toUpperCase();

  // ---------------- MongoDB API Call ----------------
  const saveToMongoDB = async ({
    uid,
    code,
    email,
    phone,
  }: {
    uid: string;
    code: string;
    email?: string;
    phone?: string;
  }) => {
    try {
      await fetch("http://localhost:5000/api/patients/register-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, code, email, phone }),
      });
    } catch (err) {
      console.error("MongoDB save error:", err);
    }
  };

  // ---------------- Signup (Phone or Email) ----------------
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

          // Save in MongoDB
          await saveToMongoDB({
            uid: result.user?.uid!,
            code,
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
          uid: result.user?.uid!,
          code,
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
      // In a real app, you’d verify patientCode with your MongoDB
      // For now we just redirect
      router.push("/patient/home" as any);
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
              placeholder="Enter Patient Code"
              value={patientCode}
              onChangeText={setPatientCode}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // ---------------- Signup ----------------
          <View style={styles.formContainer}>
            {usePhone ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="+91 9876543210"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                {verificationId ? (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter OTP"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                  />
                ) : (
                  <TextInput
                    style={styles.input}
                    placeholder="Set Password (optional)"
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

                {/* Link to Email Signup */}
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
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
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

                {/* Link to Phone Signup */}
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
  container: { flex: 1, backgroundColor: "#F8FAFF" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 24 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#2563EB" },
  tabText: { fontSize: 16, fontWeight: "600", color: "#64748B" },
  activeTabText: { color: "#FFFFFF" },
  formContainer: { gap: 16 },
  input: {
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#FAFBFC",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  linkText: {
    marginTop: 12,
    fontSize: 14,
    color: "#2563EB",
    textAlign: "center",
  },
  generatedIdContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
  },
  generatedIdTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  generatedIdText: { fontSize: 18, fontWeight: "700", color: "#1E40AF" },
});
