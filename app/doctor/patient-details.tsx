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
import { SafeAreaView } from "react-native-safe-area-context";

const PatientDetailsScreen = () => {
  const pastAppointments = [
    { id: 1, date: "2025-08-12", type: "Consultation", notes: "Diabetes checkup" },
    { id: 2, date: "2025-07-05", type: "Follow-up", notes: "Blood test review" },
    { id: 3, date: "2025-05-22", type: "Consultation", notes: "Diet counseling" },
  ];
  const [showPrescription, setShowPrescription] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Patient Details</Text>
        <Text style={styles.headerSubtitle}>Complete medical overview</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#1E40AF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.patientName}>John Doe</Text>
            <View style={styles.profileDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={14} color="#64748B" />
                <Text style={styles.detailText}>45 years old</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="male" size={14} color="#64748B" />
                <Text style={styles.detailText}>Male</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="medical-outline" size={14} color="#64748B" />
                <Text style={styles.detailText}>Diabetes</Text>
              </View>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>

        {/* Medical History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={20} color="#1E40AF" />
            <Text style={styles.sectionTitle}>Medical History</Text>
          </View>
          <View style={styles.medicalList}>
            <View style={styles.medicalItem}>
              <View style={styles.alertDot} />
              <Text style={styles.medicalText}>Allergic to penicillin</Text>
            </View>
            <View style={styles.medicalItem}>
              <View style={styles.conditionDot} />
              <Text style={styles.medicalText}>Hypertension (since 2018)</Text>
            </View>
            <View style={styles.medicalItem}>
              <View style={styles.medicationDot} />
              <Text style={styles.medicalText}>
                Medication: Metformin, Amlodipine
              </Text>
            </View>
          </View>
        </View>

        {/* Past Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color="#1E40AF" />
            <Text style={styles.sectionTitle}>Past Appointments</Text>
          </View>
          {pastAppointments.map((appt) => (
            <View key={appt.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentDate}>
                  <Text style={styles.dateText}>{appt.date}</Text>
                </View>
                <View style={styles.appointmentType}>
                  <Text style={styles.typeText}>{appt.type}</Text>
                </View>
              </View>
              <Text style={styles.appointmentNotes}>{appt.notes}</Text>
            </View>
          ))}
        </View>

        {/* Reports/Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color="#1E40AF" />
            <Text style={styles.sectionTitle}>Uploaded Reports</Text>
          </View>
          <TouchableOpacity style={styles.reportCard}>
            <View style={styles.reportIcon}>
              <MaterialIcons name="description" size={20} color="#1E40AF" />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>Blood Report</Text>
              <Text style={styles.reportDate}>July 2025</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.reportCard}>
            <View style={styles.reportIcon}>
              <MaterialIcons name="description" size={20} color="#1E40AF" />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>Prescription</Text>
              <Text style={styles.reportDate}>May 2025</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={20} color="#1E40AF" />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryActionBtn}>
              <Ionicons name="calendar-outline" size={20} color="white" />
              <Text style={styles.primaryActionText}>Schedule Follow-up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionBtn}
              onPress={() => setShowPrescription(true)}
            >
              <FontAwesome name="file-text-o" size={18} color="#1E40AF" />
              <Text style={styles.secondaryActionText}>
                Write Prescription
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Prescription Form Modal */}
        {showPrescription && (
          <View style={styles.prescriptionContainer}>
            <PrescriptionForm
              onClose={() => setShowPrescription(false)}
              doctorId={"64f1c2b9e5c2a3d123456789"}
              patientId={"64f1c2b9e5c2a3d987654321"}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  
  );
};

export default PatientDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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

  // Profile Card
  profileCard: {
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
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 8,
  },
  profileDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#64748B",
  },
  statusBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E40AF",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
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

  // Medical History
  medicalList: {
    gap: 12,
  },
  medicalItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginTop: 6,
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F59E0B",
    marginTop: 6,
  },
  medicationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginTop: 6,
  },
  medicalText: {
    fontSize: 14,
    color: "#475569",
    flex: 1,
    lineHeight: 20,
  },

  // Appointments
  appointmentCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#1E40AF",
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  appointmentDate: {
    backgroundColor: "#1E40AF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  appointmentType: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1E40AF",
  },
  appointmentNotes: {
    fontSize: 14,
    color: "#64748B",
    fontStyle: "italic",
  },

  // Reports
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 12,
    color: "#64748B",
  },

  // Actions
  actionsSection: {
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
  actionButtons: {
    gap: 12,
  },
  primaryActionBtn: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryActionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryActionBtn: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#1E40AF",
    gap: 8,
  },
  secondaryActionText: {
    color: "#1E40AF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Prescription Container
  prescriptionContainer: {
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
});
