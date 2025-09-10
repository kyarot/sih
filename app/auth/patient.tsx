import { useState } from "react";
import "react-native-get-random-values";
import { useRouter , Stack} from "expo-router";
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
  Dimensions
} from "react-native";
import { v4 as uuidv4 } from "uuid";

const { width } = Dimensions.get('window');

export default function PatientAuth() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [patientId, setPatientId] = useState("");
  const [generatedId, setGeneratedId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle signup
  const handleSignup = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(async () => {
      const newId = "PAT-" + uuidv4().slice(0, 8);
      setGeneratedId(newId);
      
      // Copy to clipboard
      await Clipboard.setStringAsync(newId);
      
      Alert.alert(
        "Registration Successful! 🎉",
        `Your Patient ID is: ${newId}\n\n✅ Copied to clipboard automatically`,
        [{ text: "Continue", onPress: () => setIsLogin(true) }]
      );
      
      setIsLoading(false);
    }, 1500);
  };

  // Handle login
  const handleLogin = () => {
    if (!patientId) {
      Alert.alert("Error", "Please enter your Patient ID");
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      if (patientId === generatedId && patientId !== "") {
        router.push("/patient/home");
      } else {
        Alert.alert("Authentication Failed", "Invalid Patient ID. Please check and try again.");
      }
      setIsLoading(false);
    }, 1000);
  };

  // Manual copy button
  const handleCopy = async () => {
    if (generatedId) {
      await Clipboard.setStringAsync(generatedId);
      Alert.alert("Success! 📋", "Patient ID copied to clipboard");
    }
  };

  interface CustomButtonProps {
    title: string;
    onPress: () => void;
    style?: object;
    textStyle?: object;
    disabled?: boolean;
    loading?: boolean;
  }

  const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, style, textStyle, disabled, loading }) => (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, textStyle]}>
        {loading ? "Loading..." : title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.header}>
             <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🏥</Text>
          </View>
          <Text style={styles.title}>MediCare Portal</Text>
          <Text style={styles.subtitle}>
            {isLogin ? "Welcome back!" : "Create your account"}
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
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

          {isLogin ? (
            <View style={styles.inputSection}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Patient ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Patient ID (e.g., PAT-12345678)"
                  value={patientId}
                  onChangeText={setPatientId}
                  placeholderTextColor="#A0A0A0"
                  autoCapitalize="characters"
                />
              </View>
              
              <CustomButton
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.primaryButton}
                textStyle={{}}
                disabled={isLoading}
              />
            </View>
          ) : (
            <View style={styles.inputSection}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#A0A0A0"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <CustomButton
                title="Create Account"
                onPress={handleSignup}
                loading={isLoading}
                style={styles.primaryButton}
                textStyle={{}}
                disabled={isLoading}
              />

              {generatedId ? (
                <View style={styles.generatedIdContainer}>
                  <Text style={styles.generatedIdTitle}>
                    🎉 Account Created Successfully!
                  </Text>
                  <View style={styles.idDisplayContainer}>
                    <Text style={styles.idLabel}>Your Patient ID:</Text>
                    <Text style={styles.idText}>{generatedId}</Text>
                  </View>
                  <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                    <Text style={styles.copyButtonText}>📋 Copy ID</Text>
                  </TouchableOpacity>
                  <Text style={styles.noteText}>
                    💡 Save this ID safely - you'll need it to log in
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Secure • Confidential • HIPAA Compliant
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 30,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  inputSection: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#FAFBFC",
    color: "#1F2937",
    fontWeight: "500",
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  generatedIdContainer: {
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    alignItems: "center",
  },
  generatedIdTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369A1",
    marginBottom: 16,
    textAlign: "center",
  },
  idDisplayContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#2563EB",
    borderStyle: "dashed",
    width: "100%",
    alignItems: "center",
  },
  idLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "500",
  },
  idText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E40AF",
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 12,
  },
  copyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  noteText: {
    fontSize: 13,
    color: "#059669",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
  },
  footer: {
    alignItems: "center",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    fontWeight: "500",
  },
});