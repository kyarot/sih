import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState, useRef } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Audio } from "expo-av";
import axios from "axios";
import { useTranslation } from "../../../components/TranslateProvider"; 

export type Doctor = {
  _id: string;
  name: string;
  specialization?: string;
  available?: string;
  rating?: number;
  experience?: string;
};

export type Appointment = {
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
};

type Props = {
  expanded: boolean;
  onToggle: () => void;
  appointments: Appointment[];
  isJoinEnabled: (appt: Appointment) => boolean;
  doctors: Doctor[];
  showBookingForm: boolean;
  selectedDoctor: Doctor | null;
  onOpenBooking: (doctor: Doctor) => void;
  patientDetails: { name?: string; age?: number | string; gender?: string } | null;
  symptomsDescription: string;
  setSymptomsDescription: (v: string) => void;
  symptomDuration: string;
  setSymptomDuration: (v: string) => void;
  symptomSeverity: "Mild" | "Moderate" | "Severe";
  setSymptomSeverity: (v: "Mild" | "Moderate" | "Severe") => void;
  onConfirmBooking: () => void;
  onCancelBooking: () => void;
  onNavigateToVideo: (videoLink: string) => void;
};

export default function AppointmentsSection({
  expanded,
  onToggle,
  appointments,
  isJoinEnabled,
  doctors,
  showBookingForm,
  selectedDoctor,
  onOpenBooking,
  patientDetails,
  symptomsDescription,
  setSymptomsDescription,
  symptomDuration,
  setSymptomDuration,
  symptomSeverity,
  setSymptomSeverity,
  onConfirmBooking,
  onCancelBooking,
  onNavigateToVideo,
}: Props) {
  const { t } = useTranslation();

  // Speech-to-text states
  const [recordingSymptoms, setRecordingSymptoms] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<Audio.Recording | null>(null);
  const recordingSymptomsRef = useRef<Audio.Recording | null>(null);
  const recordingDurationRef = useRef<Audio.Recording | null>(null);

  // Speech-to-text functions
  const startRecording = async (field: 'symptoms' | 'duration') => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      if (field === 'symptoms') {
        recordingSymptomsRef.current = recording;
        setRecordingSymptoms(recording);
      } else {
        recordingDurationRef.current = recording;
        setRecordingDuration(recording);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async (field: 'symptoms' | 'duration') => {
    try {
      const recordingRef = field === 'symptoms' ? recordingSymptomsRef.current : recordingDurationRef.current;
      
      if (!recordingRef) return;

      await recordingRef.stopAndUnloadAsync();
      const uri = recordingRef.getURI();

      if (!uri) return;

      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(",")[1];

        try {
          const res = await axios.post(
            "https://5aa83c1450d9.ngrok-free.app/api/speech/transcribe",
            { audio: base64Audio }
          );
          
          const transcription = res.data.transcription;
          
          if (field === 'symptoms') {
            const currentText = symptomsDescription;
            setSymptomsDescription(currentText ? `${currentText} ${transcription}` : transcription);
          } else {
            const currentText = symptomDuration;
            setSymptomDuration(currentText ? `${currentText} ${transcription}` : transcription);
          }
        } catch (err) {
          console.error('Transcription error:', err);
          Alert.alert('Error', 'Failed to transcribe audio');
        }
      };

      reader.readAsDataURL(blob);
      
      if (field === 'symptoms') {
        setRecordingSymptoms(null);
      } else {
        setRecordingDuration(null);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  return (
    <View style={styles.card}>
      <TouchableWithoutFeedback onPress={onToggle}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={22} color="white" />
            </View>
            <Text style={styles.title}>{t("appointments")}</Text>
          </View>
          <View style={styles.chevronContainer}>
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={22} color="white" />
          </View>
        </View>
      </TouchableWithoutFeedback>

      {expanded && (
        <View style={styles.content}>
          {/* Current Appointment */}
          {appointments.find((a) => a.status === "booked") && (
            <View style={styles.currentAppointment}>
              <View style={styles.currentHeader}>
                <View style={styles.statusIconContainer}>
                  {(() => {
                    const first = appointments.find((a) => a.status === "booked");
                    if (!first) return <Ionicons name="time-outline" size={18} color="white" />;
                    if (first.decision === "accepted") {
                      return <Ionicons name="checkmark-circle" size={18} color="white" />;
                    } else if (first.decision === "declined") {
                      return <Ionicons name="close-circle" size={18} color="white" />;
                    } else {
                      return <Ionicons name="time-outline" size={18} color="white" />;
                    }
                  })()}
                </View>
                <Text style={styles.currentTitle}>{t("current appointment")}</Text>
              </View>

              <View style={styles.currentContent}>
                {appointments
                  .filter((a) => a.status === "booked")
                  .map((appt, idx) => (
                    <View key={idx}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t("doctor")}</Text>
                        <Text style={styles.infoValue}>{(appt.doctorId as any)?.name ?? (appt as any).doctorName}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t("specialization")}</Text>
                        <Text style={styles.infoValue}>{(appt.doctorId as any)?.specialization ?? "-"}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t("date/time")}</Text>
                        <Text style={styles.infoValue}>
                          {appt.requestedDate ?? "-"} {appt.requestedTime ? `at ${appt.requestedTime}` : ""}
                        </Text>
                      </View>

                      {appt.symptomsDescription && (
                        <View style={styles.symptomsContainer}>
                          <Text style={styles.symptomsLabel}>{t("symptoms")}</Text>
                          <Text style={styles.symptomsText}>
                            {appt.symptomsDescription} • {appt.symptomDuration} • {appt.symptomSeverity}
                          </Text>
                        </View>
                      )}

                      {appt.decision === "accepted" && appt.scheduledDateTime ? (
                        isJoinEnabled(appt) ? (
                          <TouchableOpacity
                            style={styles.videoButton}
                            onPress={() => {
                              if (appt.videoLink) {
                                onNavigateToVideo(appt.videoLink);
                              } else {
                                Alert.alert(t("no link"), t("no link msg"));
                              }
                            }}
                          >
                            <Ionicons name="videocam" size={18} color="white" />
                            <Text style={styles.videoButtonText}>{t("join video")}</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.infoMessage}>
                            <Ionicons name="information-circle" size={14} color="#1E40AF" />
                            <Text style={styles.infoMessageText}>
                              Consultation confirmed for {new Date(appt.scheduledDateTime as any).toLocaleString()}
                            </Text>
                          </View>
                        )
                      ) : appt.decision === "pending" ? (
                        <View style={styles.pendingMessage}>
                          <Ionicons name="hourglass" size={14} color="#92400E" />
                          <Text style={styles.pendingMessageText}>Booking request pending approval</Text>
                        </View>
                      ) : appt.decision === "declined" ? (
                        <View style={styles.declinedMessage}>
                          <Ionicons name="close-circle" size={14} color="#B91C1C" />
                          <Text style={styles.declinedMessageText}>{t("appointment declined")}</Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
              </View>
            </View>
          )}

          {/* All Appointments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("my appointments")}</Text>
            {appointments.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={40} color="#E5E7EB" />
                <Text style={styles.emptyText}>{t("no appointments")}</Text>
              </View>
            ) : (
              <View style={styles.appointmentsList}>
                {appointments.map((appt, index) => (
                  <View key={appt._id ?? index} style={styles.appointmentItem}>
                    <View style={styles.appointmentLeft}>
                      <View style={styles.appointmentIcon}>
                        <Ionicons name="medical" size={18} color="white" />
                      </View>
                      <View style={styles.appointmentDetails}>
                        <Text style={styles.doctorName}>{(appt.doctorId as any)?.name ?? t("doctor")}</Text>
                        <Text style={styles.specialization}>{(appt.doctorId as any)?.specialization ?? "-"}</Text>
                        <Text style={styles.dateTime}>
                          {appt.requestedDate ?? t("not scheduled")}
                          {appt.requestedTime ? ` • ${appt.requestedTime}` : ""}
                        </Text>
                        {appt.symptomsDescription && (
                          <Text style={styles.symptoms} numberOfLines={1}>
                            {appt.symptomsDescription} • {appt.symptomDuration} • {appt.symptomSeverity}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            appt.decision === "accepted" || appt.status === "completed"
                              ? "#1E40AF"
                              : appt.decision === "pending"
                              ? "#F3F4F6"
                              : "#FEE2E2",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              appt.decision === "accepted" || appt.status === "completed"
                                ? "white"
                                : appt.decision === "pending"
                                ? "#1E40AF"
                                : "#B91C1C",
                          },
                        ]}
                      >
                        {appt.decision === "accepted"
                          ? t("confirmed")
                          : appt.decision === "pending"
                          ? t("pending")
                          : appt.decision === "declined"
                          ? t("declined")
                          : appt.status === "completed"
                          ? t("completed")
                          : appt.status === "cancelled"
                          ? t("cancelled")
                          : t("pending")}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Book New Appointment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("book new appointment")}</Text>
            <View style={styles.doctorsList}>
              {doctors.map((doctor) => (
                <View key={doctor._id} style={styles.doctorCard}>
                  <View style={styles.doctorHeader}>
                    <View style={styles.doctorAvatar}>
                      <Ionicons name="person" size={20} color="white" />
                    </View>
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>{doctor.name}</Text>
                      <Text style={styles.doctorSpec}>{doctor.specialization}</Text>
                    </View>
                    <TouchableOpacity style={styles.bookButton} onPress={() => onOpenBooking(doctor)}>
                      <Text style={styles.bookButtonText}>{t("book")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Booking Form */}
            {showBookingForm && selectedDoctor && (
              <View style={styles.bookingForm}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>
                    {t("booking with")} Dr. {selectedDoctor.name}
                  </Text>
                </View>

                <View style={styles.patientInfo}>
                  <Text style={styles.patientLabel}>{t("patient details")}</Text>
                  <View style={styles.patientGrid}>
                    <Text style={styles.patientDetail}>{patientDetails?.name ?? t("not provided")}</Text>
                    <Text style={styles.patientDetail}>
                      {t("age")}: {patientDetails?.age ? String(patientDetails.age) : t("not provided")}
                    </Text>
                    <Text style={styles.patientDetail}>
                      {t("gender")}: {patientDetails?.gender ?? t("not provided")}
                    </Text>
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>{t("describe symptoms")}</Text>
                  <View style={styles.inputWithMic}>
                    <TextInput
                      style={styles.textAreaWithMic}
                      placeholder={t("symptoms placeholder")}
                      value={symptomsDescription}
                      onChangeText={setSymptomsDescription}
                      multiline
                      numberOfLines={3}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity
                      style={[
                        styles.micButton,
                        recordingSymptoms && styles.micButtonRecording
                      ]}
                      onPress={() => recordingSymptoms ? stopRecording('symptoms') : startRecording('symptoms')}
                    >
                      <Ionicons 
                        name={recordingSymptoms ? "stop" : "mic"} 
                        size={16} 
                        color={recordingSymptoms ? "#B91C1C" : "#1E40AF"} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formFieldHalf}>
                    <Text style={styles.fieldLabel}>{t("duration")}</Text>
                    <View style={styles.inputWithMic}>
                      <TextInput
                        style={styles.inputWithMicField}
                        placeholder={t("duration placeholder")}
                        value={symptomDuration}
                        onChangeText={setSymptomDuration}
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        style={[
                          styles.micButton,
                          recordingDuration && styles.micButtonRecording
                        ]}
                        onPress={() => recordingDuration ? stopRecording('duration') : startRecording('duration')}
                      >
                        <Ionicons 
                          name={recordingDuration ? "stop" : "mic"} 
                          size={16} 
                          color={recordingDuration ? "#B91C1C" : "#1E40AF"} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.formFieldHalf}>
                    <Text style={styles.fieldLabel}>{t("severity")}</Text>
                    <View style={styles.pickerContainer}>
                      <Picker 
                        selectedValue={symptomSeverity} 
                        onValueChange={(itemValue) => setSymptomSeverity(itemValue as any)} 
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                      >
                        <Picker.Item label={t("mild")} value="Mild" />
                        <Picker.Item label={t("moderate")} value="Moderate" />
                        <Picker.Item label={t("severe")} value="Severe" />
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.confirmButton} onPress={onConfirmBooking}>
                    <Text style={styles.confirmButtonText}>{t("confirm booking")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={onCancelBooking}>
                    <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "white",
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  chevronContainer: {
    padding: 4,
  },
  content: {
    padding: 16,
  },

  // Current Appointment
  currentAppointment: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  currentHeader: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  statusIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  currentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  currentContent: {
    padding: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  infoValue: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
    letterSpacing: 0.1,
  },
  symptomsContainer: {
    backgroundColor: "white",
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  symptomsLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  symptomsText: {
    fontSize: 13,
    color: "#1E293B",
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  videoButton: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
  },
  videoButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 6,
    letterSpacing: 0.2,
  },
  infoMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  infoMessageText: {
    color: "#1E40AF",
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
    lineHeight: 15,
    letterSpacing: 0.1,
  },
  pendingMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  pendingMessageText: {
    color: "#92400E",
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
    lineHeight: 15,
    letterSpacing: 0.1,
  },
  declinedMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  declinedMessageText: {
    color: "#B91C1C",
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
    lineHeight: 15,
    letterSpacing: 0.1,
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 12,
    letterSpacing: 0.2,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 0.1,
  },

  // Appointments List
  appointmentsList: {
    gap: 10,
  },
  appointmentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  appointmentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  appointmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
  },
  appointmentDetails: {
    marginLeft: 10,
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 1,
    letterSpacing: 0.1,
  },
  specialization: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 1,
    letterSpacing: 0.1,
  },
  dateTime: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  symptoms: {
    fontSize: 11,
    color: "#64748B",
    fontStyle: "italic",
    letterSpacing: 0.1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  // Doctors List
  doctorsList: {
    gap: 10,
  },
  doctorCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  doctorHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
  },
  doctorInfo: {
    marginLeft: 10,
    flex: 1,
  },
  doctorSpec: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 1,
    letterSpacing: 0.1,
  },
  bookButton: {
    backgroundColor: "#1E40AF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bookButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.2,
  },

  // Booking Form
  bookingForm: {
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 12,
    overflow: "hidden",
  },
  formHeader: {
    backgroundColor: "#1E40AF",
    padding: 12,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
    letterSpacing: 0.2,
  },
  patientInfo: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  patientLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  patientGrid: {
    gap: 2,
  },
  patientDetail: {
    fontSize: 12,
    color: "#64748B",
    letterSpacing: 0.1,
  },
  formField: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  formFieldHalf: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    backgroundColor: "white",
    height: 40,
    letterSpacing: 0.1,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    backgroundColor: "white",
    minHeight: 80,
    textAlignVertical: "top",
    letterSpacing: 0.1,
  },
  inputWithMic: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    backgroundColor: "white",
    paddingRight: 4,
  },
  inputWithMicField: {
    flex: 1,
    padding: 10,
    fontSize: 13,
    height: 40,
    letterSpacing: 0.1,
  },
  textAreaWithMic: {
    flex: 1,
    padding: 10,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: "top",
    letterSpacing: 0.1,
  },
  micButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  micButtonRecording: {
    backgroundColor: "#FEE2E2",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    backgroundColor: "white",
    height: 40,
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    height: 40,
    marginVertical: -8,
  },
  pickerItem: {
    fontSize: 13,
    height: 40,
  },
  formActions: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  confirmButton: {
    backgroundColor: "#1E40AF",
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  cancelButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.2,
  },
});