// appointments.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Linking } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

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
  Modal,
  
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import PrescriptionForm from "./components/PrescriptionForm";

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
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [pendingDecisionId, setPendingDecisionId] = useState<string | null>(null);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

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
      const res = await fetch(`https://7300c4c894de.ngrok-free.app/api/appointments/doctor/${storedDoctorId}`);
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
      const res = await fetch(`https://7300c4c894de.ngrok-free.app/api/appointments/doctor/${doctorId}`);
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
        setPickerMode('date');
        setScheduleDate(new Date());
        setShowDateModal(true);
        return;
      }

      // For declined/later decisions
      await fetch(`https://7300c4c894de.ngrok-free.app/api/appointments/${id}/decision`, {
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

  const handleDateConfirm = () => {
    setShowDateModal(false);
    setPickerMode('time');
    setShowTimeModal(true);
  };

  const handleTimeConfirm = async () => {
    setShowTimeModal(false);
    
    if (pendingDecisionId) {
      try {
        await fetch(`https://7300c4c894de.ngrok-free.app/api/appointments/${pendingDecisionId}/decision`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision: "accepted", scheduledDateTime: scheduleDate }),
        });
        await refresh();
        Alert.alert("Scheduled", `Meeting set for ${scheduleDate.toLocaleString()}`);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to schedule appointment.");
      } finally {
        setPendingDecisionId(null);
      }
    }
  };

  const handleModalCancel = () => {
    setShowDateModal(false);
    setShowTimeModal(false);
    setPendingDecisionId(null);
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
        return "#FFB800";
      case "accepted":
        return "#00D4AA";
      case "declined":
        return "#FF6B6B";
      default:
        return "#8DA4CC";
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <LinearGradient
      colors={['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Appointments</Text>
            <Text style={styles.headerSubtitle}>Manage your patient consultations</Text>
          </View>

          <View style={styles.section}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading appointments...</Text>
              </View>
            ) : appointments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="calendar-outline" size={64} color="#FFFFFF" />
                </View>
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
                      activeOpacity={0.8}
                    >
                      <View style={styles.patientInfo}>
                        <View style={styles.avatarContainer}>
                          <LinearGradient
                            colors={['#FFFFFF', '#F0F9FF']}
                            style={styles.avatarGradient}
                          >
                            <Ionicons name="person" size={24} color="#1E40AF" />
                          </LinearGradient>
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
                        <View style={[
                          styles.statusBadge, 
                          { 
                            backgroundColor: getStatusColor(appt.decision || "pending") + "20",
                            borderColor: getStatusColor(appt.decision || "pending") + "40",
                          }
                        ]}>
                          <Ionicons
                            name={getStatusIcon(appt.decision || "pending")}
                            size={14}
                            color={getStatusColor(appt.decision || "pending")}
                          />
                          <Text style={[styles.statusText, { color: getStatusColor(appt.decision || "pending") }]}>
                            {appt.decision || "pending"}
                          </Text>
                        </View>
                        <Ionicons 
                          name={isOpen ? "chevron-up" : "chevron-down"} 
                          size={24} 
                          color="#FFFFFF" 
                          style={styles.chevron} 
                        />
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
                                <LinearGradient
                                  colors={['#00D4AA', '#00B894']}
                                  style={styles.actionGradient}
                                >
                                  <Ionicons name="checkmark" size={20} color="white" />
                                  <Text style={styles.actionButtonText}>Accept</Text>
                                </LinearGradient>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.actionButton, styles.rejectButton]}
                                onPress={() => handleDecision(appt._id!, "declined")}
                                activeOpacity={0.8}
                              >
                                <LinearGradient
                                  colors={['#FF6B6B', '#E55353']}
                                  style={styles.actionGradient}
                                >
                                  <Ionicons name="close" size={20} color="white" />
                                  <Text style={styles.actionButtonText}>Reject</Text>
                                </LinearGradient>
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
                                  activeOpacity={0.8}
                                >
                                  <LinearGradient
                                    colors={isJoinEnabled(appt) ? ['#FFFFFF', '#F8FAFF'] : ['#8DA4CC', '#7A92B8']}
                                    style={styles.meetingGradient}
                                  >
                                    <Ionicons 
                                      name="videocam" 
                                      size={22} 
                                      color={isJoinEnabled(appt) ? "#1E40AF" : "#FFFFFF"} 
                                    />
                                    <Text style={[
                                      styles.meetingButtonText, 
                                      { color: isJoinEnabled(appt) ? "#1E40AF" : "#FFFFFF" }
                                    ]}>
                                      Join MEET
                                    </Text>
                                  </LinearGradient>
                                </TouchableOpacity>
                              )}
                              
                              {isPrescriptionEnabled(appt) && (
                                <TouchableOpacity
                                  style={styles.meetingButton}
                                  onPress={() => setShowPrescriptionFor(appt._id!)}
                                  activeOpacity={0.8}
                                >
                                  <LinearGradient
                                    colors={['#FFFFFF', '#F8FAFF']}
                                    style={styles.meetingGradient}
                                  >
                                    <Ionicons name="document-text" size={22} color="#1E40AF" />
                                    <Text style={[styles.meetingButtonText, { color: "#1E40AF" }]}>
                                      Write Prescription
                                    </Text>
                                  </LinearGradient>
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

        {/* Custom Date Modal */}
        <Modal
          visible={showDateModal}
          transparent={true}
          animationType="slide"
          onRequestClose={handleModalCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['#1E40AF', '#3B82F6']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Date</Text>
                  <Text style={styles.modalSubtitle}>Choose appointment date</Text>
                </View>

                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={scheduleDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, date) => {
                      if (date) {
                        setScheduleDate(date);
                      }
                    }}
                    minimumDate={new Date()}
                    style={styles.picker}
                    textColor="#FFFFFF"
                    themeVariant="dark"
                  />
                </View>

                <View style={styles.selectedDateContainer}>
                  <Text style={styles.selectedDateLabel}>Selected Date:</Text>
                  <Text style={styles.selectedDateText}>{formatDate(scheduleDate)}</Text>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={handleModalCancel}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleDateConfirm}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#FFFFFF', '#F8FAFF']}
                      style={styles.confirmGradient}
                    >
                      <Text style={styles.modalConfirmText}>Next</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        {/* Custom Time Modal */}
        <Modal
          visible={showTimeModal}
          transparent={true}
          animationType="slide"
          onRequestClose={handleModalCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['#1E40AF', '#3B82F6']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Time</Text>
                  <Text style={styles.modalSubtitle}>Choose appointment time</Text>
                </View>

                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={scheduleDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, date) => {
                      if (date) {
                        const newDate = new Date(scheduleDate);
                        newDate.setHours(date.getHours());
                        newDate.setMinutes(date.getMinutes());
                        setScheduleDate(newDate);
                      }
                    }}
                    style={styles.picker}
                    textColor="#FFFFFF"
                    themeVariant="dark"
                  />
                </View>

                <View style={styles.selectedDateContainer}>
                  <Text style={styles.selectedDateLabel}>Selected Time:</Text>
                  <Text style={styles.selectedDateText}>{formatTime(scheduleDate)}</Text>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={handleModalCancel}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleTimeConfirm}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#00D4AA', '#00B894']}
                      style={styles.confirmGradient}
                    >
                      <Text style={[styles.modalConfirmText, { color: '#FFFFFF' }]}>Confirm</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  
  header: {
    padding: 24,
    paddingBottom: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 17,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },

  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: 'blur(10px)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 17,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: 'blur(10px)',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },

  appointmentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: 'blur(10px)',
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
    marginRight: 16,
  },

  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },

  patientDetails: {
    flex: 1,
  },

  patientName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  patientMeta: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 6,
    fontWeight: "500",
  },

  symptomPreview: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },

  headerRight: {
    alignItems: "flex-end",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    backdropFilter: 'blur(10px)',
  },

  statusText: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
    textTransform: "capitalize",
  },

  chevron: {
    opacity: 0.9,
  },

  expandedContent: {
    paddingBottom: 20,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 20,
    marginBottom: 20,
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
    borderRadius: 14,
    overflow: 'hidden',
  },

  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  acceptButton: {
    shadowColor: "#00D4AA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  rejectButton: {
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },

  meetingActions: {
    alignItems: "center",
  },

  meetingButton: {
    borderRadius: 14,
    minWidth: 200,
    overflow: 'hidden',
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  meetingGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },

  joinMeetingButton: {},

  disabledMeetingButton: {},

  meetingButtonText: {
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 10,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },

  modalGradient: {
    padding: 0,
  },

  modalHeader: {
    padding: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    textAlign: 'center',
  },

  modalSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: 'center',
  },

  pickerContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
  },

  picker: {
    backgroundColor: 'transparent',
  },

  selectedDateContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },

  selectedDateLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },

  selectedDateText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: 'center',
  },

  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },

  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: 'center',
  },

  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },

  modalConfirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },

  confirmGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },

  modalConfirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E40AF",
  },
});