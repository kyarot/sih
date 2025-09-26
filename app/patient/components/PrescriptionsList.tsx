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

type Pharmacy = {
  _id: string;
  name: string;
  matchedMedicines: { name: string; requiredQty: number; availableQty: number }[];
  missingMedicines: { name: string; requiredQty: number; availableQty: number }[];
  hasAllMedicines: boolean;
};

export default function PrescriptionsList({ patientUid }: { patientUid?: string | null }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [expandedPrescription, setExpandedPrescription] = useState<string | null>(null);

  // 🆕 Pharmacy results state
  const [pharmacyResults, setPharmacyResults] = useState<{ [key: string]: Pharmacy[] }>({});
  const [pharmacyLoading, setPharmacyLoading] = useState<{ [key: string]: boolean }>({});

  const router = useRouter();

  // ✅ Fetch prescriptions for this patient
  useEffect(() => {
    if (patientUid && patientUid.trim().length === 24) {
      fetchPrescriptions(patientUid);
    } else if (patientUid) {
      console.warn("⚠️ Invalid patientUid passed to PrescriptionsList:", patientUid);
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

  // 🆕 Fetch pharmacies for a prescription
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

  const getTimeOfDayIcon = (m: Medicine) => {
    if (m.morning && m.afternoon && m.night) return "sunny";
    if (m.morning && m.night) return "partly-sunny";
    if (m.morning) return "sunny-outline";
    if (m.afternoon) return "partly-sunny-outline";
    if (m.night) return "moon-outline";
    return "time-outline";
  };

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

  // ✅ Inline pharmacy list renderer
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
      return (
        <View style={styles.emptyPharma}>
          <Ionicons name="storefront-outline" size={20} color="#9CA3AF" />
          <Text style={styles.emptyPharmaText}>No nearby pharmacies found with these medicines</Text>
        </View>
      );
    }

    return pharmacies.map((pharm) => (
      <View key={pharm._id} style={styles.pharmaCard}>
        <Text style={styles.pharmaName}>
          <Ionicons name="storefront" size={14} color="#1E40AF" /> {pharm.name}
        </Text>

        {pharm.hasAllMedicines ? (
          <Text style={styles.allMeds}>✅ All medicines available</Text>
        ) : (
          <Text style={styles.someMeds}>⚠️ Some medicines missing</Text>
        )}

        <View style={styles.medsList}>
          {pharm.matchedMedicines.map((m, i) => (
            <Text key={i} style={styles.matchedMed}>
              ✅ {m.name} (Available: {m.availableQty})
            </Text>
          ))}
          {pharm.missingMedicines.map((m, i) => (
            <Text key={i} style={styles.missingMed}>
              ❌ {m.name} (Needed: {m.requiredQty}, Found: {m.availableQty})
            </Text>
          ))}
        </View>
      </View>
    ));
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded((s) => !s)}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="medical" size={20} color="white" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t("medical_prescriptions")}</Text>
            <Text style={styles.subtitle}>
              {prescriptions.length === 0
                ? t("no_prescriptions_available")
                : prescriptions.length === 1
                ? t("one_active_prescription")
                : `${prescriptions.length} ${t("total_prescriptions")}`}
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
              <Text style={styles.loadingText}>{t("loading_medical_records")}</Text>
            </View>
          ) : prescriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="document-text-outline" size={48} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>{t("no_prescriptions_found")}</Text>
              <Text style={styles.emptyText}>{t("prescription_history_info")}</Text>
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
                    activeOpacity={0.8}
                  >
                    <View style={styles.presHeaderLeft}>
                      <View style={styles.doctorAvatar}>
                        <Ionicons name="person" size={18} color="#1E40AF" />
                      </View>
                      <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>
                          {t("dr_prefix")} {(pres.doctorId as any)?.name ?? t("healthcare_provider")}
                        </Text>
                        <Text style={styles.doctorSpecialization}>
                          {(pres.doctorId as any)?.specialization ?? t("general_medicine")}
                        </Text>
                        <View style={styles.prescriptionMeta}>
                          <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                          <Text style={styles.prescriptionDate}>{formatDate(pres.createdAt)}</Text>
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
                        <Text style={styles.medicinesTitle}>{t("prescribed_medications")}</Text>
                        <View style={styles.medicineCount}>
                          <Text style={styles.medicineCountText}>{pres.medicines?.length || 0}</Text>
                        </View>
                      </View>

                      {pres.medicines && pres.medicines.length > 0 ? (
                        <View style={styles.medicinesList}>
                          {pres.medicines.map((m, i) => (
                            <View key={i} style={styles.medicineCard}>
                              <View style={styles.medicineHeader}>
                                <View style={styles.medicineNameContainer}>
                                  <Text style={styles.medicineName}>{m.name ?? t("unnamed_medication")}</Text>
                                  <Text style={styles.medicineDosage}>{m.dosage || t("as_prescribed")}</Text>
                                </View>
                                <View style={styles.quantityBadge}>
                                  <Text style={styles.quantityText}>{m.quantity ?? t("n_a")}</Text>
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
                                  <Text style={styles.instructionsLabel}>{t("instructions")}:</Text>
                                  <Text style={styles.instructionsText}>{m.instructions}</Text>
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      ) : (
                        <View style={styles.noMedicines}>
                          <Ionicons name="medical-outline" size={24} color="#9CA3AF" />
                          <Text style={styles.noMedicinesText}>{t("no_medications_listed")}</Text>
                        </View>
                      )}

                      <View style={styles.actions}>
                        <TouchableOpacity
                          style={styles.downloadBtn}
                          onPress={() => generateAndDownloadPdf(pres)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="download-outline" size={18} color="white" />
                          <Text style={styles.downloadBtnText}>{t("download_pdf")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.pharmacyBtn}
                          onPress={() => fetchPharmaciesForPrescription(pres)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="storefront-outline" size={18} color="#1E40AF" />
                          <Text style={styles.pharmacyBtnText}>{t("find_pharmacies")}</Text>
                        </TouchableOpacity>
                      </View>

                      {/* 🆕 Inline pharmacy results */}
                      {renderPharmacies(pres._id)}
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
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#1E40AF",
    alignItems: "center",
  },
  headerContent: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: { flex: 1 },
  title: { color: "white", fontSize: 16, fontWeight: "600" },
  subtitle: { color: "#E5E7EB", fontSize: 12 },
  chevronContainer: {},
  body: { padding: 12 },
  loadingContainer: { alignItems: "center", marginVertical: 20 },
  loadingText: { marginTop: 8, color: "#6B7280" },
  emptyState: { alignItems: "center", marginVertical: 20 },
  emptyIcon: { marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#374151" },
  emptyText: { color: "#6B7280", textAlign: "center", paddingHorizontal: 20 },
  scrollView: { marginTop: 10 },
  presCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  firstCard: { marginTop: 10 },
  presHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  presHeaderLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  doctorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  doctorInfo: { flex: 1 },
  doctorName: { fontWeight: "600", color: "#1E293B" },
  doctorSpecialization: { color: "#6B7280", fontSize: 12 },
  prescriptionMeta: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  prescriptionDate: { fontSize: 12, color: "#9CA3AF", marginLeft: 4 },
  expandButton: { justifyContent: "center", alignItems: "center", paddingLeft: 8 },
  presBody: { padding: 12 },
  medicinesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  medicinesTitle: { fontWeight: "600", color: "#1E293B" },
  medicineCount: {
    backgroundColor: "#E0E7FF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  medicineCountText: { color: "#1E40AF", fontSize: 12, fontWeight: "600" },
  medicinesList: { marginTop: 10 },
  medicineCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  medicineHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  medicineNameContainer: { flex: 1 },
  medicineName: { fontWeight: "600", color: "#1E293B" },
  medicineDosage: { color: "#6B7280", fontSize: 12 },
  quantityBadge: {
    backgroundColor: "#E0E7FF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  quantityText: { color: "#1E40AF", fontSize: 12, fontWeight: "600" },
  medicineDetails: { flexDirection: "row", marginTop: 6, alignItems: "center" },
  timingContainer: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  timingText: { marginLeft: 4, fontSize: 12, color: "#374151" },
  durationContainer: { flexDirection: "row", alignItems: "center" },
  durationText: { marginLeft: 4, fontSize: 12, color: "#6B7280" },
  instructionsContainer: { marginTop: 6 },
  instructionsLabel: { fontSize: 12, fontWeight: "600", color: "#374151" },
  instructionsText: { fontSize: 12, color: "#374151" },
  noMedicines: { alignItems: "center", marginTop: 10 },
  noMedicinesText: { color: "#6B7280", fontSize: 12 },
  actions: { flexDirection: "row", marginTop: 12, justifyContent: "space-between" },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E40AF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  downloadBtnText: { marginLeft: 6, color: "white", fontWeight: "600" },
  pharmacyBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E40AF",
  },
  pharmacyBtnText: { marginLeft: 6, color: "#1E40AF", fontWeight: "600" },
  loadingPharma: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  emptyPharma: { marginTop: 10, alignItems: "center" },
  emptyPharmaText: { color: "#6B7280", fontSize: 12 },
  pharmaCard: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  pharmaName: { fontWeight: "600", color: "#1E293B" },
  allMeds: { color: "#059669", fontSize: 12, marginTop: 4 },
  someMeds: { color: "#EA580C", fontSize: 12, marginTop: 4 },
  medsList: { marginTop: 6 },
  matchedMed: { fontSize: 12, color: "#059669" },
  missingMed: { fontSize: 12, color: "#DC2626" },
});
