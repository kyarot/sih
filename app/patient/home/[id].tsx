// id.tsx
// Patient dashboard (updated logic for appointment status & join button)
// Keep your existing dependencies in package.json (axios, expo, etc.)

import axios from "axios";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { JSX, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import AIChat from "../components/AIChat";
import AppointmentsSection from "../components/AppointmentsSection";

import FamilyMembers from "../components/FamilyMembers";
import HealthProfileCard from "../components/HealthProfileCard";
import HealthTipsCard from "../components/HealthTipsCard";
import PatientHeader from "../components/PatientHeader";
import PrescriptionsList from "../components/PrescriptionsList";
import SOSButton from "../components/SOSButton";
import PatientLocation from "../components/loc";
const API_BASE = "https://5aa83c1450d9.ngrok-free.app"; // change if needed
const { width } = Dimensions.get("window");

/* ============================
   Types & Interfaces
   ============================ */

type FamilyProfile = {
  _id?: string;
  uid: string;
  name: string;
  age?: number | string;
  gender?: "Male" | "Female" | "Other" | string;
  email?: string;
  phone?: string;
  bloodGroup?: string;
  address?: string;
  accountId?: string;
  code?: string;
};

type Doctor = {
  _id: string;
  name: string;
  specialization?: string;
  available?: string;
  rating?: number;
  experience?: string;
};

type Appointment = {
  _id?: string;
  patientId?: string | { _id?: string; name?: string };
  doctorId?: Doctor | string | { name?: string; specialization?: string };
  uid?: string;
  requestedDate?: string;
  requestedTime?: string;
  symptomDuration?: string;
  symptomsDescription?: string;
  symptomSeverity?: string;
  decision?: "pending" | "accepted" | "later" | "declined" | "completed" | "missed" | string;
  scheduledDateTime?: string | Date | null;
  videoLink?: string;
  notes?: string;
  status?: "booked" | "completed" | "cancelled" | string;
  createdAt?: string;
  updatedAt?: string;
   patientName?: string;
  patientAge?: number | string;
  patientGender?: string;
};

/* ============================
   Helper components
   ============================ */

const GenderButton: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
}> = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.genderBtn,
        selected ? styles.genderBtnSelected : undefined,
      ]}
    >
      <Text style={[styles.genderBtnText, selected ? styles.genderBtnTextSelected : undefined]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

/* ============================
   Main Component
   ============================ */

export default function PatientHome(): JSX.Element {
  const { id } = useLocalSearchParams();
  const accountId = (id as string) || "";

  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfile[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyProfile | null>(null);
  const [patientDetails, setPatientDetails] = useState<FamilyProfile | null>(null);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [symptomsDescription, setSymptomsDescription] = useState<string>("");
  const [symptomDuration, setSymptomDuration] = useState<string>("");
  const [symptomSeverity, setSymptomSeverity] = useState<"Mild" | "Moderate" | "Severe">("Mild");

  const [expandedSections, setExpandedSections] = useState({
    appointments: false,
    profile: false,
  });

  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [addingNewProfile, setAddingNewProfile] = useState<boolean>(false);
  const [newProfileDraft, setNewProfileDraft] = useState<Partial<FamilyProfile>>({});

  const [expanded, setExpanded] = useState<Record<"profile" | "appointments" | "records", boolean>>({
    profile: false,
    appointments: false,
    records: false,
  });

  const [chat, setChat] = useState<{ type: "user" | "bot"; message: string }[]>([]);
  const [step, setStep] = useState<number>(0);

  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(false);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(false);

  /* ============================
     Effects: fetch initial data
     ============================ */

  useEffect(() => {
    if (!accountId) return;
    fetchFamilyProfiles();
  }, [accountId]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedFamily?.uid) {
      fetchPatientDetails(selectedFamily.uid);
      fetchAppointments(selectedFamily.uid);
    }
  }, [selectedFamily?.uid]);

  /* ============================
     API helpers
     ============================ */

  async function fetchFamilyProfiles() {
    try {
      setLoadingProfiles(true);
      const res = await axios.get(`${API_BASE}/api/patients/family/${accountId}`);
      const data = res.data || [];
      setFamilyProfiles(data);
if (data.length > 0 && !selectedFamily) {
  setSelectedFamily(data[0]);
  setPatientDetails(data[0]); // keep base family details
}

    } catch (err) {
      console.error("fetchFamilyProfiles:", err);
      Toast.show({ type: "error", text1: "Failed to load family profiles" });
    } finally {
      setLoadingProfiles(false);
    }
  }

  async function fetchPatientDetails(uid: string) {
    try {
      const res = await axios.get(`${API_BASE}/api/patients/profile/${uid}`);
      setPatientDetails(res.data || null);
    } catch (err) {
      console.error("fetchPatientDetails:", err);
    }
  }

  async function fetchDoctors() {
    try {
      setLoadingDoctors(true);
      const res = await axios.get(`${API_BASE}/api/doctors`);
      setDoctors(res.data || []);
    } catch (err) {
      console.error("fetchDoctors:", err);
    } finally {
      setLoadingDoctors(false);
    }
  }

  async function fetchAppointments(uid?: string) {
    if (!uid && !selectedFamily?.uid) return;
    const targetUid = uid || selectedFamily?.uid;
    if (!targetUid) return;
    try {
      setLoadingAppointments(true);
      const res = await axios.get(`${API_BASE}/api/appointments/patient/${selectedFamily?.uid}`);
      setAppointments(res.data || []);
    } catch (err) {
      console.error("fetchAppointments:", err);
    } finally {
      setLoadingAppointments(false);
    }
  }

  /* ============================
     Profile update helpers
     ============================ */

  async function handleSaveProfile(editedProfile: FamilyProfile) {
    if (!editedProfile?.uid) {
      Toast.show({ type: "error", text1: "Profile UID missing" });
      return;
    }
    const payload = { ...editedProfile };
    if (payload.age === "" || payload.age === null) {
      delete payload.age;
    }
    try {
      const res = await axios.put(`${API_BASE}/api/patients/profile/${payload.uid}`, payload);
      const updated = res?.data?.patient || payload;
      setSelectedFamily(updated as FamilyProfile);
      setEditingProfile(false);
      Toast.show({ type: "success", text1: "Profile updated" });
    } catch (err) {
      console.error("handleSaveProfile:", err);
      Toast.show({ type: "error", text1: "Failed to update profile" });
    }
  }

  async function handleCreateProfile(payload: Partial<FamilyProfile>) {
    if (!payload.name) {
      Toast.show({ type: "error", text1: "Name required" });
      return;
    }
  const body = {
  ...payload,
  uid: payload.uid || `UID${Date.now()}`,   // unique per profile
  code: selectedFamily?.code || patientDetails?.code || accountId, // ✅ always reuse family PAT code
  accountId, // stays same for family
};

    try {
      const res = await axios.post(`${API_BASE}/api/patients/register-patient`, body);
      const created = res?.data?.patient || body;
      setFamilyProfiles((p) => [...p, created]);
      setSelectedFamily(created as FamilyProfile);
      setAddingNewProfile(false);
      setNewProfileDraft({});
      Toast.show({ type: "success", text1: "Profile created" });
    } catch (err) {
      console.error("handleCreateProfile:", err);
      Toast.show({ type: "error", text1: "Failed to create profile" });
    }
  }

  /* ============================
     Booking flow
     ============================ */

  function openBookingForDoctor(doctor: Doctor) {
    setSelectedDoctor(doctor);
    setShowBookingForm(true);
  }

  async function confirmBooking() {
    if (!selectedFamily?.uid) {
      Toast.show({ type: "error", text1: "Select a profile first" });
      return;
    }
    if (!selectedDoctor) {
      Toast.show({ type: "error", text1: "Select a doctor first" });
      return;
    }
    if (!symptomsDescription?.trim() || !symptomDuration?.trim()) {
      Toast.show({ type: "error", text1: "Please enter symptoms & duration" });
      return;
    }

    const handleBooking = async () => {
      try {
      
  const payload = {
  uid: selectedFamily.uid,
  doctorId: selectedDoctor._id,
  symptomDuration,
  symptomsDescription,
  symptomSeverity,
  patientName: patientDetails?.name || selectedFamily?.name,
  patientAge: patientDetails?.age || selectedFamily?.age,
  patientGender: patientDetails?.gender || selectedFamily?.gender,
};


      

        await axios.post(`${API_BASE}/api/appointments`, payload);

        Toast.show({ type: "success", text1: "Appointment booked" });

        // reset UI
        setShowBookingForm(false);
        setSelectedDoctor(null);
        setSymptomsDescription("");
        setSymptomDuration("");
        setSymptomSeverity("Mild");

        // expand My Appointments section
        setExpandedSections((prev) => ({ ...prev, appointments: true }));

        // refresh appointments
        fetchAppointments();
      } catch (err) {
        console.error("confirmBooking:", err);
        Toast.show({ type: "error", text1: "Failed to create appointment" });
      }
    };

    if (Platform.OS === "web") {
      Toast.show({ type: "info", text1: `Booking appointment with ${selectedDoctor.name}` });
      await handleBooking();
    } else {
      Alert.alert(
        "Confirm Booking",
        `Do you want to confirm appointment with ${selectedDoctor.name}?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Yes", style: "default", onPress: handleBooking },
        ]
      );
    }
  }

  /* ============================
     Helpers for UI logic
     ============================ */

  const selectedFamilyId = useMemo(() => selectedFamily?._id || selectedFamily?.uid || null, [selectedFamily]);

  const isJoinEnabled = (appt: Appointment) => {
    if (!appt.decision || appt.decision !== "accepted") return false;
    if (!appt.scheduledDateTime) return false;
    try {
      const scheduled = new Date(appt.scheduledDateTime as any);
      return new Date() >= scheduled;
    } catch {
      return false;
    }
  };

  function toggleSection(section: "profile" | "appointments" | "records") {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  /* ============================
     MAIN RENDER
     ============================ */

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <PatientHeader name={selectedFamily?.name} />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Family section */}
        <AIChat />
        <FamilyMembers
          familyProfiles={familyProfiles}
          selectedFamilyId={selectedFamilyId as any}
          onSelect={(profile) => setSelectedFamily(profile as any)}
          onAddPress={() => {
            setAddingNewProfile(true);
            setEditingProfile(false);
            setNewProfileDraft({ name: "", age: "", gender: "Male", email: "", phone: "", bloodGroup: "", address: "" });
          }}
        />

        {/* Profile card */}
        <HealthProfileCard
          expanded={expanded.profile}
          onToggle={() => toggleSection("profile")}
          selectedFamily={selectedFamily as any}
          editingProfile={editingProfile}
          setEditingProfile={(v) => setEditingProfile(v)}
          addingNewProfile={addingNewProfile}
          setAddingNewProfile={(v) => setAddingNewProfile(v)}
          newProfileDraft={newProfileDraft}
          setNewProfileDraft={(val) => setNewProfileDraft(val)}
          onSaveExisting={(p) => handleSaveProfile(p as any)}
          onCreateNew={(d) => handleCreateProfile(d)}
          onRefreshSelected={() => { setEditingProfile(false); if (selectedFamily?.uid) fetchPatientDetails(selectedFamily.uid); }}
        />
        <PatientLocation />
        {/* Appointments card */}
        <AppointmentsSection
          expanded={expanded.appointments}
          onToggle={() => toggleSection("appointments")}
          appointments={appointments as any}
          isJoinEnabled={isJoinEnabled}
          doctors={doctors as any}
          showBookingForm={showBookingForm}
          selectedDoctor={selectedDoctor as any}
          onOpenBooking={(d) => openBookingForDoctor(d as any)}
          patientDetails={{ name: patientDetails?.name, age: patientDetails?.age, gender: patientDetails?.gender }}
          symptomsDescription={symptomsDescription}
          setSymptomsDescription={setSymptomsDescription}
          symptomDuration={symptomDuration}
          setSymptomDuration={setSymptomDuration}
          symptomSeverity={symptomSeverity}
          setSymptomSeverity={(v) => setSymptomSeverity(v)}
          onConfirmBooking={confirmBooking}
          onCancelBooking={() => { setShowBookingForm(false); setSelectedDoctor(null); }}
          onNavigateToVideo={(videoLink) => router.push({ pathname: "/(screens)/videoCallScreen" as any, params: { videoLink } as any } as any)}
        />

        {/* insert prescriptions tab directly below Appointments */}
        <PrescriptionsList patientUid="68c817a736d9cf859ee67c62" />


        {/* Health Tips */}
        <HealthTipsCard />

        <SOSButton />

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Toast />
    </View>
  );
}

/* ============================
   Styles
   ============================ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FBFF" },
  header: { paddingTop: Platform.OS === "ios" ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flex: 1 },
  welcomeText: { color: "#E3F2FD", fontSize: 14, fontWeight: "400" },
  nameText: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 4 },
  headerRight: { flexDirection: "row", alignItems: "center" },
  headerIcon: { marginRight: 16, position: "relative" },
  notificationBadge: { position: "absolute", top: -6, right: -6, backgroundColor: "#F44336", borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center" },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  profilePic: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#fff" },
  scrollContainer: { flex: 1, paddingHorizontal: 20, marginTop: 12 },

  familySection: { marginTop: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 12 },
  familyCard: { backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginRight: 12, alignItems: "center", minWidth: 80, borderWidth: 2, borderColor: "#E3F2FD" },
  familyCardActive: { backgroundColor: "#1565C0", borderColor: "#1565C0" },
  familyText: { marginTop: 8, fontSize: 12, fontWeight: "600", color: "#1565C0" },
  familyTextActive: { color: "#fff" },
  addFamilyCard: { borderStyle: "dashed", borderColor: "#1565C0", borderWidth: 2, backgroundColor: "#F0F6FF" },

  card: { backgroundColor: "#fff", borderRadius: 16, marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center" },
  cardHeaderRight: { flexDirection: "row", alignItems: "center", marginLeft: "auto" },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginLeft: 12 },
  expandedContent: { padding: 20, paddingTop: 0 },

  input: { borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14, backgroundColor: "#F9F9F9" },
  inputRow: { marginBottom: 16 },
  inputLabel: { fontSize: 14, color: "#666", marginBottom: 4 },
  inputValue: { fontSize: 16, fontWeight: "600", color: "#333" },

  saveButton: { backgroundColor: "#1565C0", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  cancelButton: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  cancelButtonText: { color: "#333", fontWeight: "600" },

  genderBtn: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#DDD", marginHorizontal: 6, flex: 1, alignItems: "center" },
  genderBtnSelected: { borderColor: "#1565C0", backgroundColor: "#E3F2FD" },
  genderBtnText: { fontWeight: "600", color: "#333" },
  genderBtnTextSelected: { color: "#1565C0" },

  doctorCard: { backgroundColor: "#F8FBFF", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E3F2FD" },
  doctorHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  doctorInfo: { marginLeft: 12, flex: 1 },
  doctorName: { fontSize: 16, fontWeight: "600", color: "#333" },
  doctorSpec: { fontSize: 14, color: "#666", marginTop: 2 },
  bookButton: { backgroundColor: "#1565C0", paddingVertical: 10, borderRadius: 8, alignItems: "center", marginTop: 10 },
  bookButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  formSection: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginVertical: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },

  tipsContainer: { padding: 20, paddingTop: 0 },
  tipItem: { backgroundColor: "#F8FBFF", padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: "#1565C0" },
  tipText: { fontSize: 14, color: "#333", lineHeight: 20 },

  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#1565C0" },

  appointmentItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  appointmentLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  appointmentDetails: { marginLeft: 12, flex: 1 },
  appointmentDoctor: { fontSize: 16, fontWeight: "600", color: "#333" },
  appointmentType: { fontSize: 14, color: "#666", marginTop: 2 },
  appointmentDate: { fontSize: 12, color: "#999", marginTop: 2 },
  appointmentInfo: { fontSize: 14, color: "#666", marginBottom: 8 },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "600", color: "#4CAF50" },

  videoCallButton: { backgroundColor: "#4CAF50", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 8, marginTop: 12 },
  videoCallText: { color: "#fff", fontWeight: "600", marginLeft: 8 },

  sosButton: { marginVertical: 20, borderRadius: 16, elevation: 4, shadowColor: "#F44336", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  sosGradient: { padding: 24, borderRadius: 16, alignItems: "center" },
  sosText: { color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 8 },
  sosSubtext: { color: "#FFE0E0", fontSize: 14, marginTop: 4 },

  bottomSpacing: { height: 20 },
});
