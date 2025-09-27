import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter, Stack } from "expo-router";
import React from "react";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function AuthPage() {
  const router = useRouter();

  type RoleButtonProps = {
    title: string;
    onPress: () => void;
    iconName: string;
    iconFamily: 'MaterialIcons' | 'Ionicons';
    isTransparent?: boolean;
  };

  const RoleButton = ({ title, onPress, iconName, iconFamily, isTransparent = false }: RoleButtonProps) => (
    <TouchableOpacity 
      style={[styles.roleButton, isTransparent && styles.transparentButton]} 
      onPress={onPress} 
      activeOpacity={0.85}
    >
      <View style={[styles.buttonInner, isTransparent && styles.transparentButtonInner]}>
        {iconFamily === 'MaterialIcons' ? (
          <MaterialIcons 
            name={iconName as any} 
            size={28} 
            color={isTransparent ? "rgba(255,255,255,0.9)" : "#4F46E5"} 
            style={styles.buttonIcon} 
          />
        ) : (
          <Ionicons 
            name={iconName as any} 
            size={28} 
            color={isTransparent ? "rgba(255,255,255,0.9)" : "#4F46E5"} 
            style={styles.buttonIcon} 
          />
        )}
        <Text style={[styles.buttonText, isTransparent && styles.transparentButtonText]}>
          {title}
        </Text>
        <Text style={[styles.buttonArrow, isTransparent && styles.transparentButtonArrow]}>
          →
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.contentContainer}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="medical-services" size={32} color="rgba(255,255,255,0.9)" />
          </View>
        </View>

        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.appName}>MediConnect</Text>
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.tagline}>Your Health, Our Priority</Text>
            <View style={styles.divider} />
          </View>
          <Text style={styles.subtitle}>
            Connect with healthcare professionals{'\n'}from the comfort of your home
          </Text>
        </View>

        {/* Role Selection Cards */}
        <View style={styles.roleContainer}>
          <RoleButton
            title="DoctorConnect"
            iconName="medical-services"
            iconFamily="MaterialIcons"
            onPress={() => router.push("/auth/doctor")}
            isTransparent={true}
          />
          
          <RoleButton
            title="PatientConnect"
            iconName="person"
            iconFamily="MaterialIcons"
            onPress={() => router.push("/auth/patient")}
            isTransparent={true}
          />
          
          <RoleButton
            title="PharmacyConnect"
            iconName="local-pharmacy"
            iconFamily="MaterialIcons"
            onPress={() => router.push("/auth/pharmacy")}
            isTransparent={true}
          />
        </View>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MaterialIcons name="videocam" size={20} color="rgba(255,255,255,0.8)" />
            </View>
            <Text style={styles.featureTitle}>Video{'\n'}Consultations</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MaterialIcons name="flash-on" size={20} color="rgba(255,255,255,0.8)" />
            </View>
            <Text style={styles.featureTitle}>Instant{'\n'}Appointments</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MaterialIcons name="security" size={20} color="rgba(255,255,255,0.8)" />
            </View>
            <Text style={styles.featureTitle}>Secure &{'\n'}Private</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  languageContainer: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  languageSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 4,
  },
  activeLanguage: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  activeLanguageText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 14,
  },
  inactiveLanguage: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inactiveLanguageText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: -1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    height: 1,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '300',
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: width * 0.85,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  primaryButtonSubtext: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  roleContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  roleButton: {
    width: width * 0.85,
    height: 70,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  transparentButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  transparentButtonInner: {
    backgroundColor: 'transparent',
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    textAlign: 'left',
  },
  transparentButtonText: {
    color: 'rgba(255,255,255,0.9)',
  },
  buttonArrow: {
    fontSize: 18,
    color: '#4F46E5',
    fontWeight: '300',
  },
  transparentButtonArrow: {
    color: 'rgba(255,255,255,0.7)',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  featureTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 16,
  },
});