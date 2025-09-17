// components/PrescriptionsList.tsx
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
  Linking,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import SearchPharma from "./searchPharma";
const API_BASE = "http://localhost:5000"; // change if needed

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
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [expanded, setExpanded] = useState(false); // expand/collapse the whole tab
  const [expandedPrescription, setExpandedPrescription] = useState<string | null>(null); // per-prescription expand
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
      Alert.alert("Error", "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  }

  function formatWhen(m: Medicine) {
    const parts: string[] = [];
    if (m.morning) parts.push("Morning");
    if (m.afternoon) parts.push("Afternoon");
    if (m.night) parts.push("Night");
    return parts.length ? parts.join(", ") : "-";
  }

  async function downloadPdfForPrescription(pres: Prescription) {
    try {
      if (!pres.pdfUrl) {
        Alert.alert("No PDF", "No PDF available for this prescription.");
        return;
      }

      if (Platform.OS === "web") {
        // open cloudinary url/new tab on web
        (window as any).open(pres.pdfUrl, "_blank");
        return;
      }

      const filename = `prescription_${pres._id || Date.now()}.pdf`;
      const localPath = FileSystem.documentDirectory + filename;

      const downloadRes = await FileSystem.downloadAsync(pres.pdfUrl, localPath);
      // try to share / open the file
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(downloadRes.uri);
      } else {
        Alert.alert("Downloaded", `Saved to ${downloadRes.uri}`);
      }
    } catch (err: any) {
      console.error("downloadPdfForPrescription:", err);
      Alert.alert("Download failed", err?.message || String(err));
    }
  }

 async function generateAndDownloadPdf(pres: Prescription) {
  try {
    console.log("Medicines for PDF:", pres.medicines);

    const medicineRows = (pres.medicines ?? [])
      .map(
        (m, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${m.name || "-"}</td>
          <td>${m.quantity || "-"}</td>
          <td>
            ${m.morning ? "Morning " : ""}
            ${m.afternoon ? "Afternoon " : ""}
            ${m.night ? "Night " : ""}
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
          <h1>Prescription</h1>
          <p><b>Doctor ID:</b> ${pres.doctorId}</p>
          <p><b>Patient ID:</b> ${pres.patientId}</p>
          <p><b>Date:</b> ${new Date(pres.createdAt ?? Date.now()).toLocaleString()}</p>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Quantity</th>
                <th>When to Take</th>
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
    console.log("PDF file created at:", uri);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert("PDF Generated", `Saved to: ${uri}`);
    }
  } catch (err: any) {
    console.error("generateAndDownloadPdf:", err);
    Alert.alert("Error", err?.message || "Failed to generate PDF");
  }
}

  

  function goToPharmacyList() {
    // push to pharmacylist screen
    // router.push("/patient/searchPharma")
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded((s) => !s)}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="document-text-outline" size={22} color="#1565C0" />
          <Text style={styles.title}>Prescriptions</Text>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#666" />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {loading ? (
            <ActivityIndicator size="small" color="#1565C0" />
          ) : prescriptions.length === 0 ? (
            <Text style={styles.emptyText}>No prescriptions found</Text>
          ) : (
            <ScrollView style={{ maxHeight: 380 }}>
              {prescriptions.map((pres) => (
                <View key={pres._id} style={styles.presCard}>
                  <TouchableOpacity
                    style={styles.presHeader}
                    onPress={() => setExpandedPrescription((cur) => (cur === pres._id ? null : pres._id))}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.presDoctor}>
                        {(pres.doctorId as any)?.name ?? "Doctor"}
                      </Text>
                      <Text style={styles.presMeta}>
                        {(pres.doctorId as any)?.specialization ?? "-"} •{" "}
                        {new Date(pres.createdAt || Date.now()).toLocaleString()}
                      </Text>
                    </View>

                    <Ionicons name={expandedPrescription === pres._id ? "chevron-up" : "chevron-down"} size={18} color="#666" />
                  </TouchableOpacity>

                  {expandedPrescription === pres._id && (
                    <View style={styles.presBody}>
                      {(pres.medicines && pres.medicines.length > 0) ? (
                        pres.medicines.map((m, i) => (
                          <View key={i} style={styles.medicineRow}>
                            <Text style={styles.medicineName}>{m.name ?? "-"}</Text>
                            <Text style={styles.medicineQty}>{m.quantity ?? "-"}</Text>
                            <Text style={styles.medicineWhen}>{formatWhen(m)}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={{ color: "#666" }}>No medicines listed</Text>
                      )}

                      <View style={styles.actions}>
                        <TouchableOpacity style={styles.downloadBtn} onPress={() => generateAndDownloadPdf(pres)}>
                          <Ionicons name="download" size={18} color="#fff" />
                          <Text style={styles.downloadBtnText}>Download PDF</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.findBtn} onPress={goToPharmacyList}>
                          <Ionicons name="location" size={18} color="#1565C0" />
                          <Text style={styles.findBtnText}>Find Pharmacies</Text>
                        </TouchableOpacity>
                      </View>
                      <SearchPharma />
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
  container: { marginTop: 12, marginBottom: 12 },
  header: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E3F2FD",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#333", marginLeft: 10 },
  body: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F5F7FB",
  },
  emptyText: { color: "#666" },

  presCard: {
    backgroundColor: "#F8FBFF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E3F2FD",
  },
  presHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  presDoctor: { fontSize: 16, fontWeight: "700", color: "#1565C0" },
  presMeta: { fontSize: 12, color: "#666", marginTop: 2 },

  presBody: { paddingTop: 6 },

  medicineRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF6FF",
    alignItems: "center",
  },
  medicineName: { flex: 1, fontSize: 14, fontWeight: "600", color: "#333" },
  medicineQty: { width: 90, fontSize: 13, color: "#666", textAlign: "center" },
  medicineWhen: { width: 110, fontSize: 13, color: "#666", textAlign: "right" },

  actions: { flexDirection: "row", marginTop: 12, justifyContent: "space-between" },
  downloadBtn: {
    flexDirection: "row",
    backgroundColor: "#1565C0",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  downloadBtnText: { color: "#fff", fontWeight: "700", marginLeft: 8 },
  findBtn: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1565C0",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  findBtnText: { color: "#1565C0", fontWeight: "700", marginLeft: 8 },
});
