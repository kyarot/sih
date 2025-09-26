// app/doctor/patient-details.tsx

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Appointment = {
  _id?: string;
  patientId?: any;
  patientName?: string;
  patientAge?: number | string;
  patientGender?: string;
  symptomsDescription?: string;
  symptomDuration?: string;
  symptomSeverity?: string;
  requestedDate?: string;
  requestedTime?: string;
  decision?: "pending" | "accepted" | "later" | "declined" | "completed" | "missed" | string;
  scheduledDateTime?: string | Date | null;
  videoLink?: string;
  reason?: string;
};

type PatientGroup = {
  patientId: string;
  name: string;
  age: string | number;
  gender: string;
  consultations: Appointment[];
};

const PatientDetailsScreen: React.FC = () => {
  const [patients, setPatients] = useState<PatientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchPatients = async () => {
    const storedDoctorId = await AsyncStorage.getItem("doctorId");
    if (!storedDoctorId) {
      console.error("❌ Doctor ID missing. Cannot fetch patient details.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`https://7300c4c894de.ngrok-free.app/api/appointments/doctor/${storedDoctorId}`);
      const data: Appointment[] = await res.json();

      // Group appointments by patientId
      const groups: { [key: string]: PatientGroup } = {};
      data.forEach((appt) => {
        if (!appt.patientId) return;
        const id = appt.patientId._id || appt.patientId;
        if (!groups[id]) {
          groups[id] = {
            patientId: id,
            name: appt.patientName ?? appt.patientId?.name ?? "Unknown Patient",
            age: appt.patientAge ?? appt.patientId?.age ?? "-",
            gender: appt.patientGender ?? appt.patientId?.gender ?? "N/A",
            consultations: [],
          };
        }
        groups[id].consultations.push(appt);
      });

      setPatients(Object.values(groups));
    } catch (err) {
      console.error("❌ Fetch patients error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const getStatusColor = (decision: string) => {
    switch (decision) {
      case "accepted":
        return "#10b981";
      case "completed":
        return "#1E40AF";
      case "declined":
        return "#ef4444";
      case "missed":
        return "#f59e0b";
      default:
        return "#64748b";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Patient Details</Text>
          <Text style={styles.headerSubtitle}>
            View consultation history for each patient
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E40AF" />
            <Text style={styles.loadingText}>Loading patients...</Text>
          </View>
        ) : patients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Patients</Text>
            <Text style={styles.emptyText}>
              You don’t have any patient consultations yet.
            </Text>
          </View>
        ) : (
          patients.map((patient) => {
            const isOpen = expanded === patient.patientId;
            return (
              <View key={patient.patientId} style={styles.patientCard}>
                {/* Card Header */}
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() =>
                    setExpanded(isOpen ? null : patient.patientId)
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.patientInfo}>
                    <View style={styles.avatarContainer}>
                      <Ionicons name="person" size={20} color="#1E40AF" />
                    </View>
                    <View style={styles.patientDetails}>
                      <Text style={styles.patientName}>{patient.name}</Text>
                      <Text style={styles.patientMeta}>
                        Age: {patient.age} • {patient.gender}
                      </Text>
                      <Text style={styles.patientMeta}>
                        Consultations: {patient.consultations.length}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#1E40AF"
                    style={styles.chevron}
                  />
                </TouchableOpacity>

                {/* Expanded content = consultation history */}
                {isOpen && (
                  <View style={styles.expandedContent}>
                    <View style={styles.divider} />
                    {patient.consultations.map((c, idx) => (
                      <View key={c._id || idx} style={styles.historyItem}>
                        <Text style={styles.historyTitle}>
                          Consultation {idx + 1}
                        </Text>
                        <Text style={styles.historyText}>
                          Date: {c.requestedDate ?? "-"} • Time:{" "}
                          {c.requestedTime ?? "-"}
                        </Text>
                        <Text style={styles.historyText}>
                          Symptoms: {c.symptomsDescription ?? "N/A"}
                        </Text>
                        <Text
                          style={[
                            styles.historyStatus,
                            { color: getStatusColor(c.decision || "pending") },
                          ]}
                        >
                          Status: {c.decision || "pending"}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PatientDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1E40AF" },
  headerSubtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  loadingContainer: { flex: 1, alignItems: "center", marginTop: 40 },
  loadingText: { marginTop: 8, fontSize: 14, color: "#64748b" },
  emptyContainer: { alignItems: "center", marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#1E40AF" },
  emptyText: { fontSize: 14, color: "#64748b", marginTop: 4 },
  patientCard: {
    margin: 12,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    alignItems: "center",
  },
  patientInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  patientDetails: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  patientMeta: { fontSize: 13, color: "#6b7280" },
  chevron: { marginLeft: 10 },
  expandedContent: { padding: 12 },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginBottom: 8 },
  historyItem: { marginBottom: 12 },
  historyTitle: { fontSize: 15, fontWeight: "600", color: "#1E40AF" },
  historyText: { fontSize: 13, color: "#374151", marginTop: 2 },
  historyStatus: { fontSize: 13, fontWeight: "600", marginTop: 4 },
});
