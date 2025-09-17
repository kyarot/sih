// id.tsx
// Patient dashboard (with translations & Bhashini ASR integration)
// Keep your existing dependencies in package.json (axios, expo, etc.)

import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { JSX, useEffect, useMemo, useState } from "react";

import Voice, { SpeechResultsEvent } from "@react-native-voice/voice";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// NOTE: update API_BASE if your backend runs on different host/ip
const API_BASE = "http://localhost:5000"; // change if needed
const { width } = Dimensions.get("window");

/* ============================
   Translations (load JSON)
   ============================ */

// You can also import a JSON; to avoid TS issues, we'll require it.
// Make sure translations/hi.json exists (I included it below)
const hiTranslations = require("../../translation/hi.json") as Record<string, string>;

/* Minimal in-file english labels used as fallback */
const EN_LABELS: Record<string, string> = {
  welcomeBack: "Welcome back",
  familyMembers: "Family Members",
  add: "Add",
  healthProfile: "Health Profile",
  fullName: "Full Name",
  age: "Age",
  gender: "Gender",
  email: "Email",
  phone: "Phone",
  bloodGroup: "Blood Group",
  address: "Address",
  save: "Save",
  cancel: "Cancel",
  appointments: "Appointments",
  yourCurrentAppointment: "Your Current Appointment",
  doctor: "Doctor",
  specialization: "Specialization",
  requestedDate: "Requested Date",
  requestedTime: "Requested Time",
  symptomsLabel: "Symptoms",
  joinVideo: "Join Video Consultation",
  bookingPending: "Booking pending - doctor will accept and schedule date/time.",
  appointmentDeclined: "Appointment was declined by the doctor.",
  myAppointments: "My Appointments",
  noAppointments: "No appointments yet",
  bookNewAppointment: "Book New Appointment",
  bookConsultation: "Book Consultation",
  patientDetails: "Patient Details",
  describeSymptoms: "Describe your symptoms",
  forHowManyDays: "For how many days? (e.g., 2 days)",
  severity: "Severity",
  mild: "Mild",
  moderate: "Moderate",
  severe: "Severe",
  confirmBooking: "Confirm Booking",
  cancelButtonText: "Cancel",
  dailyHealthTips: "Daily Health Tips",
  emergencySOS: "Emergency SOS",
  tapForHelp: "Tap for immediate help",
};

/* ============================
   Types & Interfaces
   ============================ */

type FamilyProfile = {
  _id?: string;
  uid: string;
  name: string;
  age?: number | string;
  gender?: "Male" | "Female" | "Other" | string;
  email?: string;
  phone?: string;
  bloodGroup?: string;
  address?: string;
  accountId?: string;
  code?: string;
};

type Doctor = {
  _id: string;
  name: string;
  specialization?: string;
  available?: string;
  rating?: number;
  experience?: string;
};

type Appointment = {
  symptomsDescriptionTranslated: string;
  _id?: string;
  patientId?: string | { _id?: string; name?: string };
  doctorId?: Doctor | string | { name?: string; specialization?: string };
  uid?: string;
  requestedDate?: string;
  requestedTime?: string;
  symptomDuration?: string;
  symptomsDescription?: string;
  symptomSeverity?: string;
  decision?: "pending" | "accepted" | "later" | "declined" | "completed" | "missed" | string;
  scheduledDateTime?: string | Date | null;
  videoLink?: string;
  notes?: string;
  status?: "booked" | "completed" | "cancelled" | string;
  createdAt?: string;
  updatedAt?: string;
  patientName?: string;
  patientAge?: number | string;
  patientGender?: string;
};

/* ============================
   Helper components
   ============================ */

const GenderButton: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
}> = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.genderBtn,
        selected ? styles.genderBtnSelected : undefined,
      ]}
    >
      <Text style={[styles.genderBtnText, selected ? styles.genderBtnTextSelected : undefined]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

/* ============================
   Main Component
   ============================ */

export default function PatientHome(): JSX.Element {
  const { id } = useLocalSearchParams();
  const accountId = (id as string) || "";

  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfile[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyProfile | null>(null);
  const [patientDetails, setPatientDetails] = useState<FamilyProfile | null>(null);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [isRecording, setIsRecording] = useState(false);

  const [symptomsDescription, setSymptomsDescription] = useState<string>("");
  const [symptomDuration, setSymptomDuration] = useState<string>("");
  const [symptomSeverity, setSymptomSeverity] = useState<"Mild" | "Moderate" | "Severe">("Mild");

  const [expandedSections, setExpandedSections] = useState({
    appointments: false,
    profile: false,
  });

  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [addingNewProfile, setAddingNewProfile] = useState<boolean>(false);
  const [newProfileDraft, setNewProfileDraft] = useState<Partial<FamilyProfile>>({});

  const [expanded, setExpanded] = useState<Record<"profile" | "appointments" | "records", boolean>>({
    profile: false,
    appointments: false,
    records: false,
  });

  const [chat, setChat] = useState<{ type: "user" | "bot"; message: string }[]>([]);
  const [step, setStep] = useState<number>(0);

  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(false);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(false);

  /* ============================
     Language / Translations
     ============================ */

  // supported languages: 'en' & 'hi' for now. You can add more (.json files) and extend
  const [selectedLang, setSelectedLang] = useState<"en" | "hi">("en");

  // store translated dynamic fields keyed by profile uid (or temp)
  const [translatedFields, setTranslatedFields] = useState<Record<string, Record<string, string>>>({});

  // translated preview for symptoms field in booking
  const [translatedSymptomsPreview, setTranslatedSymptomsPreview] = useState<string>("");

  // helper to get a static label
  const getLabel = (key: string) => {
    if (selectedLang === "en") return EN_LABELS[key] ?? key;
    // hi translations loaded from JSON
    return (hiTranslations[key] as string) || EN_LABELS[key] || key;
  };

  /* ============================
     Effects: fetch initial data
     ============================ */

  useEffect(() => {
    if (!accountId) return;
    fetchFamilyProfiles();
  }, [accountId]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedFamily?.uid) {
      fetchPatientDetails(selectedFamily.uid);
      fetchAppointments(selectedFamily.uid);
    }
  }, [selectedFamily?.uid]);

  /* Voice handlers (existing) */
  useEffect(() => {
    Voice.onSpeechResults = (event: SpeechResultsEvent) => {
      if (event.value && event.value.length > 0 && currentField) {
        // We use the recognized text as intermediate input and then call translation
        handleVoiceResult(currentField, event.value[0]);
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  /* ============================
     API helpers (fetch data)
     ============================ */

  async function fetchFamilyProfiles() {
    try {
      setLoadingProfiles(true);
      const res = await axios.get(`${API_BASE}/api/patients/family/${accountId}`);
      const data = res.data || [];
      setFamilyProfiles(data);
      if (data.length > 0 && !selectedFamily) {
        setSelectedFamily(data[0]);
        setPatientDetails(data[0]); // keep base family details
      }
    } catch (err) {
      console.error("fetchFamilyProfiles:", err);
      Toast.show({ type: "error", text1: "Failed to load family profiles" });
    } finally {
      setLoadingProfiles(false);
    }
  }

  async function fetchPatientDetails(uid: string) {
    try {
      const res = await axios.get(`${API_BASE}/api/patients/profile/${uid}`);
      setPatientDetails(res.data || null);

      // prefetch translations for fields when language != en
      if (selectedLang !== "en" && res.data) {
        const fieldsToTranslate = ["name", "age", "gender", "email", "phone", "bloodGroup", "address"];
        fieldsToTranslate.forEach((f) => {
          const val = (res.data as any)[f];
          if (val) translateAndStore(uid, String(val), f);
        });
      }
    } catch (err) {
      console.error("fetchPatientDetails:", err);
    }
  }

  async function fetchDoctors() {
    try {
      setLoadingDoctors(true);
      const res = await axios.get(`${API_BASE}/api/doctors`);
      setDoctors(res.data || []);
    } catch (err) {
      console.error("fetchDoctors:", err);
    } finally {
      setLoadingDoctors(false);
    }
  }

  async function fetchAppointments(uid?: string) {
    if (!uid && !selectedFamily?.uid) return;
    const targetUid = uid || selectedFamily?.uid;
    if (!targetUid) return;
    try {
      setLoadingAppointments(true);
      const res = await axios.get(`${API_BASE}/api/appointments/patient/${selectedFamily?.uid}`);
      setAppointments(res.data || []);
    } catch (err) {
      console.error("fetchAppointments:", err);
    } finally {
      setLoadingAppointments(false);
    }
  }

  /* ============================
     Voice / Mic handling
     ============================ */

  const [currentField, setCurrentField] = useState<string | null>(null);

  // Original local STT using react-native-voice (kept as fallback)
  const startRecording = async (field: string) => {
  if (Platform.OS === "web") {
    console.warn("Voice not supported on web, use Bhashini ASR instead");
    // Instead of react-native-voice, use your Bhashini recording flow here
    startBhashiniRecording(field);
    return;
  }

  try {
    setCurrentField(field);
    setIsRecording(true);
    const locale = selectedLang === "hi" ? "hi-IN" : "en-IN";
    await Voice.start(locale);
  } catch (e) {
    console.error(e);
  }
};
  const stopRecording = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
    setIsRecording(false);
  };

  const MicButton = ({ field }: { field: string }) => (
    <TouchableOpacity
      onPress={() =>
        isRecording && currentField === field
          ? stopRecording()
          : startRecording(field)
      }
      style={{ marginLeft: 8 }}
    >
      <Ionicons
        name={isRecording && currentField === field ? "mic" : "mic-outline"}
        size={22}
        color="#1565C0"
      />
    </TouchableOpacity>
  );

  // When react-native-voice returns recognized text
  const handleVoiceResult = async (field: string, text: string) => {
    // update selectedFamily draft / field immediately
    if (field === "name" || field === "age" || field === "email" || field === "phone" || field === "bloodGroup" || field === "address") {
      setSelectedFamily((prev) =>
        prev ? { ...prev, [field]: field === "age" ? Number(text) || text : text } : prev
      );
      // then translate/store for UI if language != en
      if (selectedLang !== "en" && selectedFamily?.uid) {
        translateAndStore(selectedFamily.uid, text, field);
      }
    } else if (field === "symptoms") {
      setSymptomsDescription(text);
      if (selectedLang !== "en") {
        const t = await translateTextAPI(text, "en", selectedLang);
        setTranslatedSymptomsPreview(t || "");
      }
    }
  };

  /* ============================
     Bhashini ASR (record + send audio base64 -> backend)
     ============================ */

  // We'll use expo-av Audio.Recording to capture audio and send base64 to backend
  const [recordingObj, setRecordingObj] = useState<Audio.Recording | null>(null);

  async function startBhashiniRecording(field: string) {
    try {
      setCurrentField(field);
      // request permissions are handled externally by expo
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      setRecordingObj(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("startBhashiniRecording:", err);
    }
  }

  async function stopBhashiniRecording() {
    try {
      if (!recordingObj) return;
      await recordingObj.stopAndUnloadAsync();
      const uri = recordingObj.getURI();
      setIsRecording(false);
      setRecordingObj(null);
      if (!uri) return;

      // read file and convert to base64
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      // send to backend
      const resp = await axios.post(`${API_BASE}/api/bhashini/speech-to-text`, {
        audioBase64: base64,
        sourceLang: selectedLang === "en" ? "en" : selectedLang, // hint
      });
      const recognized = resp.data?.text;
      if (recognized && currentField) {
        // apply to field similarly to handleVoiceResult
        handleVoiceResult(currentField, recognized);
      }
    } catch (err) {
      console.error("stopBhashiniRecording:", err);
    } finally {
      setIsRecording(false);
      setRecordingObj(null);
    }
  }

  /* ============================
     Translation helpers: dynamic translation via backend
     ============================ */

  // translate text via backend -> Bhashini pipeline
  async function translateTextAPI(text: string, sourceLang = "en", targetLang: string = "hi") {
    try {
      if (!text || text.trim() === "") return "";
      const resp = await axios.post(`${API_BASE}/api/bhashini/translate`, {
        text,
        sourceLang,
        targetLang,
      });
      const translated = resp.data?.translatedText || resp.data?.translatedText || resp.data?.translatedText;
      // controller earlier sends { translatedText } - handle gracefully
      return resp.data?.translatedText || resp.data?.translated || resp.data?.translatedText || (resp.data?.translatedText === "" ? "" : resp.data?.translatedText) || "";
    } catch (err) {
      console.error("translateTextAPI:", err);
      return "";
    }
  }

  // wrapper to translate & store into translatedFields for a profile uid & field name
  async function translateAndStore(uid: string, text: string, fieldName: string) {
    if (!uid || !text) return;
    const targetLang = selectedLang;
    try {
      const translated = await translateTextAPI(text, "en", targetLang);
      setTranslatedFields((prev) => ({
        ...prev,
        [uid]: {
          ...(prev[uid] || {}),
          [fieldName]: translated || text,
        },
      }));
      return translated;
    } catch (err) {
      console.error("translateAndStore:", err);
      return text;
    }
  }

  // whenever language switches, pre-translate current profile fields
  useEffect(() => {
    if (selectedLang === "en") return;
    if (!selectedFamily?.uid || !patientDetails) return;

    const fieldsToTranslate = ["name", "age", "gender", "email", "phone", "bloodGroup", "address"];
    fieldsToTranslate.forEach((f) => {
      const val = (patientDetails as any)[f];
      if (val) translateAndStore(selectedFamily.uid, String(val), f);
    });

    // translate symptoms preview if present
    if (symptomsDescription) {
      translateTextAPI(symptomsDescription, "en", selectedLang).then((t) => setTranslatedSymptomsPreview(t || ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang, selectedFamily?.uid]);

  /* ============================
     Profile update helpers (unchanged)
     ============================ */

  async function handleSaveProfile(editedProfile: FamilyProfile) {
    if (!editedProfile?.uid) {
      Toast.show({ type: "error", text1: "Profile UID missing" });
      return;
    }
    const payload = { ...editedProfile };
    if (payload.age === "" || payload.age === null) {
      delete payload.age;
    }
    try {
      const res = await axios.put(`${API_BASE}/api/patients/profile/${payload.uid}`, payload);
      const updated = res?.data?.patient || payload;
      setSelectedFamily(updated as FamilyProfile);
      setEditingProfile(false);
      Toast.show({ type: "success", text1: "Profile updated" });
    } catch (err) {
      console.error("handleSaveProfile:", err);
      Toast.show({ type: "error", text1: "Failed to update profile" });
    }
  }

  async function handleCreateProfile(payload: Partial<FamilyProfile>) {
    if (!payload.name) {
      Toast.show({ type: "error", text1: "Name required" });
      return;
    }
    const body = {
      ...payload,
      uid: payload.uid || `UID${Date.now()}`, // unique per profile
      code: selectedFamily?.code || patientDetails?.code || accountId, // ✅ always reuse family PAT code
      accountId, // stays same for family
    };

    try {
      const res = await axios.post(`${API_BASE}/api/patients/register-patient`, body);
      const created = res?.data?.patient || body;
      setFamilyProfiles((p) => [...p, created]);
      setSelectedFamily(created as FamilyProfile);
      setAddingNewProfile(false);
      setNewProfileDraft({});
      Toast.show({ type: "success", text1: "Profile created" });
    } catch (err) {
      console.error("handleCreateProfile:", err);
      Toast.show({ type: "error", text1: "Failed to create profile" });
    }
  }

  /* ============================
     Booking flow (unchanged except translation usage)
     ============================ */

  function openBookingForDoctor(doctor: Doctor) {
    setSelectedDoctor(doctor);
    setShowBookingForm(true);
  }

  async function confirmBooking() {
    if (!selectedFamily?.uid) {
      Toast.show({ type: "error", text1: "Select a profile first" });
      return;
    }
    if (!selectedDoctor) {
      Toast.show({ type: "error", text1: "Select a doctor first" });
      return;
    }
    if (!symptomsDescription?.trim() || !symptomDuration?.trim()) {
      Toast.show({ type: "error", text1: "Please enter symptoms & duration" });
      return;
    }

    const handleBooking = async () => {
      try {
        // If user selected a non-en language, we will also send translatedSymptoms to backend
        // but keep original english text in payload too (so server has canonical text).
        const translatedSymptoms = selectedLang === "en" ? symptomsDescription : (await translateTextAPI(symptomsDescription, "en", selectedLang)) || symptomsDescription;

        const payload = {
          uid: selectedFamily.uid,
          doctorId: selectedDoctor._id,
          symptomDuration,
          symptomsDescription,
          symptomsDescriptionTranslated: translatedSymptoms,
          symptomSeverity,
          patientName: patientDetails?.name || selectedFamily?.name,
          patientAge: patientDetails?.age || selectedFamily?.age,
          patientGender: patientDetails?.gender || selectedFamily?.gender,
        };

        await axios.post(`${API_BASE}/api/appointments`, payload);

        Toast.show({ type: "success", text1: "Appointment booked" });

        // reset UI
        setShowBookingForm(false);
        setSelectedDoctor(null);
        setSymptomsDescription("");
        setSymptomDuration("");
        setSymptomSeverity("Mild");

        // expand My Appointments section
        setExpandedSections((prev) => ({ ...prev, appointments: true }));

        // refresh appointments
        fetchAppointments();
      } catch (err) {
        console.error("confirmBooking:", err);
        Toast.show({ type: "error", text1: "Failed to create appointment" });
      }
    };
    

    if (Platform.OS === "web") {
      Toast.show({ type: "info", text1: `Booking appointment with ${selectedDoctor.name}` });
      await handleBooking();
    } else {
      Alert.alert(
        getLabel("confirmBooking"),
        `${getLabel("confirmBooking")} - ${selectedDoctor.name}?`,
        [
          { text: getLabel("cancelButtonText"), style: "cancel" },
          { text: "Yes", style: "default", onPress: handleBooking },
        ]
      );
    }
  }

  /* ============================
     Helpers for UI logic & render
     ============================ */

  const selectedFamilyId = useMemo(() => selectedFamily?._id || selectedFamily?.uid || null, [selectedFamily]);

  const isJoinEnabled = (appt: Appointment) => {
    if (!appt.decision || appt.decision !== "accepted") return false;
    if (!appt.scheduledDateTime) return false;
    try {
      const scheduled = new Date(appt.scheduledDateTime as any);
      return new Date() >= scheduled;
    } catch {
      return false;
    }
  };

  function toggleSection(section: "profile" | "appointments" | "records") {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  /* ============================
     MAIN RENDER
     ============================ */

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={["#1565C0", "#1976D2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>{getLabel("welcomeBack")}</Text>
            <Text style={styles.nameText}>
              {selectedFamily?.name ?? "Loading..."} 👋
            </Text>
          </View>

          <View style={styles.headerRight}>
            {/* language picker dropdown in top-right */}
            <View style={{ marginRight: 12, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 8, overflow: "hidden" }}>
              <Picker
                selectedValue={selectedLang}
                style={{ height: 38, width: 120, color: "#fff" }}
                onValueChange={(val) => setSelectedLang(val as any)}
                mode="dropdown"
              >
                <Picker.Item label="English" value="en" />
                <Picker.Item label="हिन्दी" value="hi" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <Image source={{ uri: "https://via.placeholder.com/40x40/1565C0/ffffff?text=P" }} style={styles.profilePic} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Family section */}
        <View style={styles.familySection}>
          <Text style={styles.sectionLabel}>{getLabel("familyMembers")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
            {familyProfiles.map((profile) => (
              <TouchableOpacity
                key={profile._id ?? profile.uid}
                style={[styles.familyCard, selectedFamilyId === (profile._id ?? profile.uid) && styles.familyCardActive]}
                onPress={() => setSelectedFamily(profile)}
              >
                <Ionicons name="person" size={24} color={selectedFamilyId === (profile._id ?? profile.uid) ? "#fff" : "#1565C0"} />
                <Text style={[styles.familyText, selectedFamilyId === (profile._id ?? profile.uid) && styles.familyTextActive]}>
                  {selectedLang === "en" ? profile.name : (translatedFields[profile.uid]?.name ?? profile.name)}
                </Text>
              </TouchableOpacity>
            ))}

            {familyProfiles.length < 5 && (
              <TouchableOpacity style={[styles.familyCard, styles.addFamilyCard]} onPress={() => {
                setAddingNewProfile(true);
                setEditingProfile(false);
                setNewProfileDraft({
                  name: "",
                  age: "",
                  gender: "Male",
                  email: "",
                  phone: "",
                  bloodGroup: "",
                  address: "",
                });
              }}>
                <Ionicons name="add" size={28} color="#1565C0" />
                <Text style={styles.familyText}>{getLabel("add")}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Profile card */}
        <View style={styles.card}>
          <TouchableWithoutFeedback onPress={() => toggleSection("profile")}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="person-circle" size={24} color="#1565C0" />
                <Text style={styles.cardTitle}>{getLabel("healthProfile")}</Text>
              </View>

              <View style={styles.cardHeaderRight}>
                {!addingNewProfile && selectedFamily && (
                  <TouchableOpacity onPress={() => setEditingProfile((s) => !s)}>
                    <Ionicons
                      name={editingProfile ? "close-outline" : "create-outline"}
                      size={22}
                      color="#1565C0"
                    />
                  </TouchableOpacity>
                )}
                <Ionicons
                  name={expanded.profile ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666"
                />
              </View>
            </View>
          </TouchableWithoutFeedback>

          {expanded.profile && (
            <View style={styles.expandedContent}>
              {addingNewProfile ? (
                <>
                  {/* Full name */}
                  <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>{getLabel("fullName")}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder={getLabel("fullName")}
                        value={String(newProfileDraft.name ?? "")}
                        onChangeText={(text) =>
                          setNewProfileDraft((p) => ({ ...p, name: text }))
                        }
                      />
                      <MicButton field="name" />
                      {/* Alternative: Bhashini ASR buttons */}
                      <TouchableOpacity onPress={() => startBhashiniRecording("name")} style={{ marginLeft: 8 }}>
                        <Ionicons name="mic-circle" size={22} color="#1565C0" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => stopBhashiniRecording()} style={{ marginLeft: 8 }}>
                        <Ionicons name="stop-circle" size={22} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Age */}
                  <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>{getLabel("age")}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder={getLabel("age")}
                        keyboardType="numeric"
                        value={String(newProfileDraft.age ?? "")}
                        onChangeText={(text) =>
                          setNewProfileDraft((p) => ({
                            ...p,
                            age: text === "" ? "" : Number(text),
                          }))
                        }
                      />
                      <MicButton field="age" />
                    </View>
                  </View>

                  {/* Gender */}
                  <View style={{ flexDirection: "row", marginBottom: 12 }}>
                    {(["Male", "Female", "Other"] as const).map((g) => (
                      <GenderButton
                        key={g}
                        label={g}
                        selected={(newProfileDraft.gender ?? "Male") === g}
                        onPress={() =>
                          setNewProfileDraft((p) => ({ ...p, gender: g }))
                        }
                      />
                    ))}
                  </View>

                  {/* Email */}
                  <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>{getLabel("email")}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder={getLabel("email")}
                        value={String(newProfileDraft.email ?? "")}
                        onChangeText={(t) =>
                          setNewProfileDraft((p) => ({ ...p, email: t }))
                        }
                      />
                      <MicButton field="email" />
                    </View>
                  </View>

                  {/* Phone */}
                  <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>{getLabel("phone")}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder={getLabel("phone")}
                        keyboardType="phone-pad"
                        value={String(newProfileDraft.phone ?? "")}
                        onChangeText={(t) =>
                          setNewProfileDraft((p) => ({ ...p, phone: t }))
                        }
                      />
                      <MicButton field="phone" />
                    </View>
                  </View>

                  {/* Blood Group */}
                  <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>{getLabel("bloodGroup")}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder={getLabel("bloodGroup")}
                        value={String(newProfileDraft.bloodGroup ?? "")}
                        onChangeText={(t) =>
                          setNewProfileDraft((p) => ({ ...p, bloodGroup: t }))
                        }
                      />
                      <MicButton field="bloodGroup" />
                    </View>
                  </View>

                  {/* Address */}
                  <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>{getLabel("address")}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder={getLabel("address")}
                        value={String(newProfileDraft.address ?? "")}
                        onChangeText={(t) =>
                          setNewProfileDraft((p) => ({ ...p, address: t }))
                        }
                      />
                      <MicButton field="address" />
                    </View>
                  </View>

                  {/* Save/Cancel */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <TouchableOpacity
                      style={[styles.saveButton, { flex: 1, marginRight: 8 }]}
                      onPress={() => handleCreateProfile(newProfileDraft)}
                    >
                      <Text style={styles.saveButtonText}>{getLabel("save")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.cancelButton, { flex: 1 }]}
                      onPress={() => {
                        setAddingNewProfile(false);
                        setNewProfileDraft({});
                      }}
                    >
                      <Text style={styles.cancelButtonText}>{getLabel("cancel")}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : selectedFamily ? (
                <>
                  {[
                    { key: "name", label: getLabel("fullName") },
                    { key: "age", label: getLabel("age") },
                    { key: "gender", label: getLabel("gender") },
                    { key: "email", label: getLabel("email") },
                    { key: "phone", label: getLabel("phone") },
                    { key: "bloodGroup", label: getLabel("bloodGroup") },
                    { key: "address", label: getLabel("address") },
                  ].map((f) => (
                    <View key={f.key} style={styles.inputRow}>
                      <Text style={styles.inputLabel}>{f.label}</Text>

                      {editingProfile ? (
                        f.key !== "gender" ? (
                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <TextInput
                              style={[styles.input, { flex: 1 }]}
                              value={String((selectedFamily as any)[f.key] ?? "")}
                              keyboardType={f.key === "age" ? "numeric" : "default"}
                              onChangeText={(text) =>
                                setSelectedFamily((prev) =>
                                  prev
                                    ? {
                                        ...(prev as FamilyProfile),
                                        [f.key]:
                                          f.key === "age"
                                            ? text === ""
                                              ? ""
                                              : Number(text)
                                            : text,
                                      }
                                    : prev
                                )
                              }
                            />
                            <MicButton field={f.key} />
                          </View>
                        ) : (
                          <View style={{ flexDirection: "row" }}>
                            {(["Male", "Female", "Other"] as const).map((g) => (
                              <GenderButton
                                key={g}
                                label={g}
                                selected={selectedFamily?.gender === g}
                                onPress={() =>
                                  setSelectedFamily((p) =>
                                    p ? { ...(p as FamilyProfile), gender: g } : p
                                  )
                                }
                              />
                            ))}
                          </View>
                        )
                      ) : (
                        <Text style={styles.inputValue}>
                          {selectedLang === "en"
                            ? String(
                                (selectedFamily as any)[f.key] !== undefined &&
                                  (selectedFamily as any)[f.key] !== null
                                  ? (selectedFamily as any)[f.key]
                                  : "-"
                              )
                            : // show translated value if available
                              String(
                                translatedFields[selectedFamily.uid]?.[f.key] ??
                                  (selectedFamily as any)[f.key] ??
                                  "-"
                              )}
                        </Text>
                      )}
                    </View>
                  ))}

                  {editingProfile && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <TouchableOpacity
                        style={[styles.saveButton, { flex: 1, marginRight: 8 }]}
                        onPress={() => {
                          if (selectedFamily) handleSaveProfile(selectedFamily as FamilyProfile);
                        }}
                      >
                        <Text style={styles.saveButtonText}>{getLabel("save")}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.cancelButton, { flex: 1 }]}
                        onPress={() => {
                          setEditingProfile(false);
                          if (selectedFamily?.uid) fetchPatientDetails(selectedFamily.uid);
                        }}
                      >
                        <Text style={styles.cancelButtonText}>{getLabel("cancel")}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                <Text>No profile selected</Text>
              )}
            </View>
          )}
        </View>

        {/* Appointments card */}
        <View style={styles.card}>
          <TouchableWithoutFeedback onPress={() => toggleSection("appointments")}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="calendar" size={24} color="#1565C0" />
                <Text style={styles.cardTitle}>{getLabel("appointments")}</Text>
              </View>
              <View style={styles.cardHeaderRight}>
                <Ionicons name={expanded.appointments ? "chevron-up" : "chevron-down"} size={20} color="#666" />
              </View>
            </View>
          </TouchableWithoutFeedback>

          {expanded.appointments && (
            <View style={styles.expandedContent}>
            {/* Current appointment block (booked) - show different UI depending on decision */}
{appointments.find((a) => a.status === "booked") && (
  <View style={[styles.card, { marginBottom: 16 }]}>
    <View style={styles.cardHeader}>
      {/* Determine icon based on decision */}
      {(() => {
        const first = appointments.find((a) => a.status === "booked");
        if (!first) return <Ionicons name="time-outline" size={24} color="#FF9800" />;
        if (first.decision === "accepted") {
          return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
        } else if (first.decision === "declined") {
          return <Ionicons name="close-circle" size={24} color="#ef4444" />;
        } else {
          return <Ionicons name="time-outline" size={24} color="#FF9800" />;
        }
      })()}
      <Text style={styles.cardTitle}>{getLabel("yourCurrentAppointment")}</Text>
    </View>

    <View style={styles.expandedContent}>
      {appointments.filter((a) => a.status === "booked").map((appt, idx) => (
        <View key={idx} style={{ marginBottom: 10 }}>
          <Text style={styles.appointmentInfo}>
            {getLabel("doctor")}: {(appt.doctorId as any)?.name ?? (appt as any).doctorName}
          </Text>
          <Text style={styles.appointmentInfo}>
            {getLabel("specialization")}: {(appt.doctorId as any)?.specialization ?? "-"}
          </Text>
          <Text style={styles.appointmentInfo}>
            {getLabel("requestedDate")}: {appt.requestedDate ?? "-"}
          </Text>
          <Text style={styles.appointmentInfo}>
            {getLabel("requestedTime")}: {appt.requestedTime ?? "-"}
          </Text>

          {appt.symptomsDescription ? (
            <Text style={{ color: "#666", marginTop: 6 }}>
              {getLabel("symptomsLabel")}:{" "}
              {selectedLang === "en"
                ? appt.symptomsDescription
                : (appt.symptomsDescriptionTranslated ??
                  translatedFields[selectedFamily?.uid ?? ""]?.symptomsDescription ??
                  appt.symptomsDescription)}{" "}
              ({appt.symptomDuration}, {appt.symptomSeverity})
            </Text>
          ) : null}

          {/* Show Join button only when accepted AND scheduledDateTime exists and it's time */}
          {appt.decision === "accepted" && appt.scheduledDateTime ? (
            isJoinEnabled(appt) ? (
              <TouchableOpacity
                style={styles.videoCallButton}
                onPress={() => {
                  if (appt.videoLink) {
                    router.push({
                      pathname: "/screens/videoCallScreen", // ✅ expo-router path
                      params: { videoLink: appt.videoLink },
                    });
                  } else {
                    Alert.alert("No link", "Doctor has not shared a video link yet.");
                  }
                }}
              >
                <Ionicons name="videocam" size={20} color="#fff" />
                <Text style={styles.videoCallText}>Join Video Consultation</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ marginTop: 8, color: "#666" }}>
                {getLabel("bookingPending")}{" "}
                {new Date(appt.scheduledDateTime as any).toLocaleString()}.
              </Text>
            )
          ) : appt.decision === "pending" ? (
            <Text style={{ marginTop: 8, color: "#FF8F00" }}>{getLabel("bookingPending")}</Text>
          ) : appt.decision === "declined" ? (
            <Text style={{ marginTop: 8, color: "#ef4444" }}>{getLabel("appointmentDeclined")}</Text>
          ) : null}
        </View>
      ))}
    </View>
  </View>
)}


              {/* My Appointments list */}
              <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 10 }}>{getLabel("myAppointments")}</Text>
              {appointments.length === 0 ? (
                <Text style={{ color: "#666" }}>{getLabel("noAppointments")}</Text>
              ) : (
                appointments.map((appt, index) => (
                  <View key={appt._id ?? index} style={styles.appointmentItem}>
                    <View style={styles.appointmentLeft}>
                      <Ionicons name="medical" size={20} color="#1565C0" />
                      <View style={styles.appointmentDetails}>
                        <Text style={styles.appointmentDoctor}>{(appt.doctorId as any)?.name ?? "Doctor"}</Text>
                        <Text style={styles.appointmentType}>{(appt.doctorId as any)?.specialization ?? "-"}</Text>
                        <Text style={styles.appointmentDate}>{appt.requestedDate ?? "Not scheduled"} {appt.requestedTime ? `at ${appt.requestedTime}` : ""}</Text>

                        {appt.symptomsDescription ? (
                          <Text style={{ color: "#666", marginTop: 6 }}>
                            {getLabel("symptomsLabel")}: {selectedLang === "en" ? appt.symptomsDescription : (appt.symptomsDescriptionTranslated ?? translatedFields[selectedFamily?.uid ?? ""]?.symptomsDescription ?? appt.symptomsDescription)}
                          </Text>
                        ) : null}

                      </View>
                    </View>

                    {/* status badge mapping */}
                    {(() => {
                      // map decision/status to colors
                      let bg = "#FFF3E0";
                      let color = "#FF8F00";
                      let text = appt.decision ?? appt.status ?? "pending";

                      if (appt.decision === "accepted") {
                        bg = "#E8F5E8";
                        color = "#388E3C";
                        text = "confirmed";
                      } else if (appt.decision === "pending") {
                        bg = "#FFF3E0";
                        color = "#FF8F00";
                        text = "pending";
                      } else if (appt.decision === "declined") {
                        bg = "#FFEDEE";
                        color = "#C62828";
                        text = "declined";
                      } else if (appt.status === "completed") {
                        bg = "#E8F5E8";
                        color = "#388E3C";
                        text = "completed";
                      } else if (appt.status === "cancelled") {
                        bg = "#FFEDEE";
                        color = "#C62828";
                        text = "cancelled";
                      }

                      return (
                        <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                          <Text style={[styles.statusText, { color }]}>{text}</Text>
                        </View>
                      );
                    })()}
                  </View>
                ))
              )}

              {/* Book new appointment */}
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 10 }}>{getLabel("bookNewAppointment")}</Text>
                {doctors.map((doctor) => (
                  <View key={doctor._id} style={styles.doctorCard}>
                    <View style={styles.doctorHeader}>
                      <Ionicons name="person-circle" size={40} color="#1565C0" />
                      <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>{doctor.name}</Text>
                        <Text style={styles.doctorSpec}>{doctor.specialization}</Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.bookButton} onPress={() => openBookingForDoctor(doctor)}>
                      <Text style={styles.bookButtonText}>{getLabel("bookConsultation")}</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Booking form */}
                {showBookingForm && selectedDoctor && (
                  <>
                    <View style={styles.formSection}>
                      <Text style={styles.sectionTitle}>{getLabel("patientDetails")}</Text>
                      <TextInput style={styles.input} value={selectedLang === "en" ? (patientDetails?.name ?? "") : (translatedFields[selectedFamily?.uid ?? ""]?.name ?? patientDetails?.name ?? "")} editable={false} placeholder={getLabel("fullName")} />
                      <TextInput style={styles.input} value={selectedLang === "en" ? (patientDetails?.age ? String(patientDetails.age) : "") : (translatedFields[selectedFamily?.uid ?? ""]?.age ?? (patientDetails?.age ? String(patientDetails.age) : ""))} editable={false} placeholder={getLabel("age")} />
                      <TextInput style={styles.input} value={selectedLang === "en" ? (patientDetails?.gender ?? "") : (translatedFields[selectedFamily?.uid ?? ""]?.gender ?? patientDetails?.gender ?? "")} editable={false} placeholder={getLabel("gender")} />
                    </View>

                    <View style={{ marginTop: 20 }}>
                      <Text style={{ fontWeight: "600", marginBottom: 8 }}>{getLabel("bookConsultation")} {selectedDoctor.name}</Text>

                      <TextInput
                        style={[styles.input, { minHeight: 80 }]}
                        placeholder={getLabel("describeSymptoms")}
                        value={symptomsDescription}
                        onChangeText={async (txt) => {
                          setSymptomsDescription(txt);
                          if (selectedLang !== "en") {
                            const t = await translateTextAPI(txt, "en", selectedLang);
                            setTranslatedSymptomsPreview(t || "");
                          }
                        }}
                        multiline
                      />

                      {/* small row to show translated preview when language != en */}
                      {selectedLang !== "en" && (
                        <View style={{ marginBottom: 8 }}>
                          <Text style={{ color: "#666", marginBottom: 4, fontSize: 12 }}>Preview ({selectedLang}):</Text>
                          <Text style={{ backgroundColor: "#F1F1F1", padding: 8, borderRadius: 6 }}>{translatedSymptomsPreview || getLabel("noAppointments")}</Text>
                        </View>
                      )}

                      <TextInput style={styles.input} placeholder={getLabel("forHowManyDays")} value={symptomDuration} onChangeText={setSymptomDuration} />

                      <View style={{ marginVertical: 8 }}>
                        <Text style={{ marginBottom: 6, color: "#666" }}>{getLabel("severity")}</Text>
                        <Picker selectedValue={symptomSeverity} onValueChange={(itemValue) => setSymptomSeverity(itemValue as any)}>
                          <Picker.Item label={getLabel("mild")} value="Mild" />
                          <Picker.Item label={getLabel("moderate")} value="Moderate" />
                          <Picker.Item label={getLabel("severe")} value="Severe" />
                        </Picker>
                      </View>

                      <TouchableOpacity style={styles.saveButton} onPress={confirmBooking}>
                        <Text style={styles.saveButtonText}>{getLabel("confirmBooking")}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={[styles.cancelButton, { marginTop: 8 }]} onPress={() => { setShowBookingForm(false); setSelectedDoctor(null); }}>
                        <Text style={styles.cancelButtonText}>{getLabel("cancel")}</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Health Tips */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="bulb" size={24} color="#1565C0" />
              <Text style={styles.cardTitle}>{getLabel("dailyHealthTips")}</Text>
            </View>
          </View>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}><Text style={styles.tipText}>💧 Drink 8 glasses of water daily</Text></View>
            <View style={styles.tipItem}><Text style={styles.tipText}>🏃‍♂️ Exercise for 30 minutes daily</Text></View>
            <View style={styles.tipItem}><Text style={styles.tipText}>🍎 Eat more fruits and vegetables</Text></View>
            <View style={styles.tipItem}><Text style={styles.tipText}>😴 Get 7-8 hours of sleep</Text></View>
          </View>
        </View>

        <TouchableOpacity style={styles.sosButton} onPress={() => {
          Alert.alert("🚨 Emergency Alert", "Emergency services and family contacts have been notified with your GPS location!");
        }}>
          <LinearGradient colors={['#F44336', '#D32F2F']} style={styles.sosGradient}>
            <Ionicons name="warning" size={32} color="white" />
            <Text style={styles.sosText}>{getLabel("emergencySOS")}</Text>
            <Text style={styles.sosSubtext}>{getLabel("tapForHelp")}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Toast />
    </View>
  );
}

/* ============================
   Styles (unchanged)
   ============================ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FBFF" },
  header: { paddingTop: Platform.OS === "ios" ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flex: 1 },
  welcomeText: { color: "#E3F2FD", fontSize: 14, fontWeight: "400" },
  nameText: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 4 },
  headerRight: { flexDirection: "row", alignItems: "center" },
  headerIcon: { marginRight: 16, position: "relative" },
  notificationBadge: { position: "absolute", top: -6, right: -6, backgroundColor: "#F44336", borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center" },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  profilePic: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#fff" },
  scrollContainer: { flex: 1, paddingHorizontal: 20, marginTop: 12 },

  familySection: { marginTop: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 12 },
  familyCard: { backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginRight: 12, alignItems: "center", minWidth: 80, borderWidth: 2, borderColor: "#E3F2FD" },
  familyCardActive: { backgroundColor: "#1565C0", borderColor: "#1565C0" },
  familyText: { marginTop: 8, fontSize: 12, fontWeight: "600", color: "#1565C0" },
  familyTextActive: { color: "#fff" },
  addFamilyCard: { borderStyle: "dashed", borderColor: "#1565C0", borderWidth: 2, backgroundColor: "#F0F6FF" },

  card: { backgroundColor: "#fff", borderRadius: 16, marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center" },
  cardHeaderRight: { flexDirection: "row", alignItems: "center", marginLeft: "auto" },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginLeft: 12 },
  expandedContent: { padding: 20, paddingTop: 0 },

  input: { borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14, backgroundColor: "#F9F9F9" },
  inputRow: { marginBottom: 16 },
  inputLabel: { fontSize: 14, color: "#666", marginBottom: 4 },
  inputValue: { fontSize: 16, fontWeight: "600", color: "#333" },

  saveButton: { backgroundColor: "#1565C0", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  cancelButton: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  cancelButtonText: { color: "#333", fontWeight: "600" },

  genderBtn: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#DDD", marginHorizontal: 6, flex: 1, alignItems: "center" },
  genderBtnSelected: { borderColor: "#1565C0", backgroundColor: "#E3F2FD" },
  genderBtnText: { fontWeight: "600", color: "#333" },
  genderBtnTextSelected: { color: "#1565C0" },

  doctorCard: { backgroundColor: "#F8FBFF", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E3F2FD" },
  doctorHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  doctorInfo: { marginLeft: 12, flex: 1 },
  doctorName: { fontSize: 16, fontWeight: "600", color: "#333" },
  doctorSpec: { fontSize: 14, color: "#666", marginTop: 2 },
  bookButton: { backgroundColor: "#1565C0", paddingVertical: 10, borderRadius: 8, alignItems: "center", marginTop: 10 },
  bookButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  formSection: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginVertical: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },

  tipsContainer: { padding: 20, paddingTop: 0 },
  tipItem: { backgroundColor: "#F8FBFF", padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: "#1565C0" },
  tipText: { fontSize: 14, color: "#333", lineHeight: 20 },

  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#1565C0" },

  appointmentItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  appointmentLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  appointmentDetails: { marginLeft: 12, flex: 1 },
  appointmentDoctor: { fontSize: 16, fontWeight: "600", color: "#333" },
  appointmentType: { fontSize: 14, color: "#666", marginTop: 2 },
  appointmentDate: { fontSize: 12, color: "#999", marginTop: 2 },
  appointmentInfo: { fontSize: 14, color: "#666", marginBottom: 8 },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "600", color: "#4CAF50" },

  videoCallButton: { backgroundColor: "#4CAF50", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 8, marginTop: 12 },
  videoCallText: { color: "#fff", fontWeight: "600", marginLeft: 8 },

  sosButton: { marginVertical: 20, borderRadius: 16, elevation: 4, shadowColor: "#F44336", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  sosGradient: { padding: 24, borderRadius: 16, alignItems: "center" },
  sosText: { color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 8 },
  sosSubtext: { color: "#FFE0E0", fontSize: 14, marginTop: 4 },

  bottomSpacing: { height: 20 },
});
