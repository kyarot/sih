import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter,Stack } from "expo-router";
import React from "react";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function AuthPage() {
  const router = useRouter();

  type RoleButtonProps = {
    title: string;
    onPress: () => void;
    iconName: string;
    iconFamily: 'MaterialIcons' | 'Ionicons';
  };

  const RoleButton = ({ title, onPress, iconName, iconFamily }: RoleButtonProps) => (
    <TouchableOpacity style={styles.roleButton} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.buttonInner}>
        {iconFamily === 'MaterialIcons' ? (
          <MaterialIcons name={iconName as any} size={28} color="#FFFFFF" style={styles.buttonIcon} />
        ) : (
          <Ionicons name={iconName as any} size={28} color="#FFFFFF" style={styles.buttonIcon} />
        )}
        <Text style={styles.buttonText}>{title}</Text>
        <Text style={styles.buttonArrow}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
              title="DoctorConnect"
              iconName="medical-services"
              iconFamily="MaterialIcons"
              onPress={() => router.push("/auth/doctor")}
            />
            
            <RoleButton
              title="PatientConnect"
              iconName="person"
              iconFamily="MaterialIcons"
              onPress={() => router.push("/auth/patient")}
            />
            
            <RoleButton
              title="PharmacyConnect"
              iconName="local-pharmacy"
              iconFamily="MaterialIcons"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    color: '#1E40AF',
    fontWeight: '300',
    marginBottom: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
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
    shadowColor: '#1E40AF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    backgroundColor: '#1E40AF',
  },
  buttonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#1E40AF',
  },
  buttonIcon: {
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
    color: '#1E40AF',
    textAlign: 'center',
    fontWeight: '400',
  },
});