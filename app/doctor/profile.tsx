import axios from "axios";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <Text style={styles.headerSubtitle}>
          {isEditing ? "Edit your professional information" : "Your professional information"}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Summary Card */}
        <View style={styles.profileSummary}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={50} color="#1E40AF" />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpec}>{doctor.specialization}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.statText}>{doctor.rating}/5</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="people" size={16} color="#1E40AF" />
                <Text style={styles.statText}>{doctor.patients} patients</Text>
              </View>
            </View>
          </View>
          <View style={[styles.availabilityBadge, doctor.availability === "online" && styles.onlineBadge]}>
            <Text style={[styles.availabilityText, doctor.availability === "online" && styles.onlineText]}>
              {doctor.availability === "online" ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#1E40AF" />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={doctor.name}
              editable={isEditing}
              onChangeText={(text) => setDoctor({ ...doctor, name: text })}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Specialization *</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={doctor.specialization}
              editable={isEditing}
              onChangeText={(text) => setDoctor({ ...doctor, specialization: text })}
              placeholder="e.g., Cardiologist, Neurologist"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Experience *</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={doctor.experience}
              editable={isEditing}
              onChangeText={(text) => setDoctor({ ...doctor, experience: text })}
              placeholder="e.g., 5 years"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Professional Bio */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color="#1E40AF" />
            <Text style={styles.sectionTitle}>Professional Bio</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>About You</Text>
            <TextInput
              style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]}
              value={doctor.bio}
              editable={isEditing}
              onChangeText={(text) => setDoctor({ ...doctor, bio: text })}
              placeholder="Tell patients about your background and approach to healthcare..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Certifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="ribbon-outline" size={20} color="#1E40AF" />
            <Text style={styles.sectionTitle}>Certifications & Qualifications</Text>
          </View>
          {doctor.certifications.map((cert, idx) => (
            <View key={idx} style={styles.certificationRow}>
              <TextInput
                style={[styles.input, styles.certInput, !isEditing && styles.inputDisabled]}
                value={cert}
                editable={isEditing}
                onChangeText={(text) => {
                  const newCerts = [...doctor.certifications];
                  newCerts[idx] = text;
                  setDoctor({ ...doctor, certifications: newCerts });
                }}
                placeholder="e.g., Board Certified in Cardiology"
                placeholderTextColor="#94A3B8"
              />
              {isEditing && (
                <TouchableOpacity 
                  onPress={() => removeCertification(idx)} 
                  style={styles.removeBtn}
                >
                  <Ionicons name="close" size={16} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {isEditing && (
            <TouchableOpacity onPress={addCertification} style={styles.addBtn}>
              <Ionicons name="add" size={16} color="#1E40AF" />
              <Text style={styles.addBtnText}>Add Certification</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call-outline" size={20} color="#1E40AF" />
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={doctor.phone}
                editable={isEditing}
                keyboardType="phone-pad"
                onChangeText={(text) => setDoctor({ ...doctor, phone: text })}
                placeholder="+1 234 567 8900"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={doctor.email}
                editable={isEditing}
                keyboardType="email-address"
                onChangeText={(text) => setDoctor({ ...doctor, email: text })}
                placeholder="doctor@example.com"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]}
              value={doctor.address}
              editable={isEditing}
              multiline
              numberOfLines={2}
              onChangeText={(text) => setDoctor({ ...doctor, address: text })}
              placeholder="Clinic/Hospital address"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Professional Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business-outline" size={20} color="#1E40AF" />
            <Text style={styles.sectionTitle}>Professional Details</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hospital/Clinic *</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={doctor.hospital}
              editable={isEditing}
              onChangeText={(text) => setDoctor({ ...doctor, hospital: text })}
              placeholder="Primary workplace"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medical License *</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={doctor.license}
              editable={isEditing}
              onChangeText={(text) => setDoctor({ ...doctor, license: text })}
              placeholder="License number"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Languages Spoken</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={doctor.languages.join(", ")}
              editable={isEditing}
              onChangeText={(text) =>
                setDoctor({ ...doctor, languages: text.split(",").map((l) => l.trim()) })
              }
              placeholder="English, Spanish, French"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <View style={styles.availabilityHeader}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color="#1E40AF" />
              <Text style={styles.sectionTitle}>Availability Status</Text>
            </View>
            <Switch
              value={doctor.availability === "online"}
              onValueChange={(val) => setDoctor({ ...doctor, availability: val ? "online" : "offline" })}
              disabled={!isEditing}
              trackColor={{ false: "#E2E8F0", true: "#1E40AF" }}
              thumbColor={doctor.availability === "online" ? "white" : "#94A3B8"}
            />
          </View>
          <Text style={styles.availabilityDesc}>
            {doctor.availability === "online" 
              ? "You are currently available for consultations" 
              : "You are currently offline for consultations"}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {isEditing ? (
            <View style={styles.editingButtons}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => {
                  setIsEditing(false);
                  fetchDoctor(); // Reset changes
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Ionicons name="checkmark" size={18} color="white" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={18} color="white" />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#1E40AF" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
  },
  header: {
    backgroundColor: "#1E40AF",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Profile Summary
  profileSummary: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#1E40AF",
  },
  summaryInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  doctorSpec: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  availabilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  onlineBadge: {
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D97706",
  },
  onlineText: {
    color: "#059669",
  },

  // Sections
  section: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
  },

  // Inputs
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1E293B",
    backgroundColor: "white",
  },
  inputDisabled: {
    backgroundColor: "#F8FAFC",
    color: "#64748B",
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

  // Certifications
  certificationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  certInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#1E40AF",
    borderStyle: "dashed",
    backgroundColor: "white",
    gap: 8,
    alignSelf: "flex-start",
  },
  addBtnText: {
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Availability
  availabilityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  availabilityDesc: {
    fontSize: 14,
    color: "#64748B",
    fontStyle: "italic",
  },

  // Actions
  actionSection: {
    marginBottom: 16,
  },
  editingButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  editBtn: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  editBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  bottomSpacing: {
    height: 20,
  },
});