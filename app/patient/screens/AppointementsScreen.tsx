// /patient/screens/appointments.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");
const API_BASE = "https://7300c4c894de.ngrok-free.app";

// Types
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

type PatientProfile = {
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

export default function AppointmentsScreen() {
  const router = useRouter();
  
  // State management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"appointments" | "doctors">("appointments");
  
  // Booking form state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [symptomsDescription, setSymptomsDescription] = useState("");
  const [symptomDuration, setSymptomDuration] = useState("");
  const [symptomSeverity, setSymptomSeverity] = useState<"Mild" | "Moderate" | "Severe">("Mild");

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const patientUid = await AsyncStorage.getItem("PatientUid");
      const patientId = await AsyncStorage.getItem("patientId");
      
      if (!patientUid) {
        Alert.alert("Error", "Patient information not found. Please login again.");
        router.back();
        return;
      }

      await Promise.all([
        fetchPatientProfile(patientUid),
        fetchAppointments(patientUid),
        fetchDoctors(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load appointments data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientProfile = async (uid: string) => {
    try {
      const response = await axios.get(`${API_BASE}/api/patients/profile/${uid}`);
      setPatientProfile(response.data);
    } catch (error) {
      console.error("Error fetching patient profile:", error);
    }
  };

  const fetchAppointments = async (uid: string) => {
    try {
      const response = await axios.get(`${API_BASE}/api/appointments/patient/${uid}`);
      setAppointments(response.data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/doctors`);
      setDoctors(response.data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
    }
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    if (!patientProfile?.uid || !selectedDoctor) {
      Toast.show({ type: "error", text1: "Missing required information" });
      return;
    }
    
    if (!symptomsDescription.trim() || !symptomDuration.trim()) {
      Toast.show({ type: "error", text1: "Please fill in all required fields" });
      return;
    }

    try {
      setBookingLoading(true);
      
      const payload = {
        uid: patientProfile.uid,
        doctorId: selectedDoctor._id,
        symptomDuration,
        symptomsDescription,
        symptomSeverity,
        patientName: patientProfile.name,
        patientAge: patientProfile.age,
        patientGender: patientProfile.gender,
      };

      await axios.post(`${API_BASE}/api/appointments`, payload);
      
      Toast.show({ type: "success", text1: "Appointment booked successfully" });
      
      // Reset form and close modal
      setShowBookingModal(false);
      setSelectedDoctor(null);
      setSymptomsDescription("");
      setSymptomDuration("");
      setSymptomSeverity("Mild");
      
      // Refresh appointments
      if (patientProfile?.uid) {
        await fetchAppointments(patientProfile.uid);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      Toast.show({ type: "error", text1: "Failed to book appointment" });
    } finally {
      setBookingLoading(false);
    }
  };

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

  const handleJoinVideo = (videoLink: string) => {
    if (videoLink) {
      router.push({ 
        pathname: "/(screens)/videoCallScreen" as any, 
        params: { videoLink } as any 
      } as any);
    } else {
      Alert.alert("No Video Link", "Video link not available for this appointment");
    }
  };

  const renderAppointmentCard = ({ item: appointment }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.cardContent}>
        <View style={styles.appointmentHeader}>
          <View style={styles.doctorInfo}>
            <View style={styles.doctorAvatar}>
              <Ionicons name="medical-outline" size={20} color="white" />
            </View>
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>
                Dr. {(appointment.doctorId as any)?.name || "Unknown"}
              </Text>
              <Text style={styles.specialization}>
                {(appointment.doctorId as any)?.specialization || "General"}
              </Text>
            </View>
          </View>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor: appointment.decision === "accepted" ? "#22C55E" :
                             appointment.decision === "pending" ? "#F59E0B" :
                             "#EF4444"
            }
          ]}>
            <Text style={styles.statusText}>
              {appointment.decision === "accepted" ? "Confirmed" :
               appointment.decision === "pending" ? "Pending" : "Declined"}
            </Text>
          </View>
        </View>
        
        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#1E3A8A" />
            <Text style={styles.detailText}>
              {appointment.requestedDate || "Not scheduled"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#1E3A8A" />
            <Text style={styles.detailText}>
              {appointment.requestedTime || "Not scheduled"}
            </Text>
          </View>
          {appointment.symptomsDescription && (
            <View style={styles.symptomsRow}>
              <Ionicons name="medical-outline" size={16} color="rgba(30, 58, 138, 0.6)" />
              <Text style={styles.symptomsText}>
                {appointment.symptomsDescription}
              </Text>
            </View>
          )}
        </View>

        {appointment.decision === "accepted" && isJoinEnabled(appointment) && (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => handleJoinVideo(appointment.videoLink || "")}
          >
            <Ionicons name="videocam" size={16} color="white" />
            <Text style={styles.joinButtonText}>Join Consultation</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderDoctorCard = ({ item: doctor }: { item: Doctor }) => (
    <View style={styles.doctorCard}>
      <View style={styles.cardContent}>
        <View style={styles.doctorCardHeader}>
          <View style={styles.doctorAvatar}>
            <Ionicons name="person" size={24} color="white" />
          </View>
          <View style={styles.doctorCardDetails}>
            <Text style={styles.doctorNameText}>Dr. {doctor.name}</Text>
            <Text style={styles.doctorSpecText}>{doctor.specialization}</Text>
            {doctor.experience && (
              <Text style={styles.doctorExpText}>{doctor.experience}</Text>
            )}
            {doctor.rating && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{doctor.rating}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => handleBookAppointment(doctor)}
          >
            <Ionicons name="add" size={16} color="white" />
            <Text style={styles.bookButtonText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#1E3A8A', '#3B82F6', '#60A5FA']} style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1E3A8A', '#3B82F6', '#60A5FA']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="calendar-outline" size={28} color="white" />
          </View>
          <Text style={styles.headerTitle}>My Appointments</Text>
          <Text style={styles.headerSubtitle}>Manage your healthcare visits</Text>
        </View>
        
        <TouchableOpacity style={styles.refreshButton} onPress={loadInitialData}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {appointments.filter(a => a.status === "booked").length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {appointments.filter(a => a.decision === "accepted").length}
          </Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{doctors.length}</Text>
          <Text style={styles.statLabel}>Doctors</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "appointments" && styles.activeTab]}
          onPress={() => setActiveTab("appointments")}
        >
          <Text style={[styles.tabText, activeTab === "appointments" && styles.activeTabText]}>
            My Appointments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "doctors" && styles.activeTab]}
          onPress={() => setActiveTab("doctors")}
        >
          <Text style={[styles.tabText, activeTab === "doctors" && styles.activeTabText]}>
            Book New
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "appointments" ? (
          <FlatList
            data={appointments.filter(a => a.status === "booked")}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={renderAppointmentCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="calendar-outline" size={48} color="rgba(255,255,255,0.6)" />
                </View>
                <Text style={styles.emptyTitle}>No Active Appointments</Text>
                <Text style={styles.emptyText}>Book a new appointment with our doctors</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => setActiveTab("doctors")}
                >
                  <Text style={styles.emptyButtonText}>Find Doctors</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : (
          <FlatList
            data={doctors}
            keyExtractor={(item) => item._id}
            renderItem={renderDoctorCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="medical-outline" size={48} color="rgba(255,255,255,0.6)" />
                </View>
                <Text style={styles.emptyTitle}>No Doctors Available</Text>
                <Text style={styles.emptyText}>Please try again later</Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowBookingModal(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Book with Dr. {selectedDoctor?.name}
            </Text>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Describe your symptoms *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Please describe your symptoms in detail..."
                value={symptomsDescription}
                onChangeText={setSymptomsDescription}
                multiline
                numberOfLines={4}
                placeholderTextColor="rgba(30, 58, 138, 0.4)"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Duration *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2 days, 1 week, 3 months"
                value={symptomDuration}
                onChangeText={setSymptomDuration}
                placeholderTextColor="rgba(30, 58, 138, 0.4)"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Severity</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={symptomSeverity}
                  onValueChange={(itemValue) => setSymptomSeverity(itemValue as any)}
                  style={styles.picker}
                >
                  <Picker.Item label="Mild" value="Mild" />
                  <Picker.Item label="Moderate" value="Moderate" />
                  <Picker.Item label="Severe" value="Severe" />
                </Picker>
              </View>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={confirmBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Modal>

      <Toast />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  loadingContainer: { alignItems: "center" },
  loadingText: { color: "white", marginTop: 16, fontSize: 16 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  headerCenter: { alignItems: "center", flex: 1 },
  headerIconContainer: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center", marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "white", marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  refreshButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  statsCard: {
    flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 20, marginBottom: 20, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 4 },
  statLabel: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 20 },
  tabContainer: {
    flexDirection: "row", backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 20, borderRadius: 12, padding: 4, marginBottom: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "rgba(255,255,255,0.9)" },
  tabText: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  activeTabText: { color: "#1E3A8A" },
  content: { flex: 1, paddingHorizontal: 20 },
  listContainer: { paddingBottom: 20 },
  appointmentCard: {
    marginBottom: 16, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  cardContent: { backgroundColor: "rgba(255,255,255,0.95)", margin: 1, borderRadius: 15, padding: 16 },
  appointmentHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  doctorInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  doctorAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#1E3A8A",
    alignItems: "center", justifyContent: "center", marginRight: 12
  },
  doctorDetails: { flex: 1 },
  doctorName: { fontSize: 16, fontWeight: "600", color: "#1E3A8A", marginBottom: 2 },
  specialization: { fontSize: 14, color: "rgba(30, 58, 138, 0.7)" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: 12, fontWeight: "600", color: "white" },
  appointmentDetails: { marginBottom: 16 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailText: { fontSize: 14, color: "#374151", marginLeft: 8 },
  symptomsRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 8 },
  symptomsText: { fontSize: 13, color: "rgba(30, 58, 138, 0.8)", fontStyle: "italic", marginLeft: 8, flex: 1 },
  joinButton: {
    backgroundColor: "#22C55E", flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 12, borderRadius: 8, gap: 8
  },
  joinButtonText: { color: "white", fontWeight: "600", fontSize: 14 },
  doctorCard: {
    marginBottom: 16, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  doctorCardHeader: { flexDirection: "row", alignItems: "center" },
  doctorCardDetails: { flex: 1, marginLeft: 12 },
  doctorNameText: { fontSize: 16, fontWeight: "600", color: "#1E3A8A", marginBottom: 4 },
  doctorSpecText: { fontSize: 14, color: "rgba(30, 58, 138, 0.7)", marginBottom: 2 },
  doctorExpText: { fontSize: 12, color: "rgba(30, 58, 138, 0.6)" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { fontSize: 12, color: "#F59E0B", marginLeft: 4, fontWeight: "600" },
  bookButton: {
    backgroundColor: "#1E3A8A", flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, gap: 4
  },
  bookButtonText: { color: "white", fontWeight: "600", fontSize: 14 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyIconContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "white", marginBottom: 8 },
  emptyText: { fontSize: 14, color: "rgba(255,255,255,0.8)", textAlign: "center", marginBottom: 20 },
  emptyButton: {
    backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)"
  },
  emptyButtonText: { color: "white", fontWeight: "600", fontSize: 14 },
  
  // Modal styles
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row", alignItems: "center", paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20
  },
  closeButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginRight: 16
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "white", flex: 1 },
  modalContent: { flex: 1, backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  formSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(30, 58, 138, 0.1)" },
  formLabel: { fontSize: 16, fontWeight: "600", color: "#1E3A8A", marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: "rgba(30, 58, 138, 0.2)", borderRadius: 12,
    padding: 14, fontSize: 16, backgroundColor: "white", color: "#1E3A8A"
  },
  textArea: {
    borderWidth: 1, borderColor: "rgba(30, 58, 138, 0.2)", borderRadius: 12,
    padding: 14, fontSize: 16, backgroundColor: "white", minHeight: 100,
    textAlignVertical: "top", color: "#1E3A8A"
  },
  pickerContainer: {
    borderWidth: 1, borderColor: "rgba(30, 58, 138, 0.2)", borderRadius: 12, backgroundColor: "white"
  },
  picker: { height: 50 },
  formActions: { padding: 20, gap: 12 },
  confirmButton: {
    backgroundColor: "#1E3A8A", paddingVertical: 16, borderRadius: 12,
    alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8
  },
  confirmButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  cancelButton: {
    backgroundColor: "rgba(30, 58, 138, 0.1)", borderWidth: 1, borderColor: "rgba(30, 58, 138, 0.2)",
    paddingVertical: 16, borderRadius: 12, alignItems: "center"
  },
  cancelButtonText: { color: "#1E3A8A", fontSize: 16, fontWeight: "600" },
});