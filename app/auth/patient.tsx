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
  Dimensions,
} from "react-native";
import { v4 as uuidv4 } from "uuid";
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Firebase compat (needed for Recaptcha)
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import React from "react";

const { width, height } = Dimensions.get('window');

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
      await fetch("https://7300c4c894de.ngrok-free.app/api/patients/register-patient", {
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
        `https://7300c4c894de.ngrok-free.app/api/patients/${patientCode}`
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
      await AsyncStorage.setItem("patientAcc", patient.accountId);

      // Navigate using UID (PAT-XXXX), not _id
      router.push({
        pathname: "/patient/home/[id]",
        params: { id: patient._id }, // ✅ use uid (PAT-XXXX)
      });
    } catch (err: any) {
      Alert.alert("Login Error", err.message);
    }
  };

  // ---------------- UI ----------------
  return (
    <LinearGradient
      colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Stack.Screen options={{ headerShown: false }} />

          <FirebaseRecaptchaVerifierModal
            ref={recaptchaVerifier}
            firebaseConfig={firebaseConfig}
          />

          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <MaterialIcons name="person" size={32} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.headerTitle}>PatientConnect</Text>
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.tagline}>Your Health Journey</Text>
              <View style={styles.divider} />
            </View>
            <Text style={styles.headerSubtitle}>
              Fast, secure access with your Patient Code or phone
            </Text>
          </View>

          {/* Tab Container */}
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

          {/* Form Container */}
          <View style={styles.formCard}>
            {/* ---------------- Login ---------------- */}
            {isLogin ? (
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="badge" size={20} color="rgba(30, 64, 175, 0.6)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Patient Code (PAT-XXXX)"
                    placeholderTextColor="rgba(30, 64, 175, 0.6)"
                    value={patientCode}
                    onChangeText={setPatientCode}
                  />
                </View>
                
                <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                  <LinearGradient
                    colors={['#1E40AF', '#3B82F6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Login</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
                
                <View style={styles.helperContainer}>
                  <MaterialIcons name="info-outline" size={16} color="rgba(30, 64, 175, 0.7)" />
                  <Text style={styles.helperText}>
                    You received your Patient Code during signup. It looks like PAT-1A2B3C4D.
                  </Text>
                </View>
              </View>
            ) : (
              // ---------------- Signup ----------------
              <View style={styles.formContainer}>
                {usePhone ? (
                  <>
                    <View style={styles.inputContainer}>
                      <MaterialIcons name="phone" size={20} color="rgba(30, 64, 175, 0.6)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="+91 9876543210"
                        placeholderTextColor="rgba(30, 64, 175, 0.6)"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                      />
                    </View>
                    
                    {verificationId ? (
                      <View style={styles.inputContainer}>
                        <MaterialIcons name="sms" size={20} color="rgba(30, 64, 175, 0.6)" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter OTP"
                          placeholderTextColor="rgba(30, 64, 175, 0.6)"
                          value={otp}
                          onChangeText={setOtp}
                          keyboardType="number-pad"
                        />
                      </View>
                    ) : (
                      <View style={styles.inputContainer}>
                        <MaterialIcons name="lock" size={20} color="rgba(30, 64, 175, 0.6)" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Set Password (optional)"
                          placeholderTextColor="rgba(30, 64, 175, 0.6)"
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry
                        />
                      </View>
                    )}
                    
                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={handleSignup}
                    >
                      <LinearGradient
                        colors={['#1E40AF', '#3B82F6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.buttonText}>
                          {verificationId ? "Verify OTP" : "Sign Up with Phone"}
                        </Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.switchButton}
                      onPress={() => setUsePhone(false)}
                    >
                      <Text style={styles.switchText}>
                        Prefer Email? Sign up with Email
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.inputContainer}>
                      <MaterialIcons name="email" size={20} color="rgba(30, 64, 175, 0.6)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="rgba(30, 64, 175, 0.6)"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <MaterialIcons name="lock" size={20} color="rgba(30, 64, 175, 0.6)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="rgba(30, 64, 175, 0.6)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                      />
                    </View>
                    
                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={handleSignup}
                    >
                      <LinearGradient
                        colors={['#1E40AF', '#3B82F6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.buttonText}>Sign Up with Email</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.switchButton}
                      onPress={() => setUsePhone(true)}
                    >
                      <Text style={styles.switchText}>
                        Prefer Phone? Sign up with Phone
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Security Features */}
          <View style={styles.securityContainer}>
            <View style={styles.securityItem}>
              <MaterialIcons name="security" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.securityText}>End-to-End Encrypted</Text>
            </View>
            <View style={styles.securityItem}>
              <MaterialIcons name="verified" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.securityText}>HIPAA Compliant</Text>
            </View>
            <View style={styles.securityItem}>
              <MaterialIcons name="shield" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.securityText}>Secure Platform</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    width: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '300',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '300',
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: 'rgba(255,255,255,0.8)',
  },
  activeTabText: {
    color: "#1E40AF",
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(30, 64, 175, 0.2)',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    shadowColor: 'rgba(30, 64, 175, 0.1)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1E40AF",
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#1E40AF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchText: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: '500',
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(30, 64, 175, 0.05)',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#1E40AF',
  },
  helperText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(30, 64, 175, 0.8)',
    lineHeight: 16,
  },
  securityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  securityItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  securityText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '400',
  },
});