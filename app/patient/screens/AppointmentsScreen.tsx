import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState, useRef } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, ScrollView } from "react-native";
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

export default function AppointmentsScreen({
  onToggle,
  appointments = [], // Add default value
  isJoinEnabled,
  doctors = [], // Add default value
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
            "https://7300c4c894de.ngrok-free.app/api/speech/transcribe",
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

  // Safe check for appointments array
  const bookedAppointments = appointments ? appointments.filter((a) => a.status === "booked") : [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationButton}>
            <Ionicons name="location" size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.languageButton}>
            <Text style={styles.languageText}>English</Text>
            <Ionicons name="language" size={16} color="white" />
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerTitle}>
          <TouchableOpacity onPress={onToggle} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>APPOINTMENTS</Text>
          <View style={styles.calendarIcon}>
            <Ionicons name="calendar" size={24} color="white" />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Appointments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Appointments</Text>
          
          {bookedAppointments.length > 0 ? (
            bookedAppointments.map((appt, idx) => (
              <View key={idx} style={styles.currentAppointmentCard}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.doctorName}>
                    Doctor: {(appt.doctorId as any)?.name ?? (appt as any).doctorName}
                  </Text>
                  <TouchableOpacity 
                    style={[
                      styles.joinButton,
                      !isJoinEnabled(appt) && styles.joinButtonDisabled
                    ]}
                    onPress={() => {
                      if (appt.videoLink && isJoinEnabled(appt)) {
                        onNavigateToVideo(appt.videoLink);
                      } else {
                        Alert.alert(t("no link"), t("no link msg"));
                      }
                    }}
                    disabled={!isJoinEnabled(appt)}
                  >
                    <Text style={styles.joinButtonText}>
                      {isJoinEnabled(appt) ? "JOIN" : "WAITING"}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.specialization}>
                  Specialisation: {(appt.doctorId as any)?.specialization ?? "Physician"}
                </Text>
                <Text style={styles.scheduledTime}>
                  Scheduled at: {appt.requestedTime || "10:30am"}
                </Text>
                <Text style={styles.status}>
                  Status: {appt.decision === "accepted" ? "Confirmed" : "Pending"}
                </Text>
                <Text style={styles.symptoms}>
                  Symptoms: {appt.symptomsDescription || "fever and cold"}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyAppointment}>
              <Text style={styles.emptyText}>No current appointments</Text>
            </View>
          )}
        </View>

        {/* Book an Appointment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book an appointment</Text>
          
          {doctors.map((doctor) => (
            <View key={doctor._id} style={styles.doctorCard}>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorNameLarge}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
                
                {selectedDoctor?._id === doctor._id && (
                  <View style={styles.patientDetails}>
                    <Text style={styles.patientDetailsTitle}>patient details</Text>
                    <Text style={styles.patientDetailText}>
                      Name: {patientDetails?.name || "Sri"}
                    </Text>
                    <Text style={styles.patientDetailText}>
                      age: {patientDetails?.age || "13"}
                    </Text>
                    <Text style={styles.patientDetailText}>
                      gender: {patientDetails?.gender || "male"}
                    </Text>
                    
                    <Text style={styles.symptomsLabel}>symptoms:</Text>
                    <View style={styles.symptomsInputContainer}>
                      <TextInput
                        style={styles.symptomsInput}
                        placeholder="Describe your symptoms..."
                        value={symptomsDescription}
                        onChangeText={setSymptomsDescription}
                        multiline
                        numberOfLines={4}
                        placeholderTextColor="#B0B0B0"
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
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.bookButton} 
                onPress={() => onOpenBooking(doctor)}
              >
                <Text style={styles.bookButtonText}>BOOK</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Booking Form Modal */}
        {showBookingForm && selectedDoctor && (
          <View style={styles.bookingModal}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Booking with Dr. {selectedDoctor.name}
              </Text>
              
              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.fieldLabel}>Duration</Text>
                  <View style={styles.inputWithMic}>
                    <TextInput
                      style={styles.inputWithMicField}
                      placeholder="e.g., 2 days"
                      value={symptomDuration}
                      onChangeText={setSymptomDuration}
                      placeholderTextColor="#B0B0B0"
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
                  <Text style={styles.fieldLabel}>Severity</Text>
                  <View style={styles.pickerContainer}>
                    <Picker 
                      selectedValue={symptomSeverity} 
                      onValueChange={(itemValue) => setSymptomSeverity(itemValue as any)} 
                      style={styles.picker}
                    >
                      <Picker.Item label="Mild" value="Mild" />
                      <Picker.Item label="Moderate" value="Moderate" />
                      <Picker.Item label="Severe" value="Severe" />
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.confirmButton} onPress={onConfirmBooking}>
                  <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={onCancelBooking}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E3A8A",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  locationButton: {
    padding: 8,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  languageText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    letterSpacing: 1,
  },
  calendarIcon: {
    padding: 4,
  },
  content: {
    flex: 1,
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "white",
    marginBottom: 16,
  },
  currentAppointmentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    backdropFilter: "blur(10px)",
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    flex: 1,
  },
  joinButton: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  joinButtonText: {
    color: "#1E3A8A",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  specialization: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  scheduledTime: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  symptoms: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  emptyAppointment: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
  },
  doctorCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backdropFilter: "blur(10px)",
  },
  doctorInfo: {
    flex: 1,
    marginBottom: 16,
  },
  doctorNameLarge: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 16,
  },
  patientDetails: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  patientDetailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 8,
    textTransform: "lowercase",
  },
  patientDetailText: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 2,
  },
  symptomsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E3A8A",
    marginTop: 12,
    marginBottom: 8,
  },
  symptomsInputContainer: {
    position: "relative",
  },
  symptomsInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: "#374151",
    minHeight: 80,
    textAlignVertical: "top",
    paddingRight: 48,
  },
  micButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonRecording: {
    backgroundColor: "#FEE2E2",
  },
  bookButton: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-end",
  },
  bookButtonText: {
    color: "#1E3A8A",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  bookingModal: {
    position: "absolute",
    top: 0,
    left: -20,
    right: -20,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 20,
    textAlign: "center",
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  formFieldHalf: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputWithMic: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "white",
    paddingRight: 4,
  },
  inputWithMicField: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    height: 44,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "white",
    height: 44,
    justifyContent: "center",
  },
  picker: {
    height: 44,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  confirmButton: {
    backgroundColor: "#1E3A8A",
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
  },
});