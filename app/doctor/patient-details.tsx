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
import { LinearGradient } from 'expo-linear-gradient';

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
        return "#00D4AA";
      case "completed":
        return "#3B82F6";
      case "declined":
        return "#FF6B6B";
      case "missed":
        return "#FFB800";
      case "pending":
        return "#8B5CF6";
      default:
        return "#8DA4CC";
    }
  };

  const getStatusIcon = (decision: string) => {
    switch (decision) {
      case "accepted":
        return "checkmark-circle";
      case "completed":
        return "checkmark-done-circle";
      case "declined":
        return "close-circle";
      case "missed":
        return "warning";
      case "pending":
        return "time";
      default:
        return "help-circle";
    }
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
            <Text style={styles.headerTitle}>Patient Details</Text>
            <Text style={styles.headerSubtitle}>
              View consultation history for each patient
            </Text>
          </View>

          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading patients...</Text>
              </View>
            ) : patients.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="people-outline" size={64} color="#FFFFFF" />
                </View>
                <Text style={styles.emptyTitle}>No Patients</Text>
                <Text style={styles.emptyText}>
                  You don't have any patient consultations yet.
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
                          <Text style={styles.patientName}>{patient.name}</Text>
                          <Text style={styles.patientMeta}>
                            Age: {patient.age} • {patient.gender}
                          </Text>
                          <View style={styles.consultationBadge}>
                            <Ionicons name="medical" size={14} color="#00D4AA" />
                            <Text style={styles.consultationText}>
                              {patient.consultations.length} Consultations
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.headerRight}>
                        <View style={styles.statusSummary}>
                          {patient.consultations.slice(0, 3).map((consultation, idx) => (
                            <View 
                              key={idx}
                              style={[
                                styles.statusDot, 
                                { backgroundColor: getStatusColor(consultation.decision || "pending") }
                              ]} 
                            />
                          ))}
                          {patient.consultations.length > 3 && (
                            <Text style={styles.moreIndicator}>+{patient.consultations.length - 3}</Text>
                          )}
                        </View>
                        <Ionicons
                          name={isOpen ? "chevron-up" : "chevron-down"}
                          size={24}
                          color="#FFFFFF"
                          style={styles.chevron}
                        />
                      </View>
                    </TouchableOpacity>

                    {/* Expanded content = consultation history */}
                    {isOpen && (
                      <View style={styles.expandedContent}>
                        <View style={styles.divider} />
                        <Text style={styles.historyTitle}>Consultation History</Text>
                        {patient.consultations.map((c, idx) => (
                          <View key={c._id || idx} style={styles.historyItem}>
                            <View style={styles.historyHeader}>
                              <View style={styles.consultationNumber}>
                                <Text style={styles.consultationNumberText}>#{idx + 1}</Text>
                              </View>
                              <View style={styles.historyInfo}>
                                <Text style={styles.historyDate}>
                                  {c.requestedDate ?? "-"} at {c.requestedTime ?? "-"}
                                </Text>
                                <View style={[
                                  styles.statusBadge, 
                                  { backgroundColor: getStatusColor(c.decision || "pending") + "20" }
                                ]}>
                                  <Ionicons
                                    name={getStatusIcon(c.decision || "pending")}
                                    size={12}
                                    color={getStatusColor(c.decision || "pending")}
                                  />
                                  <Text style={[
                                    styles.statusText,
                                    { color: getStatusColor(c.decision || "pending") }
                                  ]}>
                                    {c.decision || "pending"}
                                  </Text>
                                </View>
                              </View>
                            </View>
                            
                            {c.symptomsDescription && (
                              <View style={styles.symptomsContainer}>
                                <Ionicons name="medical-outline" size={14} color="rgba(255, 255, 255, 0.7)" />
                                <Text style={styles.symptomsText}>
                                  {c.symptomsDescription}
                                </Text>
                              </View>
                            )}

                            {c.symptomDuration && (
                              <View style={styles.detailRow}>
                                <Ionicons name="time-outline" size={14} color="rgba(255, 255, 255, 0.7)" />
                                <Text style={styles.detailText}>Duration: {c.symptomDuration}</Text>
                              </View>
                            )}

                            {c.symptomSeverity && (
                              <View style={styles.detailRow}>
                                <Ionicons name="trending-up-outline" size={14} color="rgba(255, 255, 255, 0.7)" />
                                <Text style={styles.detailText}>Severity: {c.symptomSeverity}</Text>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default PatientDetailsScreen;

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

  content: {
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

  patientCard: {
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
    marginBottom: 8,
    fontWeight: "500",
  },

  consultationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 212, 170, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(0, 212, 170, 0.3)",
  },

  consultationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#00D4AA",
    marginLeft: 4,
  },

  headerRight: {
    alignItems: "flex-end",
  },

  statusSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },

  moreIndicator: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
    marginLeft: 4,
  },

  chevron: {
    opacity: 0.9,
  },

  expandedContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 20,
  },

  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  historyItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },

  historyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  consultationNumber: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  consultationNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  historyInfo: {
    flex: 1,
  },

  historyDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
    textTransform: "capitalize",
  },

  symptomsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  symptomsText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  detailText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 8,
    fontWeight: "500",
  },
});