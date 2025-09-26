// appointments.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Linking } from "react-native";

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import PrescriptionForm from "./PrescriptionForm";

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

  // Scheduling
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pendingDecisionId, setPendingDecisionId] = useState<string | null>(null);

  const [showPrescriptionFor, setShowPrescriptionFor] = useState<string | null>(null);

  const fetchAppointments = async () => {
    const storedDoctorId = await AsyncStorage.getItem("doctorId");
    if (!storedDoctorId) {
      console.error("Doctor ID missing. Cannot fetch appointments.");
      setLoading(false);
      return;
    }
    setDoctorId(storedDoctorId);

    try {
      const res = await fetch(`http://localhost:5000/api/appointments/doctor/${storedDoctorId}`);
      const data = await res.json();
      setAppointments(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
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
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id: string, decision: "accepted" | "declined" | "later") => {
    try {
      if (decision === "accepted") {
        setPendingDecisionId(id);
        setShowDatePicker(true);
        return;
      }

      // For declined/later decisions
      await fetch(`http://localhost:5000/api/appointments/${id}/decision`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, scheduledDateTime: null }),
      });
      await refresh();
      Alert.alert("Updated", `Appointment ${decision}`);
    } catch (err) {
      console.error("Decision error:", err);
      Alert.alert("Error", "Failed to update decision.");
    }
  };

  const isJoinEnabled = (appt: Appointment) => {
    if (!appt.scheduledDateTime) return false;
    try {
      const scheduled = new Date(appt.scheduledDateTime as any);
      const now = new Date();
      const fiveMinsBefore = new Date(scheduled.getTime() - 5 * 60000);
      const fiveMinsAfter = new Date(scheduled.getTime() + 5 * 60000);
      return now >= fiveMinsBefore && now <= fiveMinsAfter;
    } catch {
      return false;
    }
  };

  const isPrescriptionEnabled = (appt: Appointment) => {
    if (!appt.scheduledDateTime) return false;
    try {
      const scheduled = new Date(appt.scheduledDateTime as any);
      const now = new Date();
      const fiveMinsAfter = new Date(scheduled.getTime() + 5 * 60000);
      return now > fiveMinsAfter;
    } catch {
      return false;
    }
  };

  const getStatusColor = (decision: string) => {
    switch (decision) {
      case "pending":
        return "#1E40AF";
      case "accepted":
        return "#10b981";
      case "declined":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const getStatusIcon = (decision: string) => {
    switch (decision) {
      case "pending":
        return "time-outline";
      case "accepted":
        return "checkmark-circle-outline";
      case "declined":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Appointments</Text>
          <Text style={styles.headerSubtitle}>Manage your patient consultations</Text>
        </View>

        <View style={styles.section}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1E40AF" />
              <Text style={styles.loadingText}>Loading appointments...</Text>
            </View>
          ) : appointments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No Appointments</Text>
              <Text style={styles.emptyText}>You don't have any appointments scheduled yet.</Text>
            </View>
          ) : (
            appointments.map((appt: Appointment) => {
              const isOpen = expanded === appt._id;
              return (
                <View key={appt._id} style={styles.appointmentCard}>
                  {/* Card Header */}
                  <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => setExpanded(isOpen ? null : appt._id!)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.patientInfo}>
                      <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={20} color="#1E40AF" />
                      </View>
                      <View style={styles.patientDetails}>
                        <Text style={styles.patientName}>
                          {appt.patientName ?? appt.patientId?.name ?? "Unknown Patient"}
                        </Text>
                        <Text style={styles.patientMeta}>
                          Age: {appt.patientAge ?? "-"} • {appt.patientGender ?? "N/A"}
                        </Text>
                        <Text style={styles.symptomPreview}>
                          {appt.symptomsDescription ?? "No symptoms described"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.headerRight}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appt.decision || "pending") + "15" }]}>
                        <Ionicons
                          name={getStatusIcon(appt.decision || "pending")}
                          size={12}
                          color={getStatusColor(appt.decision || "pending")}
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(appt.decision || "pending") }]}>
                          {appt.decision || "pending"}
                        </Text>
                      </View>
                      <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#1E40AF" style={styles.chevron} />
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Details */}
                  {isOpen && (
                    <View style={styles.expandedContent}>
                      <View style={styles.divider} />

                      {/* Actions */}
                      <View style={styles.actionsContainer}>
                        {appt.decision === "pending" ? (
                          <View style={styles.pendingActions}>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.acceptButton]}
                              onPress={() => handleDecision(appt._id!, "accepted")}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="checkmark" size={18} color="white" />
                              <Text style={styles.actionButtonText}>Accept</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.actionButton, styles.rejectButton]}
                              onPress={() => handleDecision(appt._id!, "declined")}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="close" size={18} color="white" />
                              <Text style={styles.actionButtonText}>Reject</Text>
                            </TouchableOpacity>
                          </View>
                        ) : appt.decision === "accepted" ? (
                         <View style={styles.meetingActions}>
  {!isPrescriptionEnabled(appt) && (
<TouchableOpacity
  style={[
    styles.meetingButton,
    isJoinEnabled(appt) ? styles.joinMeetingButton : styles.disabledMeetingButton,
  ]}
  disabled={!isJoinEnabled(appt)}
  onPress={() => {
    if (appt.videoLink) {
      Linking.openURL(appt.videoLink).catch(() =>
        Alert.alert("Error", "Unable to open meeting link.")
      );
    } else {
      Alert.alert("No Link", "Meeting link not available.");
    }
  }}
>
  <Ionicons name="videocam" size={20} color="white" />
  <Text style={styles.meetingButtonText}>Join MEET</Text>
</TouchableOpacity>

  )}
  {isPrescriptionEnabled(appt) && (
    <TouchableOpacity
      style={[styles.meetingButton, styles.joinMeetingButton]}
      onPress={() => setShowPrescriptionFor(appt._id!)}
      activeOpacity={0.8}
    >
      <Ionicons name="document-text" size={20} color="white" />
      <Text style={styles.meetingButtonText}>Write Prescription</Text>
    </TouchableOpacity>
  )}
</View>

                        ) : null}

                        {showPrescriptionFor === appt._id && doctorId && appt.patientId && (
                          <PrescriptionForm
                            onClose={() => setShowPrescriptionFor(null)}
                            doctorId={doctorId}
                            patientId={typeof appt.patientId === "object" ? appt.patientId._id : appt.patientId}
                          />
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={scheduleDate}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) {
              setScheduleDate(date);
              setShowTimePicker(true);
            } else {
              setPendingDecisionId(null);
            }
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={scheduleDate}
          mode="time"
          display="default"
          onChange={async (_, date) => {
            setShowTimePicker(false);
            if (date && pendingDecisionId) {
              const finalDate = new Date(
                scheduleDate.getFullYear(),
                scheduleDate.getMonth(),
                scheduleDate.getDate(),
                date.getHours(),
                date.getMinutes()
              );
              try {
                await fetch(`http://localhost:5000/api/appointments/${pendingDecisionId}/decision`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ decision: "accepted", scheduledDateTime: finalDate }),
                });
                await refresh();
                Alert.alert("Scheduled", `Meeting set for ${finalDate.toLocaleString()}`);
              } catch (err) {
                console.error(err);
                Alert.alert("Error", "Failed to schedule appointment.");
              } finally {
                setPendingDecisionId(null);
              }
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};




export default ActivityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "400",
  },

  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    backgroundColor: "white",
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    backgroundColor: "white",
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E40AF",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 250,
  },

  appointmentCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },

  patientInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  patientDetails: {
    flex: 1,
  },

  patientName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },

  patientMeta: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },

  symptomPreview: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "500",
  },

  headerRight: {
    alignItems: "flex-end",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    textTransform: "capitalize",
  },

  chevron: {
    opacity: 0.8,
  },

  expandedContent: {
    paddingBottom: 20,
  },

  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginHorizontal: 20,
    marginBottom: 20,
  },

  detailsGrid: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flex: 0.5,
    minWidth: "48%",
  },

  fullWidth: {
    flex: 1,
    minWidth: "100%",
  },

  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },

  actionsContainer: {
    paddingHorizontal: 20,
  },

  pendingActions: {
    flexDirection: "row",
    gap: 12,
  },

  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  acceptButton: {
    backgroundColor: "#10b981",
  },

  rejectButton: {
    backgroundColor: "#ef4444",
  },

  actionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 6,
  },

  meetingActions: {
    alignItems: "center",
  },

  meetingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 180,
  },

  startMeetingButton: {
    backgroundColor: "#10b981",
  },

  joinMeetingButton: {
    backgroundColor: "#1E40AF",
  },

  disabledMeetingButton: {
    backgroundColor: "#94a3b8",
  },

  meetingButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },

  statusContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },

  statusMessage: {
    fontSize: 15,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
