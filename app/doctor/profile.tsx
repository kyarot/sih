import axios from "axios";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

interface Doctor {
  name: string;
  specialization: string;
  experience: string;
  bio: string;
  certifications: string[];
  hospital: string;
  license: string;
  languages: string[];
  phone: string;
  email: string;
  address: string;
  rating: number;
  patients: number;
  availability: "online" | "offline";
}

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    getDoctorId();
  }, []);

  useEffect(() => {
    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  const getDoctorId = async () => {
    try {
      const id = await AsyncStorage.getItem("doctorId");
      setDoctorId(id);
    } catch (error) {
      console.error("Error getting doctorId from AsyncStorage:", error);
    }
  };

  const fetchDoctor = async () => {
    if (!doctorId) return;
    try {
      const res = await axios.get(`https://7300c4c894de.ngrok-free.app/api/doctors/${doctorId}`);
      setDoctor(res.data);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to fetch doctor profile");
    }
  };

  const handleSave = async () => {
    if (!doctor || !doctorId) return;
    try {
      const res = await axios.put(`https://7300c4c894de.ngrok-free.app/api/doctors/${doctorId}`, doctor);
      setDoctor(res.data);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const addCertification = () => {
    if (!doctor) return;
    setDoctor({ ...doctor, certifications: [...doctor.certifications, ""] });
  };

  const removeCertification = (index: number) => {
    if (!doctor) return;
    const newCerts = [...doctor.certifications];
    newCerts.splice(index, 1);
    setDoctor({ ...doctor, certifications: newCerts });
  };

  if (!doctor) {
    return (
      <LinearGradient 
        colors={['#1e3a8a', '#3b82f6', '#60a5fa']} 
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <Ionicons name="medical" size={40} color="#60a5fa" />
              <Text style={styles.loadingText}>Loading Profile...</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient 
      colors={['#1e3a8a', '#3b82f6', '#60a5fa']} 
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Doctor Profile</Text>
          <Text style={styles.headerSubtitle}>
            {isEditing ? "Edit your professional information" : "Your professional information"}
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Enhanced Profile Summary Card */}
          <View style={styles.profileSummary}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.8)']}
              style={styles.profileGradient}
            >
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#60a5fa', '#3b82f6']}
                  style={styles.avatarGradient}
                >
                  <Ionicons name="person" size={50} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpec}>{doctor.specialization}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={16} color="#f59e0b" />
                    <Text style={styles.statText}>{doctor.rating}/5</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="people" size={16} color="#3b82f6" />
                    <Text style={styles.statText}>{doctor.patients} patients</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.availabilityBadge, doctor.availability === "online" && styles.onlineBadge]}>
                <Text style={[styles.availabilityText, doctor.availability === "online" && styles.onlineText]}>
                  {doctor.availability === "online" ? "Online" : "Offline"}
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.sectionGradient}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person-outline" size={20} color="white" />
                </View>
                <Text style={styles.sectionTitle}>Basic Information</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    value={doctor.name}
                    editable={isEditing}
                    onChangeText={(text) => setDoctor({ ...doctor, name: text })}
                    placeholder="Enter your full name"
                    placeholderTextColor="rgba(96, 165, 250, 0.5)"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Specialization *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    value={doctor.specialization}
                    editable={isEditing}
                    onChangeText={(text) => setDoctor({ ...doctor, specialization: text })}
                    placeholder="e.g., Cardiologist, Neurologist"
                    placeholderTextColor="rgba(96, 165, 250, 0.5)"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Experience *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    value={doctor.experience}
                    editable={isEditing}
                    onChangeText={(text) => setDoctor({ ...doctor, experience: text })}
                    placeholder="e.g., 5 years"
                    placeholderTextColor="rgba(96, 165, 250, 0.5)"
                  />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Professional Bio */}
          <View style={styles.section}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.sectionGradient}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="document-text-outline" size={20} color="white" />
                </View>
                <Text style={styles.sectionTitle}>Professional Bio</Text>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>About You</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]}
                    value={doctor.bio}
                    editable={isEditing}
                    onChangeText={(text) => setDoctor({ ...doctor, bio: text })}
                    placeholder="Tell patients about your background and approach to healthcare..."
                    placeholderTextColor="rgba(96, 165, 250, 0.5)"
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Certifications */}
          <View style={styles.section}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.sectionGradient}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="ribbon-outline" size={20} color="white" />
                </View>
                <Text style={styles.sectionTitle}>Certifications & Qualifications</Text>
              </View>
              {doctor.certifications.map((cert, idx) => (
                <View key={idx} style={styles.certificationRow}>
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <TextInput
                      style={[styles.input, !isEditing && styles.inputDisabled]}
                      value={cert}
                      editable={isEditing}
                      onChangeText={(text) => {
                        const newCerts = [...doctor.certifications];
                        newCerts[idx] = text;
                        setDoctor({ ...doctor, certifications: newCerts });
                      }}
                      placeholder="e.g., Board Certified in Cardiology"
                      placeholderTextColor="rgba(96, 165, 250, 0.5)"
                    />
                  </View>
                  {isEditing && (
                    <TouchableOpacity 
                      onPress={() => removeCertification(idx)} 
                      style={styles.removeBtn}
                    >
                      <Ionicons name="close" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {isEditing && (
                <TouchableOpacity onPress={addCertification} style={styles.addBtn}>
                  <Ionicons name="add" size={16} color="#3b82f6" />
                  <Text style={styles.addBtnText}>Add Certification</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.sectionGradient}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="call-outline" size={20} color="white" />
                </View>
                <Text style={styles.sectionTitle}>Contact Information</Text>
              </View>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Phone *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, !isEditing && styles.inputDisabled]}
                      value={doctor.phone}
                      editable={isEditing}
                      keyboardType="phone-pad"
                      onChangeText={(text) => setDoctor({ ...doctor, phone: text })}
                      placeholder="+1 234 567 8900"
                      placeholderTextColor="rgba(96, 165, 250, 0.5)"
                    />
                  </View>
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Email *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, !isEditing && styles.inputDisabled]}
                      value={doctor.email}
                      editable={isEditing}
                      keyboardType="email-address"
                      onChangeText={(text) => setDoctor({ ...doctor, email: text })}
                      placeholder="doctor@example.com"
                      placeholderTextColor="rgba(96, 165, 250, 0.5)"
                    />
                  </View>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]}
                    value={doctor.address}
                    editable={isEditing}
                    multiline
                    numberOfLines={2}
                    onChangeText={(text) => setDoctor({ ...doctor, address: text })}
                    placeholder="Clinic/Hospital address"
                    placeholderTextColor="rgba(96, 165, 250, 0.5)"
                  />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Professional Details */}
          <View style={styles.section}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.sectionGradient}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="business-outline" size={20} color="white" />
                </View>
                <Text style={styles.sectionTitle}>Professional Details</Text>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hospital/Clinic *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    value={doctor.hospital}
                    editable={isEditing}
                    onChangeText={(text) => setDoctor({ ...doctor, hospital: text })}
                    placeholder="Primary workplace"
                    placeholderTextColor="rgba(96, 165, 250, 0.5)"
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Medical License *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    value={doctor.license}
                    editable={isEditing}
                    onChangeText={(text) => setDoctor({ ...doctor, license: text })}
                    placeholder="License number"
                    placeholderTextColor="rgba(96, 165, 250, 0.5)"
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Languages Spoken</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    value={doctor.languages.join(", ")}
                    editable={isEditing}
                    onChangeText={(text) =>
                      setDoctor({ ...doctor, languages: text.split(",").map((l) => l.trim()) })
                    }
                    placeholder="English, Spanish, French"
                    placeholderTextColor="rgba(96, 165, 250, 0.5)"
                  />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.sectionGradient}
            >
              <View style={styles.availabilityHeader}>
                <View style={styles.sectionHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="time-outline" size={20} color="white" />
                  </View>
                  <Text style={styles.sectionTitle}>Availability Status</Text>
                </View>
                <Switch
                  value={doctor.availability === "online"}
                  onValueChange={(val) => setDoctor({ ...doctor, availability: val ? "online" : "offline" })}
                  disabled={!isEditing}
                  trackColor={{ false: "rgba(255,255,255,0.3)", true: "#3b82f6" }}
                  thumbColor={doctor.availability === "online" ? "white" : "rgba(255,255,255,0.8)"}
                />
              </View>
              <Text style={styles.availabilityDesc}>
                {doctor.availability === "online" 
                  ? "You are currently available for consultations" 
                  : "You are currently offline for consultations"}
              </Text>
            </LinearGradient>
          </View>

          {/* Enhanced Action Buttons */}
          <View style={styles.actionSection}>
            {isEditing ? (
              <View style={styles.editingButtons}>
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={() => {
                    setIsEditing(false);
                    fetchDoctor();
                  }}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <LinearGradient
                    colors={['#ffffff', '#f8fafc']}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="checkmark" size={18} color="#3b82f6" />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="create-outline" size={18} color="#3b82f6" />
                  <Text style={styles.editBtnText}>Edit Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: { 
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  loadingText: {
    fontSize: 16,
    color: "#1e3a8a",
    marginTop: 12,
    fontWeight: '600',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Enhanced Profile Summary
  profileSummary: {
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  profileGradient: {
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  doctorSpec: {
    fontSize: 15,
    color: "#3b82f6",
    marginBottom: 12,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: "row",
    gap: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  availabilityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  onlineBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: "#22c55e",
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#d97706",
  },
  onlineText: {
    color: "#059669",
  },

  // Enhanced Sections
  section: {
    marginBottom: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionGradient: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3a8a",
  },

  // Enhanced Inputs
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 8,
  },
  inputContainer: {
    borderRadius: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1e3a8a",
  },
  inputDisabled: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    color: "#64748b",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },

  // Enhanced Certifications
  certificationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderStyle: "dashed",
    backgroundColor: 'rgba(255,255,255,0.8)',
    gap: 8,
    alignSelf: "flex-start",
  },
  addBtnText: {
    color: "#3b82f6",
    fontSize: 15,
    fontWeight: "700",
  },

  // Enhanced Availability
  availabilityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  availabilityDesc: {
    fontSize: 14,
    color: "#64748b",
    fontStyle: "italic",
    fontWeight: '500',
  },

  // Enhanced Action Buttons
  actionSection: {
    marginBottom: 16,
  },
  editingButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelBtnText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "700",
  },
  saveBtn: {
    flex: 1,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "700",
  },
  editBtn: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  editBtnText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  bottomSpacing: {
    height: 30,
  },
});