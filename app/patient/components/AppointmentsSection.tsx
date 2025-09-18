import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

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

export default function AppointmentsSection({ expanded, onToggle, appointments, isJoinEnabled, doctors, showBookingForm, selectedDoctor, onOpenBooking, patientDetails, symptomsDescription, setSymptomsDescription, symptomDuration, setSymptomDuration, symptomSeverity, setSymptomSeverity, onConfirmBooking, onCancelBooking, onNavigateToVideo }: Props) {
  return (
    <View style={styles.card}>
      <TouchableWithoutFeedback onPress={onToggle}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={24} color="white" />
            </View>
            <Text style={styles.title}>Appointments</Text>
          </View>
          <View style={styles.chevronContainer}>
            <Ionicons 
              name={expanded ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="white" 
            />
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
                    if (!first) return <Ionicons name="time-outline" size={20} color="white" />;
                    if (first.decision === "accepted") {
                      return <Ionicons name="checkmark-circle" size={20} color="white" />;
                    } else if (first.decision === "declined") {
                      return <Ionicons name="close-circle" size={20} color="white" />;
                    } else {
                      return <Ionicons name="time-outline" size={20} color="white" />;
                    }
                  })()}
                </View>
                <Text style={styles.currentTitle}>Current Appointment</Text>
              </View>

              <View style={styles.currentContent}>
                {appointments.filter((a) => a.status === "booked").map((appt, idx) => (
                  <View key={idx}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Doctor</Text>
                      <Text style={styles.infoValue}>{(appt.doctorId as any)?.name ?? (appt as any).doctorName}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Specialization</Text>
                      <Text style={styles.infoValue}>{(appt.doctorId as any)?.specialization ?? "-"}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Date & Time</Text>
                      <Text style={styles.infoValue}>{appt.requestedDate ?? "-"} {appt.requestedTime ? `at ${appt.requestedTime}` : ""}</Text>
                    </View>

                    {appt.symptomsDescription && (
                      <View style={styles.symptomsContainer}>
                        <Text style={styles.symptomsLabel}>Symptoms</Text>
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
                              Alert.alert("No link", "Doctor has not shared a video link yet.");
                            }
                          }}
                        >
                          <Ionicons name="videocam" size={20} color="white" />
                          <Text style={styles.videoButtonText}>Join Video Consultation</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.infoMessage}>
                          <Ionicons name="information-circle" size={16} color="#1E40AF" />
                          <Text style={styles.infoMessageText}>
                            Consultation confirmed for {new Date(appt.scheduledDateTime as any).toLocaleString()}. Join will be enabled at scheduled time.
                          </Text>
                        </View>
                      )
                    ) : appt.decision === "pending" ? (
                      <View style={styles.pendingMessage}>
                        <Ionicons name="hourglass" size={16} color="#1E40AF" />
                        <Text style={styles.pendingMessageText}>Booking pending - doctor will accept and schedule date/time.</Text>
                      </View>
                    ) : appt.decision === "declined" ? (
                      <View style={styles.declinedMessage}>
                        <Ionicons name="close-circle" size={16} color="#B91C1C" />
                        <Text style={styles.declinedMessageText}>Appointment was declined by the doctor.</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* All Appointments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Appointments</Text>
            {appointments.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#E5E7EB" />
                <Text style={styles.emptyText}>No appointments yet</Text>
              </View>
            ) : (
              <View style={styles.appointmentsList}>
                {appointments.map((appt, index) => (
                  <View key={appt._id ?? index} style={styles.appointmentItem}>
                    <View style={styles.appointmentLeft}>
                      <View style={styles.appointmentIcon}>
                        <Ionicons name="medical" size={20} color="white" />
                      </View>
                      <View style={styles.appointmentDetails}>
                        <Text style={styles.doctorName}>{(appt.doctorId as any)?.name ?? "Doctor"}</Text>
                        <Text style={styles.specialization}>{(appt.doctorId as any)?.specialization ?? "-"}</Text>
                        <Text style={styles.dateTime}>
                          {appt.requestedDate ?? "Not scheduled"} 
                          {appt.requestedTime ? ` • ${appt.requestedTime}` : ""}
                        </Text>
                        {appt.symptomsDescription && (
                          <Text style={styles.symptoms}>
                            {appt.symptomsDescription} • {appt.symptomDuration} • {appt.symptomSeverity}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={[styles.statusBadge, {
                      backgroundColor: appt.decision === "accepted" || appt.status === "completed" ? "#1E40AF" :
                                     appt.decision === "pending" ? "#E5E7EB" :
                                     "#FEE2E2"
                    }]}>
                      <Text style={[styles.statusText, {
                        color: appt.decision === "accepted" || appt.status === "completed" ? "white" :
                               appt.decision === "pending" ? "#1E40AF" :
                               "#B91C1C"
                      }]}>
                        {appt.decision === "accepted" ? "confirmed" :
                         appt.decision === "pending" ? "pending" :
                         appt.decision === "declined" ? "declined" :
                         appt.status === "completed" ? "completed" :
                         appt.status === "cancelled" ? "cancelled" :
                         "pending"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Book New Appointment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Book New Appointment</Text>
            <View style={styles.doctorsList}>
              {doctors.map((doctor) => (
                <View key={doctor._id} style={styles.doctorCard}>
                  <View style={styles.doctorHeader}>
                    <View style={styles.doctorAvatar}>
                      <Ionicons name="person" size={24} color="white" />
                    </View>
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>{doctor.name}</Text>
                      <Text style={styles.doctorSpec}>{doctor.specialization}</Text>
                    </View>
                    <TouchableOpacity style={styles.bookButton} onPress={() => onOpenBooking(doctor)}>
                      <Text style={styles.bookButtonText}>Book</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Booking Form */}
            {showBookingForm && selectedDoctor && (
              <View style={styles.bookingForm}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Booking with Dr. {selectedDoctor.name}</Text>
                </View>

                <View style={styles.patientInfo}>
                  <Text style={styles.patientLabel}>Patient Details</Text>
                  <Text style={styles.patientDetail}>{patientDetails?.name ?? "Not provided"}</Text>
                  <Text style={styles.patientDetail}>Age: {patientDetails?.age ? String(patientDetails.age) : "Not provided"}</Text>
                  <Text style={styles.patientDetail}>Gender: {patientDetails?.gender ?? "Not provided"}</Text>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Describe your symptoms</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Please describe your symptoms in detail..."
                    value={symptomsDescription}
                    onChangeText={setSymptomsDescription}
                    multiline
                    numberOfLines={4}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Duration</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 2 days, 1 week"
                    value={symptomDuration}
                    onChangeText={setSymptomDuration}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.formField}>
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

                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.confirmButton} onPress={onConfirmBooking}>
                    <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={onCancelBooking}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
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
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginLeft: 12,
  },
  chevronContainer: {
    padding: 4,
  },
  content: {
    padding: 20,
  },

  // Current Appointment
  currentAppointment: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  currentHeader: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  statusIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  currentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 12,
  },
  currentContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  symptomsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  symptomsLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  symptomsText: {
    fontSize: 14,
    color: "#1E293B",
    lineHeight: 20,
  },
  videoButton: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  videoButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
  infoMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoMessageText: {
    color: "#1E40AF",
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  pendingMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  pendingMessageText: {
    color: "#92400E",
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  declinedMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  declinedMessageText: {
    color: "#B91C1C",
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 8,
  },

  // Appointments List
  appointmentsList: {
    gap: 12,
  },
  appointmentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  appointmentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  appointmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
  },
  appointmentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  specialization: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  dateTime: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 4,
  },
  symptoms: {
    fontSize: 12,
    color: "#64748B",
    fontStyle: "italic",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  // Doctors List
  doctorsList: {
    gap: 12,
  },
  doctorCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  doctorHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
  },
  doctorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  doctorSpec: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: "#1E40AF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  // Booking Form
  bookingForm: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 16,
  },
  formHeader: {
    backgroundColor: "#1E40AF",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  patientInfo: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  patientLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  patientDetail: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  formField: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "white",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "white",
    minHeight: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "white",
  },
  picker: {
    height: 50,
  },
  formActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  confirmButton: {
    backgroundColor: "#1E40AF",
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
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 16,
  },
});