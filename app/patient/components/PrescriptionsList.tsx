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

const API_BASE = "https://5aa83c1450d9.ngrok-free.app";

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

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded((s) => !s)}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={24} color="white" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t("my_prescriptions")}</Text>
            <Text style={styles.subtitle}>
              {prescriptions.length}{" "}
              {prescriptions.length === 1 ? t("prescription") : t("prescriptions")}
            </Text>
          </View>
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="white" />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1E40AF" />
              <Text style={styles.loadingText}>{t("loading_prescriptions")}</Text>
            </View>
          ) : prescriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>{t("no_prescriptions_found")}</Text>
              <Text style={styles.emptyText}>{t("prescriptions_will_appear")}</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {prescriptions.map((pres, index) => (
                <View key={pres._id} style={[styles.presCard, index === 0 && styles.firstCard]}>
                  <TouchableOpacity
                    style={styles.presHeader}
                    onPress={() =>
                      setExpandedPrescription((cur) => (cur === pres._id ? null : pres._id))
                    }
                  >
                    <View style={styles.presHeaderLeft}>
                      <View style={styles.doctorAvatar}>
                        <Ionicons name="person" size={20} color="#1E40AF" />
                      </View>
                      <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>
                          {(pres.doctorId as any)?.name ?? t("doctor")}
                        </Text>
                        <Text style={styles.doctorSpecialization}>
                          {(pres.doctorId as any)?.specialization ?? t("general_medicine")}
                        </Text>
                        <Text style={styles.prescriptionDate}>
                          {new Date(pres.createdAt || Date.now()).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.expandButton}>
                      <Ionicons
                        name={expandedPrescription === pres._id ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#6B7280"
                      />
                    </View>
                  </TouchableOpacity>

                  {expandedPrescription === pres._id && (
                    <View style={styles.presBody}>
                      <View style={styles.medicinesHeader}>
                        <Text style={styles.medicinesTitle}>{t("prescribed_medications")}</Text>
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
                                <Text style={styles.medicineName}>
                                  {m.name ?? t("unknown_medicine")}
                                </Text>
                                <View style={styles.quantityBadge}>
                                  <Text style={styles.quantityText}>{m.quantity ?? "-"}</Text>
                                </View>
                              </View>
                              <View style={styles.timingContainer}>
                                <Ionicons name="time-outline" size={16} color="#6B7280" />
                                <Text style={styles.timingText}>{formatWhen(m)}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <View style={styles.noMedicines}>
                          <Text style={styles.noMedicinesText}>{t("no_medicines_listed")}</Text>
                        </View>
                      )}

                      <View style={styles.actions}>
                        <TouchableOpacity
                          style={styles.downloadBtn}
                          onPress={() => generateAndDownloadPdf(pres)}
                        >
                          <Ionicons name="download-outline" size={20} color="white" />
                          <Text style={styles.downloadBtnText}>{t("download_pdf")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.pharmacyBtn} onPress={goToPharmacyList}>
                          <Ionicons name="location-outline" size={20} color="#1E40AF" />
                          <Text style={styles.pharmacyBtnText}>{t("find_pharmacies")}</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.searchPharmaContainer}>
                        <SearchPharma />
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
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#1E40AF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    backgroundColor: "white",
    borderRadius: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#1E40AF",
    fontWeight: "500",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  scrollView: {
    maxHeight: 500,
  },
  presCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  firstCard: {
    marginTop: 16,
  },
  presHeader: {
    padding: 16,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 2,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  prescriptionDate: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  expandButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  presBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  medicinesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 16,
  },
  medicinesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  medicineCount: {
    backgroundColor: "#1E40AF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  medicineCountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  medicinesList: {
    marginBottom: 20,
  },
  medicineCard: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  medicineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  quantityBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
  },
  timingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timingText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  noMedicines: {
    padding: 20,
    alignItems: "center",
  },
  noMedicinesText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1E40AF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  downloadBtnText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  pharmacyBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#1E40AF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pharmacyBtnText: {
    color: "#1E40AF",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  searchPharmaContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 16,
  },
});