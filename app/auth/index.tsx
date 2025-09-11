import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter,Stack } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function AuthPage() {
  const router = useRouter();

  type RoleButtonProps = {
    title: string;
    onPress: () => void;
    icon: string;
  };

  const RoleButton = ({ title, onPress, icon }: RoleButtonProps) => (
    <TouchableOpacity style={styles.roleButton} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.buttonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.buttonIcon}>{icon}</Text>
        <Text style={styles.buttonText}>{title}</Text>
        <Text style={styles.buttonArrow}>→</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8FBFF', '#E3F2FD']}
        style={styles.background}
      >
        <View style={styles.contentContainer}>
          {/* Header Section */}
            <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to</Text>
            <Text style={styles.appName}>MediConnect</Text>
            <Text style={styles.subtitle}>Choose your role to continue</Text>
          </View>

          {/* Role Selection Cards */}
          <View style={styles.roleContainer}>
            <RoleButton
              title="Doctor"
              icon="👨‍⚕️"
              onPress={() => router.push("/auth/doctor")}
            />
            
            <RoleButton
              title="Patient"
              icon="👤"
              onPress={() => router.push("/auth/patient")}
            />
            
            <RoleButton
              title="Pharmacy"
              icon="🏥"
              onPress={() => router.push("/auth/pharmacy")}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Secure • Reliable • Professional Healthcare Platform
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
    marginBottom: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    fontWeight: '400',
  },
  roleContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  roleButton: {
    width: width * 0.85,
    height: 80,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#1565C0',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  buttonIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  buttonText: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  buttonArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    fontWeight: '400',
  },
});