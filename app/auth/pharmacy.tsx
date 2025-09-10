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

type User = {
  storeId: string;
  ownerName: string;
  shopName: string;
  emailOrPhone: string;
  password: string;
  certificate?: string;
};

export default function PharmacyPage() {
  const router = useRouter();

  // ----- State -----
  const [mode, setMode] = useState<"register" | "login">("register");
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Registration
  const [ownerName, setOwnerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [certificate, setCertificate] = useState("");

  // Login
  const [loginId, setLoginId] = useState(""); // storeId / email / phone
  const [loginPassword, setLoginPassword] = useState("");

  // ----- Handlers -----
  const generateStoreId = () => `STORE-${Date.now()}`;

  const handleRegister = async () => {
    if (!ownerName || !shopName || !emailOrPhone || !password) {
      return Alert.alert("Error", "Please fill all fields");
    }

    const storeId = generateStoreId();
    const newUser: User = { storeId, ownerName, shopName, emailOrPhone, password, certificate };

    setUsers([newUser, ...users]);

    // Copy Store ID to clipboard
    await Clipboard.setStringAsync(storeId);

    Alert.alert("Registration Success", `Your Store ID: ${storeId} (copied to clipboard)`);

    // Clear fields
    setOwnerName(""); 
    setShopName(""); 
    setEmailOrPhone(""); 
    setPassword(""); 
    setCertificate("");

    setMode("login");
  };

  const handleLogin = () => {
    const user = users.find(
      u => (u.storeId === loginId || u.emailOrPhone === loginId) && u.password === loginPassword
    );

    if (!user) {
      return Alert.alert("Login Failed", "Invalid credentials");
    }

    setCurrentUser(user);

    // Navigate to pharmacy/home
    router.push("/pharmacy/home");
  };

  // ----- Render -----
  if (mode === "register") {
    return (
      <View style={styles.mainContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>⚕️</Text>
            </View>
            <Text style={styles.title}>Pharmacy Registration</Text>
            <Text style={styles.subtitle}>Create your pharmacy account</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Owner Name</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter owner full name"
                placeholderTextColor="#9CA3AF"
                value={ownerName} 
                onChangeText={setOwnerName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Shop Name</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter pharmacy name"
                placeholderTextColor="#9CA3AF"
                value={shopName} 
                onChangeText={setShopName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email or Phone</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter email or phone number"
                placeholderTextColor="#9CA3AF"
                value={emailOrPhone} 
                onChangeText={setEmailOrPhone}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Create a strong password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry 
                value={password} 
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Pharmacy Certificate</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Upload certificate (optional)"
                placeholderTextColor="#9CA3AF"
                value={certificate} 
                onChangeText={setCertificate}
              />
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister}>
              <Text style={styles.btnPrimaryText}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

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
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>⚕️</Text>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your pharmacy account</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Store ID / Email / Phone</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter your credentials"
                placeholderTextColor="#9CA3AF"
                value={loginId} 
                onChangeText={setLoginId}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry 
                value={loginPassword} 
                onChangeText={setLoginPassword}
              />
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
              <Text style={styles.btnPrimaryText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.btnSecondary} onPress={() => setMode("register")}>
              <Text style={styles.btnSecondaryText}>New to our platform? Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

// ----- Styles -----
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  btnPrimary: {
    width: '100%',
    height: 56,
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#0EA5E9',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  btnSecondary: {
    width: '100%',
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  btnSecondaryText: {
    color: '#0EA5E9',
    fontSize: 16,
    fontWeight: '600',
  },
});
