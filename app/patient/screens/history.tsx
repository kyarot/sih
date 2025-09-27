// /patient/screens/history.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const { width, height } = Dimensions.get("window");
const API_BASE = "https://7300c4c894de.ngrok-free.app";

// Types
type Doctor = {
  _id: string;
  name: string;
  specialization?: string;
  experience?: string;
};

type CompletedAppointment = {
  _id: string;
  doctorId?: Doctor;
  patientName?: string;
  patientAge?: number | string;
  patientGender?: string;
  symptomsDescription?: string;
  symptomDuration?: string;
  symptomSeverity?: string;
  scheduledDateTime?: string | Date;
  completedAt?: string | Date;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  prescriptionId?: string;
  hasPrescription?: boolean;
};

export default function HistoryScreen() {
  const router = useRouter();
  
  // State management
  const [completedAppointments, setCompletedAppointments] = useState<CompletedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const [downloadingPrescription, setDownloadingPrescription] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadCompletedAppointments();
  }, []);

  const loadCompletedAppointments = async () => {
    try {
      setLoading(true);
      const patientUid = await AsyncStorage.getItem("PatientUid");
      
      if (!patientUid) {
        Alert.alert("Error", "Patient information not found. Please login again.");
        router.back();
        return;
      }

      const response = await axios.get(`${API_BASE}/api/appointments/patient/${patientUid}/completed`);
      setCompletedAppointments(response.data || []);
    } catch (error) {
      console.error("Error loading completed appointments:", error);
      Alert.alert("Error", "Failed to load medical history");
      // Fallback to existing endpoint and filter
      await loadAllAppointmentsAndFilter();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAllAppointmentsAndFilter = async () => {
    try {
      const patientUid = await AsyncStorage.getItem("PatientUid");
      if (!patientUid) return;

      const response = await axios.get(`${API_BASE}/api/appointments/patient/${patientUid}`);
      const allAppointments = response.data || [];
      const completed = allAppointments.filter((apt: any) => apt.status === "completed");
      setCompletedAppointments(completed);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setCompletedAppointments([]);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCompletedAppointments();
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "Recently";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Recently";
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return '#EF4444';
      case 'moderate': return '#F59E0B';
      case 'mild': return '#10B981';
      default: return '#6B7280';
    }
  };

  const downloadPrescription = async (appointment: CompletedAppointment) => {
    try {
      setDownloadingPrescription(appointment._id);
      
      // First try to get the prescription PDF URL
      const prescriptionResponse = await axios.get(`${API_BASE}/api/appointments/prescriptions/${appointment._id}`);
      const prescription = prescriptionResponse.data;

      if (prescription && prescription.pdfUrl) {
        // Download existing PDF
        await downloadExistingPdf(prescription.pdfUrl, appointment._id);
      } else {
        // Generate new PDF
        await generatePrescriptionPdf(appointment, prescription);
      }
    } catch (error) {
      console.error("Error downloading prescription:", error);
      Alert.alert("Error", "Failed to download prescription. Please try again.");
    } finally {
      setDownloadingPrescription(null);
    }
  };

  const downloadExistingPdf = async (pdfUrl: string, appointmentId: string) => {
    try {
      if (Platform.OS === "web") {
        (window as any).open(pdfUrl, "_blank");
        return;
      }

      const filename = `prescription_${appointmentId}.pdf`;
      const localPath = FileSystem.documentDirectory + filename;

      const downloadRes = await FileSystem.downloadAsync(pdfUrl, localPath);
      const available = await Sharing.isAvailableAsync();
      
      if (available) {
        await Sharing.shareAsync(downloadRes.uri);
      } else {
        Alert.alert("Downloaded", `Saved to: ${downloadRes.uri}`);
      }
    } catch (error) {
      throw error;
    }
  };

  const generatePrescriptionPdf = async (appointment: CompletedAppointment, prescription?: any) => {
    try {
      const medicineRows = (prescription?.medicines || [])
        .map((m: any, i: number) => `
          <tr>
            <td>${i + 1}</td>
            <td>${m.name || "-"}</td>
            <td>${m.quantity || "-"}</td>
            <td>${m.dosage || "-"}</td>
            <td>
              ${m.morning ? "Morning " : ""}
              ${m.afternoon ? "Afternoon " : ""}
              ${m.night ? "Night" : ""}
            </td>
          </tr>
        `)
        .join("");

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1E40AF; padding-bottom: 20px; }
              .title { color: #1E40AF; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
              .subtitle { color: #6B7280; font-size: 16px; }
              .info-section { margin: 20px 0; }
              .info-row { margin: 8px 0; }
              .label { font-weight: bold; color: #374151; }
              .value { color: #6B7280; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #D1D5DB; padding: 12px; text-align: left; }
              th { background: #F3F4F6; font-weight: bold; color: #1F2937; }
              .symptoms-section { background: #F8FAFC; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .footer { margin-top: 40px; text-align: center; color: #9CA3AF; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">Medical Consultation Report</div>
              <div class="subtitle">Prescription & Treatment Summary</div>
            </div>

            <div class="info-section">
              <div class="info-row">
                <span class="label">Doctor:</span> 
                <span class="value">Dr. ${appointment.doctorId?.name || "Healthcare Provider"}</span>
              </div>
              <div class="info-row">
                <span class="label">Specialization:</span> 
                <span class="value">${appointment.doctorId?.specialization || "General Medicine"}</span>
              </div>
              <div class="info-row">
                <span class="label">Patient:</span> 
                <span class="value">${appointment.patientName || "Patient"}</span>
              </div>
              <div class="info-row">
                <span class="label">Age:</span> 
                <span class="value">${appointment.patientAge || "N/A"}</span>
              </div>
              <div class="info-row">
                <span class="label">Consultation Date:</span> 
                <span class="value">${formatDate(appointment.scheduledDateTime)}</span>
              </div>
            </div>

            <div class="symptoms-section">
              <h3 style="color: #1E40AF; margin-top: 0;">Symptoms & Diagnosis</h3>
              <div class="info-row">
                <span class="label">Chief Complaint:</span> 
                <span class="value">${appointment.symptomsDescription || "Not specified"}</span>
              </div>
              <div class="info-row">
                <span class="label">Duration:</span> 
                <span class="value">${appointment.symptomDuration || "Not specified"}</span>
              </div>
              <div class="info-row">
                <span class="label">Severity:</span> 
                <span class="value">${appointment.symptomSeverity || "Not specified"}</span>
              </div>
              ${appointment.notes ? `
                <div class="info-row">
                  <span class="label">Doctor's Notes:</span> 
                  <span class="value">${appointment.notes}</span>
                </div>
              ` : ''}
            </div>

            ${medicineRows ? `
              <h3 style="color: #1E40AF;">Prescribed Medications</h3>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Medicine Name</th>
                    <th>Quantity</th>
                    <th>Dosage</th>
                    <th>When to Take</th>
                  </tr>
                </thead>
                <tbody>
                  ${medicineRows}
                </tbody>
              </table>
            ` : '<p style="color: #6B7280; font-style: italic;">No medications prescribed</p>'}

            <div class="footer">
              <p>Generated on ${new Date().toLocaleString()}</p>
              <p>This is a computer-generated document</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("PDF Generated", `Saved to: ${uri}`);
      }
    } catch (error) {
      throw error;
    }
  };

  const renderHistoryItem = ({ item: appointment }: { item: CompletedAppointment }) => {
    const isExpanded = expandedAppointment === appointment._id;
    
    return (
      <View style={styles.historyCard}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.historyCardGradient}
        >
          <TouchableOpacity
            style={styles.historyHeader}
            onPress={() => {
              setExpandedAppointment(isExpanded ? null : appointment._id);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.historyHeaderLeft}>
              <View style={styles.doctorAvatar}>
                <LinearGradient
                  colors={['#1E3A8A', '#3B82F6']}
                  style={styles.doctorAvatarGradient}
                >
                  <Ionicons name="person" size={20} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.doctorName}>
                  Dr. {appointment.doctorId?.name || "Healthcare Provider"}
                </Text>
                <Text style={styles.doctorSpecialization}>
                  {appointment.doctorId?.specialization || "General Medicine"}
                </Text>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={12} color="#6366F1" />
                  <Text style={styles.appointmentDate}>
                    {formatDate(appointment.scheduledDateTime)}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.historyHeaderRight}>
              <View style={styles.expandIconContainer}>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#1E3A8A"
                />
              </View>
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.expandedContent}>
              {/* Patient Details */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Patient Information</Text>
                <View style={styles.patientInfoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{appointment.patientName || "N/A"}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Age</Text>
                    <Text style={styles.infoValue}>{appointment.patientAge || "N/A"}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Gender</Text>
                    <Text style={styles.infoValue}>{appointment.patientGender || "N/A"}</Text>
                  </View>
                </View>
              </View>

              {/* Symptoms & Diagnosis */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Consultation Details</Text>
                
                {appointment.symptomsDescription && (
                  <View style={styles.symptomsContainer}>
                    <Text style={styles.symptomsLabel}>Chief Complaint</Text>
                    <Text style={styles.symptomsText}>{appointment.symptomsDescription}</Text>
                  </View>
                )}
                
                <View style={styles.symptomsMetaContainer}>
                  {appointment.symptomDuration && (
                    <View style={styles.symptomMeta}>
                      <View style={styles.metaIconContainer}>
                        <Ionicons name="time-outline" size={14} color="#6366F1" />
                      </View>
                      <View>
                        <Text style={styles.metaLabel}>Duration</Text>
                        <Text style={styles.metaValue}>{appointment.symptomDuration}</Text>
                      </View>
                    </View>
                  )}
                  
                  {appointment.symptomSeverity && (
                    <View style={styles.symptomMeta}>
                      <View style={[styles.metaIconContainer, { 
                        backgroundColor: `${getSeverityColor(appointment.symptomSeverity)}20` 
                      }]}>
                        <Ionicons 
                          name="alert-circle-outline" 
                          size={14} 
                          color={getSeverityColor(appointment.symptomSeverity)} 
                        />
                      </View>
                      <View>
                        <Text style={styles.metaLabel}>Severity</Text>
                        <Text style={[styles.metaValue, { 
                          color: getSeverityColor(appointment.symptomSeverity) 
                        }]}>
                          {appointment.symptomSeverity}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
                
                {appointment.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Doctor's Notes</Text>
                    <Text style={styles.notesText}>{appointment.notes}</Text>
                  </View>
                )}
              </View>

              {/* Download Prescription Button */}
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => downloadPrescription(appointment)}
                disabled={downloadingPrescription === appointment._id}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={downloadingPrescription === appointment._id 
                    ? ['rgba(30, 58, 138, 0.5)', 'rgba(59, 130, 246, 0.5)'] 
                    : ['rgba(30, 58, 138, 0.1)', 'rgba(59, 130, 246, 0.1)']}
                  style={styles.downloadButtonGradient}
                >
                  {downloadingPrescription === appointment._id ? (
                    <ActivityIndicator size="small" color="#1E3A8A" />
                  ) : (
                    <Ionicons name="download-outline" size={18} color="#1E3A8A" />
                  )}
                  <Text style={styles.downloadButtonText}>
                    {downloadingPrescription === appointment._id 
                      ? "Downloading..." 
                      : "Download Prescription"
                    }
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
          style={styles.emptyIconGradient}
        >
          <Ionicons name="document-text-outline" size={48} color="white" />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>No Medical History</Text>
      <Text style={styles.emptyText}>
        Your completed consultations and medical records will appear here
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
        <LinearGradient
          colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading medical history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
            style={styles.headerButtonGradient}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Medical History</Text>
          <Text style={styles.headerSubtitle}>Your health records</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={onRefresh}
          disabled={refreshing}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
            style={styles.headerButtonGradient}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="refresh" size={24} color="white" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Summary Section */}
      {completedAppointments.length > 0 && (
        <View style={styles.summarySection}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{completedAppointments.length}</Text>
                <Text style={styles.summaryLabel}>Total Consultations</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {completedAppointments.filter(apt => apt.hasPrescription).length}
                </Text>
                <Text style={styles.summaryLabel}>With Prescriptions</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* History List */}
      <View style={styles.content}>
        <FlatList
          data={completedAppointments}
          keyExtractor={(item) => item._id}
          renderItem={renderHistoryItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["white"]}
              tintColor="white"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
  },
  headerButton: {
    width: 44,
    height: 44,
  },
  headerButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleContainer: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginTop: 2,
  },
  summarySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  summaryGradient: {
    borderRadius: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  historyCard: {
    marginBottom: 20,
  },
  historyCardGradient: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    overflow: "hidden",
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  historyHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
  },
  doctorAvatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appointmentInfo: {
    marginLeft: 16,
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: "#6366F1",
    marginBottom: 6,
    fontWeight: "600",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentDate: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 6,
    fontWeight: "500",
  },
  historyHeaderRight: {
    padding: 4,
  },
  expandIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    alignItems: "center",
    justifyContent: "center",
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 58, 138, 0.1)',
    padding: 20,
    paddingTop: 24,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  patientInfoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  infoItem: {
    width: "32%",
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  infoLabel: {
    fontSize: 12,
    color: "#6366F1",
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#1E3A8A",
    fontWeight: "700",
  },
  symptomsContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  symptomsLabel: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "700",
    marginBottom: 8,
  },
  symptomsText: {
    fontSize: 15,
    color: "#1E3A8A",
    lineHeight: 22,
    fontWeight: "500",
  },
  symptomsMetaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  symptomMeta: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  metaIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  metaLabel: {
    fontSize: 12,
    color: "#6366F1",
    fontWeight: "600",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    color: "#1E3A8A",
    fontWeight: "700",
  },
  notesContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  notesLabel: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "700",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 15,
    color: "#1E3A8A",
    lineHeight: 22,
    fontWeight: "500",
    fontStyle: "italic",
  },
  downloadButton: {
    marginTop: 8,
  },
  downloadButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.2)',
  },
  downloadButtonText: {
    color: "#1E3A8A",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
});