//PrescriptionScreen.tsx
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
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useTranslation } from "../../../components/TranslateProvider";
import { extractPharmacyId,
  fetchOrdersForPatientPrescription,
  placeOrderForPatientPrescription,
  mapOrdersByPharmacy, } from "../utils/orderService";

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
const [ordersByPrescription, setOrdersByPrescription] = useState<{ [presId: string]: { [pharmId: string]: any } }>({});
const [ordersLoading, setOrdersLoading] = useState<{ [presId: string]: boolean }>({});
  // Fetch prescriptions for this patient
  useEffect(() => {
    if (patientUid && typeof patientUid === 'string' && patientUid.trim().length === 24) {
      fetchPrescriptions(patientUid);
    } else if (patientUid) {
      console.warn("⚠️ Invalid patientUid passed to PrescriptionsScreen:", patientUid);
    }
  }, [patientUid]);

//orders helper
async function loadOrdersForPrescription(presId: string) {
  if (!patientUid || !presId) return;
  try {
    setOrdersLoading((prev) => ({ ...prev, [presId]: true }));
    const orders = await fetchOrdersForPatientPrescription(String(patientUid), presId);
    const map = mapOrdersByPharmacy(orders);
    setOrdersByPrescription((prev) => ({ ...prev, [presId]: map }));
  } catch (err) {
    console.error("loadOrdersForPrescription error:", err);
  } finally {
    setOrdersLoading((prev) => ({ ...prev, [presId]: false }));
  }
}


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
      loadOrdersForPrescription(pres._id)
    } catch (err) {
      console.error("❌ fetchPharmacies error:", err);
      Alert.alert("Error", "Failed to fetch pharmacies");
    } finally {
      setPharmacyLoading((prev) => ({ ...prev, [pres._id]: false }));
    }
  }

  //order useeffect
  useEffect(() => {
  if (!expandedPrescription) return;

  // initial load + periodic refresh
  loadOrdersForPrescription(expandedPrescription);
  const interval = setInterval(() => {
    loadOrdersForPrescription(expandedPrescription);
  }, 15000);

  return () => clearInterval(interval);
}, [expandedPrescription, patientUid]);


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

  //order handler
  async function handlePlaceOrder(presId: string, pharmacyId: string) {
  if (!patientUid) {
    Alert.alert(t("error"), t("no_patient_id"));
    return;
  }

  // optimistic UI
  setOrdersByPrescription((prev) => ({
    ...prev,
    [presId]: { ...(prev[presId] || {}), [pharmacyId]: { status: "pending", _temp: true } },
  }));

  try {
    const res = await placeOrderForPatientPrescription(String(patientUid), pharmacyId, presId);
    const order = res.order;
    const key = extractPharmacyId(order) || pharmacyId;
    setOrdersByPrescription((prev) => ({
      ...prev,
      [presId]: { ...(prev[presId] || {}), [key]: order },
    }));

    if (res.conflict) {
      Alert.alert(t("info"), res.message || t("order_exists"));
    } else {
      Alert.alert(t("Success"), t("Order Sent"));
    }
  } catch (err: any) {
    console.error("handlePlaceOrder error:", err);
    Alert.alert(t("error"), err?.message || t("failed_place_order"));

    // rollback optimistic entry
    setOrdersByPrescription((prev) => {
      const copy = { ...(prev[presId] || {}) };
      delete copy[pharmacyId];
      return { ...prev, [presId]: copy };
    });
  }
}

  // Pharmacy list renderer
  function renderPharmacies(presId: string) {
  const pharmacies = pharmacyResults[presId] || [];
  const isLoading = (pharmacyLoading[presId] || ordersLoading[presId]) ?? false;

  if (isLoading) {
    return (
      <View style={styles.loadingPharma}>
        <ActivityIndicator size="small" color="#FFFFFF" />
        <Text style={styles.loadingText}>Finding pharmacies...</Text>
      </View>
    );
  }

  if (!pharmacies.length) {
    return null;
  }

  const ordersMapForPres = ordersByPrescription[presId] || {};

  const renderStatusBadge = (order: any) => {
    if (!order) return null;
    const status = order.status;
    let text = t("unknown");
    let bg = "#E5E7EB";
    let textColor = "#6B7280";
    let icon = "●";

    switch (status) {
      case "pending":
        text = t("order_sent"); bg = "#FEF3C7"; textColor = "#D97706"; icon = "⏱"; break;
      case "confirmed":
        text = t("confirmed"); bg = "#D1FAE5"; textColor = "#059669"; icon = "✓"; break;
      case "rejected":
        text = t("rejected"); bg = "#FEE2E2"; textColor = "#DC2626"; icon = "✗"; break;
      case "ready":
        text = t("ready_for_pickup"); bg = "#DBEAFE"; textColor = "#1E40AF"; icon = "✓"; break;
      case "completed":
        text = t("completed"); bg = "#D1FAE5"; textColor = "#059669"; icon = "✓"; break;
      default:
        break;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Text style={[styles.statusIcon, { color: textColor }]}>{icon}</Text>
        <Text style={[styles.statusText, { color: textColor }]}>{text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.pharmacySection}>
      <Text style={styles.pharmacySectionTitle}>Available Pharmacies</Text>
      {pharmacies.slice(0, 2).map((pharm: any) => {
        const pid = String(pharm._id);
        const existingOrder = ordersMapForPres[pid];
        const existingStatus = existingOrder?.status;
        const isActive = existingStatus && ["pending", "confirmed", "ready"].includes(existingStatus);

        return (
          <View key={pharm._id} style={styles.pharmacyCard}>
            <View style={styles.pharmacyHeader}>
              <View style={styles.pharmacyInfo}>
                <View style={styles.pharmacyIconContainer}>
                  <Ionicons name="medical" size={20} color="rgba(255,255,255,0.9)" />
                </View>
                <View>
                  <Text style={styles.pharmacyName}>{pharm.name}</Text>
                  <Text style={styles.pharmacyDistance}>1.2km away</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handlePlaceOrder(presId, pid)}
                disabled={!!isActive}
                style={[styles.orderButton, isActive && styles.orderButtonDisabled]}
              >
                <Text style={[styles.orderButtonText, isActive && styles.orderButtonTextDisabled]}>
                  {existingOrder ? t("Order Sent") : "ORDER"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pharmacyStatus}>
              <View style={[styles.statusDot, { backgroundColor: pharm.hasAllMedicines ? "#10B981" : "#F59E0B" }]} />
              <Text style={styles.statusText}>
                {pharm.hasAllMedicines ? "All medicines available" : "Some medicines available"}
              </Text>
            </View>

            {/* Order status badge */}
            {renderStatusBadge(existingOrder)}
          </View>
        );
      })}
    </View>
  );
}


  return (
    <LinearGradient
      colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="medical" size={24} color="white" />
            </View>
            <Text style={styles.headerTitle}>PRESCRIPTIONS</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconButton}>
              <Ionicons name="person-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton}>
              <Ionicons name="location-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.languageButton}>
              <Text style={styles.languageButtonText}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton}>
              <Ionicons name="notifications-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.sectionTitle}>Current Prescriptions</Text>
            <Text style={styles.sectionSubtitle}>Manage your medical prescriptions</Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingIconContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
              <Text style={styles.loadingTitle}>Loading Medical Records</Text>
              <Text style={styles.loadingSubtitle}>Please wait while we fetch your prescriptions</Text>
            </View>
          ) : prescriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="document-text-outline" size={64} color="rgba(255,255,255,0.7)" />
              </View>
              <Text style={styles.emptyTitle}>No Prescriptions Found</Text>
              <Text style={styles.emptyText}>Your prescription history will appear here once you visit a doctor</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {prescriptions.map((pres, index) => (
                <View key={pres._id} style={styles.prescriptionCard}>
                  {/* Prescription Header */}
                  <View style={styles.prescriptionHeader}>
                    <View style={styles.prescriptionTitleSection}>
                      <View style={styles.prescriptionIconContainer}>
                        <Ionicons name="document-text" size={24} color="rgba(255,255,255,0.9)" />
                      </View>
                      <View>
                        <Text style={styles.prescriptionTitle}>Prescription #{index + 1}</Text>
                        <Text style={styles.prescriptionDate}>{formatDate(pres.createdAt)}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => setExpandedPrescription(expandedPrescription === pres._id ? null : pres._id)}
                    >
                      <Text style={styles.viewButtonText}>VIEW</Text>
                      <Ionicons 
                        name={expandedPrescription === pres._id ? "chevron-up" : "chevron-down"} 
                        size={16} 
                        color="#1E3A8A" 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.doctorSection}>
                    <View style={styles.doctorIconContainer}>
                      <Ionicons name="person" size={16} color="rgba(255,255,255,0.8)" />
                    </View>
                    <Text style={styles.doctorName}>
                      Dr. {(pres.doctorId as any)?.name || "Healthcare Provider"}
                    </Text>
                    {(pres.doctorId as any)?.specialization && (
                      <Text style={styles.doctorSpecialization}>
                        {(pres.doctorId as any).specialization}
                      </Text>
                    )}
                  </View>

                  {/* Download Button */}
                  <TouchableOpacity 
                    style={styles.downloadButton}
                    onPress={() => generateAndDownloadPdf(pres)}
                  >
                    <Ionicons name="cloud-download-outline" size={20} color="#1E3A8A" />
                    <Text style={styles.downloadButtonText}>Download Prescription</Text>
                  </TouchableOpacity>

                  {/* Expanded Content */}
                  {expandedPrescription === pres._id && (
                    <View style={styles.expandedContent}>
                      {/* Medicine Details */}
                      {pres.medicines && pres.medicines.length > 0 && (
                        <View style={styles.medicineDetails}>
                          <Text style={styles.medicineDetailsTitle}>Prescribed Medicines</Text>
                          {pres.medicines.map((medicine, i) => (
                            <View key={i} style={styles.medicineRow}>
                              <View style={styles.medicineIconDot} />
                              <View style={styles.medicineInfo}>
                                <Text style={styles.medicineName}>{medicine.name}</Text>
                                <Text style={styles.medicineQuantity}>Qty: {medicine.quantity}</Text>
                                {medicine.dosage && (
                                  <Text style={styles.medicineDosage}>Dosage: {medicine.dosage}</Text>
                                )}
                                <Text style={styles.medicineInstructions}>
                                  {formatWhen(medicine)}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Search Pharmacies Button */}
                      <TouchableOpacity 
                        style={styles.searchButton}
                        onPress={() => fetchPharmaciesForPrescription(pres)}
                      >
                        <Ionicons name="search" size={18} color="#1E3A8A" />
                        <Text style={styles.searchButtonText}>Search Nearby Pharmacies</Text>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginHorizontal: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  headerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  languageButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    minWidth: 32,
    alignItems: "center",
  },
  languageButtonText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    paddingVertical: 32,
    alignItems: "center",
  },
  sectionTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  loadingTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  loadingSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 12,
  },
  emptyText: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 24,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  prescriptionCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  prescriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  prescriptionTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  prescriptionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  prescriptionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  prescriptionDate: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "500",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewButtonText: {
    color: "#1E3A8A",
    fontWeight: "700",
    marginRight: 4,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  doctorSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  doctorIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  doctorName: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  doctorSpecialization: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "stretch",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadButtonText: {
    color: "#1E3A8A",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 15,
  },
  expandedContent: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  medicineDetails: {
    marginBottom: 20,
  },
  medicineDetailsTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  medicineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  medicineIconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginTop: 6,
    marginRight: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  medicineQuantity: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 2,
  },
  medicineDosage: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 2,
  },
  medicineInstructions: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontStyle: "italic",
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchButtonText: {
    color: "#1E3A8A",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 15,
  },
  loadingPharma: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  loadingText: {
    marginLeft: 12,
    color: "white",
    fontWeight: "500",
  },
  pharmacySection: {
    marginTop: 8,
  },
  pharmacySectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pharmacyCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  pharmacyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pharmacyInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pharmacyIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  pharmacyName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  pharmacyDistance: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "500",
  },
  orderButton: {
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderButtonText: {
    color: "#1E3A8A",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  pharmacyStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "500",
  },
    statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  orderButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  orderButtonTextDisabled: {
    color: "#E5E7EB",
  },
});