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
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import SearchPharma from "./searchPharma";
import { useTranslation } from "../../../components/TranslateProvider"; 

const API_BASE = "http://localhost:5000";

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

export default function PrescriptionsList({ patientUid }: { patientUid?: string | null }) {
  const { t } = useTranslation(); // ✅
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [expandedPrescription, setExpandedPrescription] = useState<string | null>(null);
  const [CurrPrescriptionId, setCurrPrescriptionId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!patientUid) return;
    fetchPrescriptions(patientUid);
  }, [patientUid]);

  async function fetchPrescriptions(uid: string) {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/prescriptions/patient/${uid}`);
      setPrescriptions(res.data || []);
    } catch (err) {
      console.error("fetchPrescriptions:", err);
      Alert.alert(t("error"), t("failed_load_prescriptions"));
    } finally {
      setLoading(false);
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
            <td>${m.name || "-"}</td>
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
            <p><b>${t("doctor_id")}:</b> ${pres.doctorId}</p>
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

  function goToPharmacyList() {
    // router.push("/patient/searchPharma")
  }

  const getTimeOfDayIcon = (m: Medicine) => {
    if (m.morning && m.afternoon && m.night) return "sunny";
    if (m.morning && m.night) return "partly-sunny";
    if (m.morning) return "sunny-outline";
    if (m.afternoon) return "partly-sunny-outline";
    if (m.night) return "moon-outline";
    return "time-outline";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recent";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded((s) => !s)}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="medical" size={20} color="white" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Medical Prescriptions</Text>
            <Text style={styles.subtitle}>
              {prescriptions.length === 0 ? "No prescriptions available" :
               prescriptions.length === 1 ? "1 active prescription" :
               `${prescriptions.length} total prescriptions`}
            </Text>
          </View>
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color="white" />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1E40AF" />
              <Text style={styles.loadingText}>Loading medical records...</Text>
            </View>
          ) : prescriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="document-text-outline" size={48} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Prescriptions Found</Text>
              <Text style={styles.emptyText}>Your prescription history will appear here once doctors issue new prescriptions.</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {prescriptions.map((pres, index) => (
                <View key={pres._id} style={[styles.presCard, index === 0 && styles.firstCard]}>
                  <TouchableOpacity
                    style={styles.presHeader}
                    onPress={() => {
                      setExpandedPrescription((cur) => (cur === pres._id ? null : pres._id));
                      setCurrPrescriptionId(pres._id);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.presHeaderLeft}>
                      <View style={styles.doctorAvatar}>
                        <Ionicons name="person" size={18} color="#1E40AF" />
                      </View>
                      <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>
                          Dr. {(pres.doctorId as any)?.name ?? "Healthcare Provider"}
                        </Text>
                        <Text style={styles.doctorSpecialization}>
                          {(pres.doctorId as any)?.specialization ?? "General Medicine"}
                        </Text>
                        <View style={styles.prescriptionMeta}>
                          <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                          <Text style={styles.prescriptionDate}>
                            {formatDate(pres.createdAt)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.expandButton}>
                      <Ionicons
                        name={expandedPrescription === pres._id ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#6B7280"
                      />
                    </View>
                  </TouchableOpacity>

                  {expandedPrescription === pres._id && (
                    <View style={styles.presBody}>
                      <View style={styles.medicinesHeader}>
                        <Text style={styles.medicinesTitle}>Prescribed Medications</Text>
                        <View style={styles.medicineCount}>
                          <Text style={styles.medicineCountText}>
                            {pres.medicines?.length || 0}
                          </Text>
                        </View>
                      </View>

                      {pres.medicines && pres.medicines.length > 0 ? (
                        <View style={styles.medicinesList}>
                          {pres.medicines.map((m, i) => (
                            <View key={i} style={styles.medicineCard}>
                              <View style={styles.medicineHeader}>
                                <View style={styles.medicineNameContainer}>
                                  <Text style={styles.medicineName}>
                                    {m.name ?? "Unnamed Medication"}
                                  </Text>
                                  <Text style={styles.medicineDosage}>
                                    {m.dosage || "As prescribed"}
                                  </Text>
                                </View>
                                <View style={styles.quantityBadge}>
                                  <Text style={styles.quantityText}>{m.quantity ?? "N/A"}</Text>
                                </View>
                              </View>
                              
                              <View style={styles.medicineDetails}>
                                <View style={styles.timingContainer}>
                                  <Ionicons name={getTimeOfDayIcon(m)} size={14} color="#1E40AF" />
                                  <Text style={styles.timingText}>{formatWhen(m)}</Text>
                                </View>
                                
                                {m.duration && (
                                  <View style={styles.durationContainer}>
                                    <Ionicons name="hourglass-outline" size={14} color="#64748B" />
                                    <Text style={styles.durationText}>{m.duration}</Text>
                                  </View>
                                )}
                              </View>

                              {m.instructions && (
                                <View style={styles.instructionsContainer}>
                                  <Text style={styles.instructionsLabel}>Instructions:</Text>
                                  <Text style={styles.instructionsText}>{m.instructions}</Text>
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      ) : (
                        <View style={styles.noMedicines}>
                          <Ionicons name="medical-outline" size={24} color="#9CA3AF" />
                          <Text style={styles.noMedicinesText}>No medications listed in this prescription</Text>
                        </View>
                      )}

                      <View style={styles.actions}>
                        <TouchableOpacity
                          style={styles.downloadBtn}
                          onPress={() => downloadPdfForPrescription(pres)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="download-outline" size={18} color="white" />
                          <Text style={styles.downloadBtnText}>Download PDF</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.pharmacyBtn} 
                          onPress={goToPharmacyList}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="storefront-outline" size={18} color="#1E40AF" />
                          <Text style={styles.pharmacyBtnText}>Find Pharmacies</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.searchPharmaContainer}>
                      <SearchPharma patientId={patientUid ?? ""} prescriptionId={CurrPrescriptionId ?? ""}/>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 16,
  },
  header: {
    backgroundColor: "#1E40AF",
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#1E40AF",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "white",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    backgroundColor: "white",
    borderRadius: 14,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "500",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  scrollView: {
    maxHeight: 450,
  },
  presCard: {
    backgroundColor: "white",
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  firstCard: {
    marginTop: 14,
  },
  presHeader: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  presHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  doctorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 2,
  },
  doctorSpecialization: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  prescriptionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  prescriptionDate: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  expandButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  presBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  medicinesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 14,
  },
  medicinesTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  medicineCount: {
    backgroundColor: "#1E40AF",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 20,
    alignItems: "center",
  },
  medicineCountText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
  medicinesList: {
    marginBottom: 16,
  },
  medicineCard: {
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  medicineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  medicineNameContainer: {
    flex: 1,
    marginRight: 8,
  },
  medicineName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  medicineDosage: {
    fontSize: 12,
    color: "#64748B",
    fontStyle: "italic",
  },
  quantityBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quantityText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E40AF",
  },
  medicineDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timingText: {
    fontSize: 13,
    color: "#1E40AF",
    fontWeight: "500",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: "#64748B",
  },
  instructionsContainer: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  instructionsLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  instructionsText: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 16,
  },
  noMedicines: {
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  noMedicinesText: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 10,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#1E40AF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  downloadBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  pharmacyBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#1E40AF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  pharmacyBtnText: {
    color: "#1E40AF",
    fontWeight: "600",
    fontSize: 14,
  },
  searchPharmaContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 14,
  },
});