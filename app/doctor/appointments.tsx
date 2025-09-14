// appointments.tsx
// Doctor appointments screen (expand/collapse + detailed info + accept/reject)

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

const ActivityScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchAppointments = async () => {
    const storedDoctorId = await AsyncStorage.getItem("doctorId");
    if (!storedDoctorId) {
      console.error("❌ Doctor ID missing. Cannot fetch appointments.");
      setLoading(false);
      return;
    }
    setDoctorId(storedDoctorId);

    try {
      const res = await fetch(`http://localhost:5000/api/appointments/doctor/${storedDoctorId}`);
      const data = await res.json();
      console.log("✅ Appointments:", data);
      setAppointments(data || []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const refresh = async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/doctor/${doctorId}`);
      const data = await res.json();
      setAppointments(data || []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id: string, decision: "accepted" | "declined" | "later") => {
    try {
      let scheduledDateTime: Date | null = null;

      if (decision === "accepted") {
        if (Platform.OS === "web") {
          const input = window.prompt("Enter scheduled date & time (e.g. 2025-09-14 15:30). Leave blank for +30 min.");
          if (input && input.trim()) {
            const parsed = new Date(input);
            if (!isNaN(parsed.getTime())) {
              scheduledDateTime = parsed;
            } else {
              const alt = new Date(input.replace(" ", "T"));
              scheduledDateTime = isNaN(alt.getTime()) ? null : alt;
            }
          }
          if (!scheduledDateTime) {
            scheduledDateTime = new Date(new Date().getTime() + 30 * 60000);
          }
        } else {
          scheduledDateTime = new Date(new Date().getTime() + 30 * 60000);
        }
      }

      await fetch(`http://localhost:5000/api/appointments/${id}/decision`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, scheduledDateTime }),
      });

      await refresh();

      if (decision === "accepted") {
        Platform.OS === "web"
          ? alert("Appointment accepted and scheduled.")
          : Alert.alert("Accepted", "Appointment accepted and scheduled.");
      }
    } catch (err) {
      console.error("❌ Decision error:", err);
      Platform.OS === "web"
        ? alert("Failed to update decision.")
        : Alert.alert("Error", "Failed to update decision.");
    }
  };

  const isJoinEnabled = (appt: Appointment) => {
    if (!appt.scheduledDateTime) return false;
    try {
      const scheduled = new Date(appt.scheduledDateTime as any);
      return new Date() >= scheduled;
    } catch {
      return false;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Doctor's Appointments</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : appointments.length === 0 ? (
          <Text style={styles.emptyText}>No appointments found</Text>
        ) : (
          appointments.map((appt: Appointment) => {
            const isOpen = expanded === appt._id;
            return (
              <View key={appt._id} style={styles.activityCard}>
                {/* Collapsed Header */}
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => setExpanded(isOpen ? null : appt._id!)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityText}>
                      {appt.patientName ?? appt.patientId?.name ?? "Unknown Patient"}
                    </Text>
                    <Text style={styles.activitySub}>
                      Age: {appt.patientAge ?? "-"} | Symptom: {appt.symptomsDescription ?? "-"}
                    </Text>
                  </View>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#444"
                  />
                </TouchableOpacity>

                {/* Expanded Details */}
                {isOpen && (
                  <View style={styles.expandedContent}>
                    <Text style={styles.detailText}>
                      Gender: {appt.patientGender ?? "-"}
                    </Text>
                    <Text style={styles.detailText}>
                      Symptom Severity: {appt.symptomSeverity ?? "-"}
                    </Text>
                    <Text style={styles.detailText}>
                      Duration: {appt.symptomDuration ?? "-"}
                    </Text>
                    <Text style={styles.detailText}>
                      Requested: {appt.requestedDate ?? "-"} at {appt.requestedTime ?? "-"}
                    </Text>

                    {appt.decision === "accepted" && appt.scheduledDateTime && (
                      <Text style={styles.detailText}>
                        Scheduled: {new Date(appt.scheduledDateTime as any).toLocaleString()}
                      </Text>
                    )}

                    {appt.decision === "pending" ? (
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={[styles.decisionBtn, { backgroundColor: "#22c55e" }]}
                          onPress={() => handleDecision(appt._id!, "accepted")}
                        >
                          <Text style={styles.btnText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.decisionBtn, { backgroundColor: "#ef4444" }]}
                          onPress={() => handleDecision(appt._id!, "declined")}
                        >
                          <Text style={styles.btnText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    ) : appt.decision === "accepted" ? (
                      <View style={{ alignItems: "center", marginTop: 10 }}>
                        <TouchableOpacity
                          style={[
                            styles.joinBtn,
                            { backgroundColor: isJoinEnabled(appt) ? "#2563eb" : "gray" },
                          ]}
                          disabled={!isJoinEnabled(appt)}
                          onPress={() => {
                            if (appt.videoLink) {
                              Linking.openURL(appt.videoLink);
                            } else {
                              Alert.alert("No link", "No video link is available for this appointment.");
                            }
                          }}
                        >
                          <Text style={styles.btnText}>Join Now</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={{ color: "gray", marginTop: 6 }}>
                        Decision: {appt.decision}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 15 },
  section: { backgroundColor: "white", padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  activityCard: { backgroundColor: "#f1f5ff", borderRadius: 10, marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", padding: 12 },
  activityText: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  activitySub: { fontSize: 13, color: "gray" },
  expandedContent: { paddingHorizontal: 12, paddingBottom: 12 },
  detailText: { fontSize: 13, marginTop: 4, color: "#333" },
  emptyText: { textAlign: "center", color: "gray", marginTop: 10 },
  actionsRow: { flexDirection: "row", marginTop: 10 },
  decisionBtn: { flex: 1, padding: 10, borderRadius: 8, marginHorizontal: 4, alignItems: "center" },
  joinBtn: { marginTop: 8, padding: 10, borderRadius: 8, alignItems: "center", width: "100%" },
  btnText: { color: "white", fontWeight: "bold" },
});
