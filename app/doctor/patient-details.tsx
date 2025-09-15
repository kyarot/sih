import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import PrescriptionForm from "./PrescriptionForm";

const PatientDetailsScreen = () => {
  const pastAppointments = [
    { id: 1, date: "2025-08-12", type: "Consultation", notes: "Diabetes checkup" },
    { id: 2, date: "2025-07-05", type: "Follow-up", notes: "Blood test review" },
    { id: 3, date: "2025-05-22", type: "Consultation", notes: "Diet counseling" },
  ];
    const [showPrescription, setShowPrescription] = useState(false);
  

  return (
    <ScrollView style={styles.container}>
      {/* Patient Profile */}
      <View style={styles.profileCard}>
        <Ionicons name="person-circle" size={80} color="#2563eb" />
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.detail}>Age: 45 | Male</Text>
          <Text style={styles.detail}>Condition: Diabetes</Text>
        </View>
      </View>

      {/* Medical History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🩺 Medical History</Text>
        <Text>- Allergic to penicillin</Text>
        <Text>- Hypertension (since 2018)</Text>
        <Text>- Medication: Metformin, Amlodipine</Text>
      </View>

      {/* Past Appointments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Past Appointments</Text>
        {pastAppointments.map((appt) => (
          <View key={appt.id} style={styles.appointmentCard}>
            <Text style={styles.appointmentDate}>{appt.date}</Text>
            <Text>{appt.type}</Text>
            <Text style={styles.notes}>Notes: {appt.notes}</Text>
          </View>
        ))}
      </View>

      {/* Reports/Documents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📂 Uploaded Reports</Text>
        <TouchableOpacity style={styles.reportCard}>
          <MaterialIcons name="description" size={24} color="#007bff" />
          <Text style={{ marginLeft: 10 }}>Blood Report - July 2025</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportCard}>
          <MaterialIcons name="description" size={24} color="#007bff" />
          <Text style={{ marginLeft: 10 }}>Prescription - May 2025</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="calendar" size={20} color="white" />
          <Text style={styles.actionText}> Schedule Follow-up</Text>
        </TouchableOpacity>

       <TouchableOpacity
    style={styles.actionBtn}
    onPress={() => setShowPrescription(true)}
  >
    <FontAwesome name="file-text" size={20} color="white" />
    <Text style={styles.actionText}> Write Prescription</Text>
  </TouchableOpacity>

  {/* Inline scrollable Prescription Form */}
  {showPrescription && (
    <ScrollView style={{ maxHeight: 300, marginTop: 10 }}>
      <PrescriptionForm onClose={() => setShowPrescription(false)} doctorId={"64f1c2b9e5c2a3d123456789"} patientId={"64f1c2b9e5c2a3d987654321"} />
    </ScrollView>
  )}
      </View>
    </ScrollView>
  );
};

export default PatientDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 15 },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  name: { fontSize: 20, fontWeight: "bold" },
  detail: { color: "gray" },

  section: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },

  appointmentCard: {
    backgroundColor: "#f1f5ff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  appointmentDate: { fontWeight: "bold" },
  notes: { fontStyle: "italic", color: "gray" },

  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef6ff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  actionText: { color: "white", fontWeight: "bold" },
});