import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useTranslation } from "../../../components/TranslateProvider";

const API_BASE = "https://7300c4c894de.ngrok-free.app";

type Medicine = {
  name?: string;
  quantity?: string;
  dosage?: string;
  duration?: string;
  instructions?: string;
  morning?: boolean;
  afternoon?: boolean;
  night?: boolean;
};

type Prescription = {
  _id: string;
  doctorId?: { _id?: string; name?: string; specialization?: string } | string;
  patientId?: string;
  medicines?: Medicine[];
  createdAt?: string;
  pdfUrl?: string;
};

type Pharmacy = {
  _id: string;
  name: string;
  matchedMedicines: { name: string; requiredQty: number; availableQty: number }[];
  missingMedicines: { name: string; requiredQty: number; availableQty: number }[];
  hasAllMedicines: boolean;
};

export default function PrescriptionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { patientUid } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [expandedPrescription, setExpandedPrescription] = useState<string | null>(null);
  const [pharmacyResults, setPharmacyResults] = useState<{ [key: string]: Pharmacy[] }>({});
  const [pharmacyLoading, setPharmacyLoading] = useState<{ [key: string]: boolean }>({});

  // Fetch prescriptions for this patient
  useEffect(() => {
    if (patientUid && typeof patientUid === 'string' && patientUid.trim().length === 24) {
      fetchPrescriptions(patientUid);
    } else if (patientUid) {
      console.warn("⚠️ Invalid patientUid passed to PrescriptionsScreen:", patientUid);
    }
  }, [patientUid]);

  async function fetchPrescriptions(uid: string) {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/prescriptions/patient/${uid}`);
      setPrescriptions(res.data || []);
    } catch (err) {
      console.error("❌ fetchPrescriptions error:", err);
      Alert.alert(t("error"), t("failed_load_prescriptions"));
    } finally {
      setLoading(false);
    }
  }

  // Fetch pharmacies for a prescription
  async function fetchPharmaciesForPrescription(pres: Prescription) {
    if (!patientUid || !pres._id) return;
    try {
      setPharmacyLoading((prev) => ({ ...prev, [pres._id]: true }));
      const res = await axios.get(
        `${API_BASE}/api/pharmacies/nearby/${patientUid}?prescriptionId=${pres._id}&fullMatch=false`
      );
      setPharmacyResults((prev) => ({ ...prev, [pres._id]: res.data.pharmacies || [] }));
    } catch (err) {
      console.error("❌ fetchPharmacies error:", err);
      Alert.alert("Error", "Failed to fetch pharmacies");
    } finally {
      setPharmacyLoading((prev) => ({ ...prev, [pres._id]: false }));
    }
  }

  function formatWhen(m: Medicine) {
    const parts: string[] = [];
    if (m.morning) parts.push(t("morning"));
    if (m.afternoon) parts.push(t("afternoon"));
    if (m.night) parts.push(t("night"));
    return parts.length ? parts.join(", ") : "-";
  }

  async function downloadPdfForPrescription(pres: Prescription) {
    try {
      if (!pres.pdfUrl) {
        Alert.alert(t("no_pdf"), t("no_pdf_available"));
        return;
      }

      if (Platform.OS === "web") {
        (window as any).open(pres.pdfUrl, "_blank");
        return;
      }

      const filename = `prescription_${pres._id || Date.now()}.pdf`;
      const localPath = FileSystem.documentDirectory + filename;

      const downloadRes = await FileSystem.downloadAsync(pres.pdfUrl, localPath);
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(downloadRes.uri);
      } else {
        Alert.alert(t("downloaded"), `${t("saved_to")}: ${downloadRes.uri}`);
      }
    } catch (err: any) {
      console.error("downloadPdfForPrescription:", err);
      Alert.alert(t("download_failed"), err?.message || String(err));
    }
  }

  async function generateAndDownloadPdf(pres: Prescription) {
    try {
      const medicineRows = (pres.medicines ?? [])
        .map(
          (m, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${m.name || t("unnamed_medication")}</td>
            <td>${m.quantity || "-"}</td>
            <td>
              ${m.morning ? t("morning") : ""}
              ${m.afternoon ? t("afternoon") : ""}
              ${m.night ? t("night") : ""}
            </td>
          </tr>`
        )
        .join("");

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: sans-serif; padding: 20px; }
              h1 { text-align: center; color: #2c3e50; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background: #f4f4f4; }
            </style>
          </head>
          <body>
            <h1>${t("prescription")}</h1>
            <p><b>${t("doctor_id")}:</b> ${typeof pres.doctorId === "object" ? (pres.doctorId as any)?.name ?? pres.doctorId?._id : pres.doctorId}</p>
            <p><b>${t("patient_id")}:</b> ${pres.patientId}</p>
            <p><b>${t("date")}:</b> ${new Date(pres.createdAt ?? Date.now()).toLocaleString()}</p>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>${t("medicine")}</th>
                  <th>${t("quantity")}</th>
                  <th>${t("when_to_take")}</th>
                </tr>
              </thead>
              <tbody>
                ${medicineRows}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert(t("pdf_generated"), `${t("saved_to")}: ${uri}`);
      }
    } catch (err: any) {
      console.error("generateAndDownloadPdf:", err);
      Alert.alert(t("error"), err?.message || t("failed_generate_pdf"));
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("recent");
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return t("yesterday");
    if (diffDays < 7) return `${diffDays} ${t("days_ago")}`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} ${t("weeks_ago")}`;
    return date.toLocaleDateString();
  };

  // Pharmacy list renderer
  function renderPharmacies(presId: string) {
    const pharmacies = pharmacyResults[presId] || [];
    const isLoading = pharmacyLoading[presId];

    if (isLoading) {
      return (
        <View style={styles.loadingPharma}>
          <ActivityIndicator size="small" color="#1E40AF" />
          <Text style={styles.loadingText}>Finding pharmacies...</Text>
        </View>
      );
    }

    if (!pharmacies.length) {
      return null;
    }

    return (
      <View style={styles.pharmacySection}>
        {pharmacies.slice(0, 2).map((pharm) => (
          <TouchableOpacity key={pharm._id} style={styles.pharmacyCard}>
            <View style={styles.pharmacyHeader}>
              <Text style={styles.pharmacyName}>{pharm.name}</Text>
              <TouchableOpacity style={styles.orderButton}>
                <Text style={styles.orderButtonText}>ORDER</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.pharmacyDistance}>1.2km</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>PRESCRIPTIONS</Text>
          <Ionicons name="medical" size={24} color="white" />
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="person-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="location-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={styles.languageButton}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Current Prescriptions!</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E40AF" />
            <Text style={styles.loadingText}>{t("loading_medical_records")}</Text>
          </View>
        ) : prescriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t("no_prescriptions_found")}</Text>
            <Text style={styles.emptyText}>{t("prescription_history_info")}</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {prescriptions.map((pres, index) => (
              <View key={pres._id} style={styles.prescriptionCard}>
                {/* Prescription Header */}
                <View style={styles.prescriptionHeader}>
                  <Text style={styles.prescriptionTitle}>Prescription {index + 1}</Text>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => setExpandedPrescription(expandedPrescription === pres._id ? null : pres._id)}
                  >
                    <Text style={styles.viewButtonText}>VIEW</Text>
                    <Ionicons 
                      name={expandedPrescription === pres._id ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#333" 
                    />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.doctorName}>
                  Dr. {(pres.doctorId as any)?.name || "Healthcare Provider"}
                </Text>

                {/* Download Button */}
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={() => generateAndDownloadPdf(pres)}
                >
                  <Ionicons name="cloud-download-outline" size={20} color="#1E40AF" />
                  <Text style={styles.downloadButtonText}>Download Prescription</Text>
                </TouchableOpacity>

                {/* Expanded Content */}
                {expandedPrescription === pres._id && (
                  <View style={styles.expandedContent}>
                    {/* Medicine Details */}
                    {pres.medicines && pres.medicines.length > 0 && (
                      <View style={styles.medicineDetails}>
                        {pres.medicines.slice(0, 1).map((medicine, i) => (
                          <View key={i} style={styles.medicineRow}>
                            <Text style={styles.medicineName}>{medicine.name}</Text>
                            <Text style={styles.medicineQuantity}>{medicine.quantity}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Search Pharmacies Button */}
                    <TouchableOpacity 
                      style={styles.searchButton}
                      onPress={() => fetchPharmaciesForPrescription(pres)}
                    >
                      <Text style={styles.searchButtonText}>Search in nearby Pharmacies</Text>
                    </TouchableOpacity>

                    {/* Pharmacy Results */}
                    {renderPharmacies(pres._id)}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E40AF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1E40AF",
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginLeft: 12,
    padding: 4,
  },
  languageButton: {
    color: "white",
    fontSize: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    backgroundColor: "#1E40AF",
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "white",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  emptyText: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  prescriptionCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backdropFilter: "blur(10px)",
  },
  prescriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  prescriptionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewButtonText: {
    color: "#333",
    fontWeight: "600",
    marginRight: 4,
    fontSize: 12,
  },
  doctorName: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    marginBottom: 16,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  downloadButtonText: {
    color: "#1E40AF",
    fontWeight: "600",
    marginLeft: 8,
  },
  expandedContent: {
    marginTop: 16,
  },
  medicineDetails: {
    marginBottom: 16,
  },
  medicineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  medicineName: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  medicineQuantity: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  searchButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 16,
  },
  searchButtonText: {
    color: "#1E40AF",
    fontWeight: "600",
  },
  loadingPharma: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  pharmacySection: {
    marginTop: 8,
  },
  pharmacyCard: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  pharmacyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  pharmacyName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  orderButton: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  orderButtonText: {
    color: "#1E40AF",
    fontWeight: "600",
    fontSize: 12,
  },
  pharmacyDistance: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
});