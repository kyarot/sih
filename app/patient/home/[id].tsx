import { useState, useEffect, useId } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

const API_BASE = "http://localhost:5000"; 

const { width } = Dimensions.get("window");

type SectionKey = "profile" | "appointments" | "records";

export default function PatientHome() {
  const [chat, setChat] = useState<{ type: "user" | "bot"; message: string }[]>([]);
  const [step, setStep] = useState(0);
  const [appointment, setAppointment] = useState<any>(null);
  const [selectedFamily, setSelectedFamily] = useState<any>(null);
  const [familyProfiles, setFamilyProfiles] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
const [showTimePicker, setShowTimePicker] = useState(false);
const [patientDetails, setPatientDetails] = useState<any>(null);

  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    profile: false,
    appointments: false,
    records: false,
  });
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);
const [appointments, setAppointments] = useState<any[]>([]);
const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
const [showBookingForm, setShowBookingForm] = useState(false);
const [appointmentDate, setAppointmentDate] = useState("");
const [appointmentTime, setAppointmentTime] = useState("");
const [notes, setNotes] = useState("");

  // inside your PatientHome component

const [newProfile, setNewProfile] = useState<any>({}); // for adding new
const [editing, setEditing] = useState(false); // whether editing existing profile
const [addingNew, setAddingNew] = useState(false); 



  // TODO: Replace with real accountId (from Firebase or context)
  const { id } = useLocalSearchParams();   // <-- get patient id from route
  const accountId = id as string;          // use this id for API calls

  useEffect(() => {
     
    const fetchFamilyProfiles = async () => {
      try {
const res = await axios.get(`${API_BASE}/api/patients/family/${accountId}`);
  setFamilyProfiles(res.data || []);
  setSelectedFamily(res.data?.[0] || null);
} catch (err) {
  console.error("Error fetching family profiles:", err);
  Alert.alert("Error", "Unable to load family profiles");
} finally {
  setLoading(false);
}

    };
    fetchFamilyProfiles();
  }, []);

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleMicPress = async () => {
    let newChat = [...chat];
    if (step === 0) {
      newChat.push({
        type: "bot",
        message:
          "Hello! I'm your AI health assistant. What symptoms are you experiencing?",
      });
    } else if (step === 1) {
      newChat.push({ type: "user", message: "I have fever and cough" });
      newChat.push({
        type: "bot",
        message:
          "Based on your symptoms, you may have flu-like symptoms. Here are some preventive measures:",
      });
      newChat.push({
        type: "bot",
        message: "• Drink warm fluids\n• Get plenty of rest\n• Try ginger tea\n• Monitor your temperature",
      });
      newChat.push({
        type: "bot",
        message: "Would you like to book an appointment with a doctor?",
      });
    } else if (step === 2) {
      newChat.push({ type: "user", message: "Yes, please book an appointment" });
      newChat.push({
        type: "bot",
        message: "I'll show you available doctors now...",
      });
    }
    setChat(newChat);
    setStep(step + 1);
  };
 const fetchPatientDetails = async () => {
  if (!selectedFamily?.uid) return;

  try {
    const res = await axios.get(`${API_BASE}/api/patients/profile/${selectedFamily.uid}`);
    setPatientDetails(res.data || {});   // now patientDetails has profile info
  } catch (err) {
    console.error("Error fetching patient details:", err);
  }
};

useEffect(() => {
  fetchPatientDetails();
}, [selectedFamily?.uid]);


  const sendMessage = () => {
    if (inputMessage.trim()) {
      setChat([...chat, { type: "user", message: inputMessage }]);
      setInputMessage("");
      setTimeout(() => {
        setChat((prev) => [
          ...prev,
          { type: "bot", message: "Thank you for your message. I'm analyzing your symptoms..." },
        ]);
      }, 1000);
    }
  };

  const handleBookDoctor = (doctor: any) => {
    setAppointment(doctor);
    Alert.alert(
      "Appointment Booked",
      `Successfully booked with ${doctor.name}\nTime: ${doctor.available}\nSpecialization: ${doctor.specialization}`
    );
  };

  const handleSOS = () => {
    Alert.alert(
      "🚨 Emergency Alert",
      "Emergency services and family contacts have been notified with your GPS location!",
      [{ text: "OK", style: "default" }]
    );
  };
useEffect(() => {
  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/doctors`);
      setDoctors(res.data);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };
  fetchDoctors();
}, []);

// fetch appointments
const fetchAppointments = async () => {
  if (!selectedFamily?.uid) return;

  try {
    const res = await axios.get(`${API_BASE}/api/appointments/${selectedFamily.uid}`);
    setAppointments(res.data || []);
  } catch (err) {
    console.error("Error fetching appointments:", err);
  }
};

useEffect(() => {
  fetchAppointments();
}, [selectedFamily?.uid]);


// handle booking
const handleConfirmBooking = async () => {
  if (!appointmentDate || !appointmentTime) {
    return Alert.alert("Error", "Please select date and time");
  }
  try {
    const res = await axios.post(`${API_BASE}/api/appointments`, {
      uid: selectedFamily?.uid,   // ✅ must be uid
      doctorId: selectedDoctor._id,
      date: appointmentDate,
      time: appointmentTime,
      notes,
    });

    Alert.alert("Success", "Appointment booked successfully");

    // Refresh appointments after booking
    fetchAppointments();
  } catch (err) {
    console.error("Error booking appointment:", err);
    Alert.alert("Error", "Failed to book appointment");
  }
};
useEffect(() => {
  if (selectedFamily) {
    setPatientDetails(selectedFamily);  // fill form immediately
  }
}, [selectedFamily]);

  // Dummy Data (unchanged)
  const docto = [
    { id: 1, name: "Dr. Mehta", specialization: "Cardiologist", available: "10:00 AM - 12:00 PM", rating: 4.8, experience: "15 years" },
    { id: 2, name: "Dr. Singh", specialization: "Dermatologist", available: "2:00 PM - 4:00 PM", rating: 4.6, experience: "12 years" },
    { id: 3, name: "Dr. Sharma", specialization: "General Physician", available: "5:00 PM - 7:00 PM", rating: 4.9, experience: "20 years" },
  ];
  const previousAppointments = [
    { doctor: "Dr. Sharma", date: "5th Aug 2025", type: "General Checkup", status: "Completed" },
    { doctor: "Dr. Singh", date: "20th July 2025", type: "Skin Consultation", status: "Completed" },
    { doctor: "Dr. Mehta", date: "15th June 2025", type: "Heart Checkup", status: "Completed" },
  ];
  const medicalRecords = [
    { condition: "Seasonal Flu", date: "March 2024", severity: "Mild", status: "Recovered" },
    { condition: "Food Allergy", date: "January 2024", severity: "Moderate", status: "Managed" },
    { condition: "Vitamin D Deficiency", date: "December 2023", severity: "Mild", status: "Treated" },
  ];
  const healthTips = [
    "💧 Drink 8 glasses of water daily",
    "🏃‍♂️ Exercise for 30 minutes daily",
    "🍎 Eat more fruits and vegetables",
    "😴 Get 7-8 hours of sleep",
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <LinearGradient colors={["#1565C0", "#1976D2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.nameText}>
              {selectedFamily ? selectedFamily.name : "Loading..."} 👋
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <Image
              source={{ uri: "https://via.placeholder.com/40x40/1565C0/ffffff?text=P" }}
              style={styles.profilePic}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Family Profiles */}
        <View style={styles.familySection}>
          <Text style={styles.sectionLabel}>Family Members</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {familyProfiles.map((profile) => (
    <TouchableOpacity
      key={profile._id}
      style={[
        styles.familyCard,
        selectedFamily?._id === profile._id && styles.familyCardActive,
      ]}
      onPress={() => setSelectedFamily(profile)}
    >
      <Ionicons
        name="person"
        size={24}
        color={selectedFamily?._id === profile._id ? "#fff" : "#1565C0"}
      />
      <Text
        style={[
          styles.familyText,
          selectedFamily?._id === profile._id && styles.familyTextActive,
        ]}
      >
        {profile.name}
      </Text>
    </TouchableOpacity>
  ))}

  {/* ➕ Add Profile Card */}
  {familyProfiles.length < 5 && (
  <TouchableOpacity
    style={[styles.familyCard, styles.addFamilyCard]}
    onPress={() => {
      setAddingNew(true);
      setEditing(false);
      setNewProfile({
        name: "",
        age: "",
        gender: "",
        email: "",
        phone: "",
        bloodGroup: "",
        address: "",
      });
    }}
  >
    <Ionicons name="add" size={28} color="#1565C0" />
    <Text style={styles.familyText}>Add</Text>
  </TouchableOpacity>
)}

</ScrollView>

        </View>

        {/* Profile Section */}
        <TouchableOpacity style={styles.card} onPress={() => toggleSection("profile")}>
         {/* Health Profile */}
<View style={styles.card}>
  <View style={styles.cardHeader}>
    <Ionicons name="person-circle" size={24} color="#1565C0" />
    <Text style={styles.cardTitle}>Health Profile</Text>
    {selectedFamily && !addingNew && (
      <TouchableOpacity onPress={() => setEditing(!editing)}>
        <Ionicons
          name={editing ? "close-outline" : "create-outline"}
          size={22}
          color="#1565C0"
        />
      </TouchableOpacity>
    )}
  </View>

  <View style={styles.expandedContent}>
    {selectedFamily && !addingNew ? (
      <>
        {[
          { key: "name", label: "Name" },
          { key: "age", label: "Age" },
          { key: "gender", label: "Gender" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "bloodGroup", label: "Blood Group" },
          { key: "address", label: "Address" },
        ].map((field) => (
          <View key={field.key} style={styles.inputRow}>
            <Text style={styles.inputLabel}>{field.label}</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={selectedFamily?.[field.key]?.toString() || ""}
                onChangeText={(text) =>
                  setSelectedFamily((prev: any) => ({
                    ...prev,
                    [field.key]: field.key === "age" ? parseInt(text) || "" : text,
                  }))
                }
              />
            ) : (
              <Text style={styles.inputValue}>{selectedFamily?.[field.key] || "-"}</Text>
            )}
          </View>
        ))}

        {editing && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={async () => {
              try {
                const res = await axios.put(
                  `http://localhost:5000/api/patients/profile/${selectedFamily.uid}`,
                  selectedFamily
                );
                setSelectedFamily(res.data.patient);
                setEditing(false);
                Alert.alert("Profile Updated", "Changes saved successfully.");
              } catch (err) {
                console.error(err);
                Alert.alert("Error", "Failed to update profile.");
              }
            }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}
      </>
    ) : addingNew ? (
      <>
        {/* New Profile Form */}
        <TextInput
          style={styles.input}
          placeholder="Name"
          onChangeText={(text) => setNewProfile({ ...newProfile, name: text })}
            accessibilityLabel="Patient Name"
  autoComplete="name"
  testID="patientName"
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          keyboardType="numeric"
          onChangeText={(text) => setNewProfile({ ...newProfile, age: parseInt(text) })}
        />
        <TextInput
          style={styles.input}
          placeholder="Gender"
          onChangeText={(text) => setNewProfile({ ...newProfile, gender: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={(text) => setNewProfile({ ...newProfile, email: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          keyboardType="phone-pad"
          onChangeText={(text) => setNewProfile({ ...newProfile, phone: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Blood Group"
          onChangeText={(text) => setNewProfile({ ...newProfile, bloodGroup: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          onChangeText={(text) => setNewProfile({ ...newProfile, address: text })}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={async () => {
            try {
              const res = await axios.post(
                "http://localhost:5000/api/patients/register-patient",
                {
                  ...newProfile,
                  uid: `UID${Date.now()}`, // generate temporary UID
                  code: `PAT-${Date.now()}`, // simple unique code
                  accountId, // same account for family grouping
                }
              );
              setFamilyProfiles([...familyProfiles, res.data.patient]);
              setAddingNew(false);
              setSelectedFamily(res.data.patient);
              Alert.alert("Profile Added", "New profile created successfully.");
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to add profile.");
            }
          }}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </>
    ) : (
      <Text>No profile selected</Text>
    )}
  </View>
</View>



        </TouchableOpacity>
      
       {/* 📅 Appointments Accordion */}
<TouchableOpacity style={styles.card} onPress={() => toggleSection("appointments")}>
  <View style={styles.cardHeader}>
    <View style={styles.cardHeaderLeft}>
      <Ionicons name="calendar" size={24} color="#1565C0" />
      <Text style={styles.cardTitle}>Appointments</Text>
    </View>
    <Ionicons
      name={expandedSections.appointments ? "chevron-up" : "chevron-down"}
      size={20}
      color="#666"
    />
  </View>

  {expandedSections.appointments && (
    <View style={styles.expandedContent}>

      {/* ✅ Current Appointment */}
      {appointments.find((appt: any) => appt.status === "booked") && (
        <View style={[styles.card, { marginBottom: 20 }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.cardTitle}>Your Current Appointment</Text>
          </View>
          <View style={styles.expandedContent}>
            {appointments
              .filter((appt: any) => appt.status === "booked")
              .map((appt: any, idx: number) => (
                <View key={idx}>
                  <Text style={styles.appointmentInfo}>Doctor: {appt.doctorId?.name}</Text>
                  <Text style={styles.appointmentInfo}>Specialization: {appt.doctorId?.specialization}</Text>
                  <Text style={styles.appointmentInfo}>Date: {appt.date}</Text>
                  <Text style={styles.appointmentInfo}>Time: {appt.time}</Text>
                  <TouchableOpacity style={styles.videoCallButton}>
                    <Ionicons name="videocam" size={20} color="white" />
                    <Text style={styles.videoCallText}>Join Video Consultation</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* ✅ My Appointments */}
      <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 10 }}>My Appointments</Text>
      {appointments.length === 0 ? (
        <Text style={{ color: "#666" }}>No appointments yet</Text>
      ) : (
        appointments.map((appt: any, index: number) => (
          <View key={index} style={styles.appointmentItem}>
            <View style={styles.appointmentLeft}>
              <Ionicons name="medical" size={20} color="#1565C0" />
              <View style={styles.appointmentDetails}>
                <Text style={styles.appointmentDoctor}>{appt.doctorId?.name}</Text>
                <Text style={styles.appointmentType}>{appt.doctorId?.specialization}</Text>
                <Text style={styles.appointmentDate}>{appt.date} at {appt.time}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: "#E8F5E8" }]}>
              <Text style={styles.statusText}>{appt.status}</Text>
            </View>
          </View>
        ))
      )}

      {/* ✅ Book New Appointment */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 10 }}>Book New Appointment</Text>

        {doctors.map((doctor: any) => (
          <View key={doctor._id} style={styles.doctorCard}>
            <View style={styles.doctorHeader}>
              <Ionicons name="person-circle" size={40} color="#1565C0" />
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpec}>{doctor.specialization}</Text>
              </View>
            </View>

            {/* ✅ Book Consultation button */}
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => {
                setSelectedDoctor(doctor);
                setShowBookingForm(true);
              }}
            >
              <Text style={styles.bookButtonText}>Book Consultation</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* ✅ Booking Form */}
        {showBookingForm && selectedDoctor && (
          <><View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Patient Details</Text>

                    {/* Name */}
                    <TextInput
  style={styles.input}
  value={patientDetails?.name || ""}
  editable={false}
  placeholder="Name"
  accessibilityLabel="Patient Name"
  autoComplete="name"   // 👈 helps with autofill
  testID="patientName"  // 👈 useful for testing
/>


                    {/* Age */}
                    <TextInput
                      style={styles.input}
                      value={patientDetails?.age?.toString() || ""}
                      editable={false}
                      placeholder="Age" />

                    {/* Gender */}
                    <TextInput
                      style={styles.input}
                      value={patientDetails?.gender}
                      editable={false}
                      placeholder="Gender" />
                  </View><View style={{ marginTop: 20 }}>
                      <Text style={{ fontWeight: "600", marginBottom: 8 }}>
                        Booking with {selectedDoctor.name}
                      </Text>

                      {/* Date Picker */}
                      <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text>{appointmentDate || "Select Date"}</Text>
                      </TouchableOpacity>
                      {showDatePicker && (
                        <DateTimePicker
                          value={appointmentDate ? new Date(appointmentDate) : new Date()}
                          mode="date"
                          display="default"
                          onChange={(_event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                              const formatted = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
                              setAppointmentDate(formatted);
                            }
                          } } />
                      )}
                      {/* Time Picker */}
                      <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowTimePicker(true)}
                      >
                        <Text>{appointmentTime || "Select Time"}</Text>
                      </TouchableOpacity>
                      {showTimePicker && (
                        <DateTimePicker
                          value={new Date()}
                          mode="time"
                          display="default"
                          onChange={(event, selectedTime) => {
                            setShowTimePicker(false);
                            if (selectedTime) {
                              const hours = selectedTime.getHours().toString().padStart(2, "0");
                              const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
                              setAppointmentTime(`${hours}:${minutes}`);
                            }
                          } } />
                      )}
                      <TextInput
                        style={styles.input}
                        placeholder="Notes (optional)"
                        value={notes}
                        onChangeText={setNotes} />

                      <TouchableOpacity style={styles.saveButton} onPress={handleConfirmBooking}>
                        <Text style={styles.saveButtonText}>Confirm Booking</Text>
                      </TouchableOpacity>
                    </View></>
        )}
      </View>
    </View>
  )}
</TouchableOpacity>



        {/* Health Tips */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="bulb" size={24} color="#1565C0" />
              <Text style={styles.cardTitle}>Daily Health Tips</Text>
            </View>
          </View>
          <View style={styles.tipsContainer}>
            {healthTips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* SOS Emergency Button */}
        <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
          <LinearGradient colors={['#F44336', '#D32F2F']} style={styles.sosGradient}>
            <Ionicons name="warning" size={32} color="white" />
            <Text style={styles.sosText}>Emergency SOS</Text>
            <Text style={styles.sosSubtext}>Tap for immediate help</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBFF",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    color: "#E3F2FD",
    fontSize: 14,
    fontWeight: "400",
  },
  nameText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: 16,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#F44336",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Family profiles
  familySection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  familyCard: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 12,
    alignItems: "center",
    minWidth: 80,
    borderWidth: 2,
    borderColor: "#E3F2FD",
  },
  familyCardActive: {
    backgroundColor: "#1565C0",
    borderColor: "#1565C0",
  },
    // Parent container for the booking form
  formSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // for Android shadow
  },

  // Section title like "Patient Details" or "Booking with Dr. XYZ"
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1565C0",
    marginBottom: 12,
  },

  familyText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#1565C0",
  },
  familyTextActive: {
    color: "#fff",
  },
  addFamilyCard: {
    borderStyle: "dashed",
    borderColor: "#1565C0",
    borderWidth: 2,
    backgroundColor: "#F0F6FF",
  },
  bookButton: {
  backgroundColor: "#1565C0",   // 🔹 deep blue
  paddingVertical: 10,
  borderRadius: 8,
  alignItems: "center",
  marginTop: 10,
},
bookButtonText: {
  color: "#fff",                // 🔹 white text
  fontWeight: "600",
  fontSize: 14,
},


  // Card container
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
  },
  expandedContent: {
    padding: 20,
    paddingTop: 0,
  },

  // ✅ Profile Form
  profileItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#F9F9F9",
  },
  saveButton: {
    backgroundColor: "#1565C0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
inputRow: {
  marginBottom: 16,
},
inputLabel: {
  fontSize: 14,
  color: "#666",
  marginBottom: 4,
},
inputValue: {
  fontSize: 16,
  fontWeight: "600",
  color: "#333",
},

  // ✅ keep your original styles below
  healthItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  healthDetails: { flex: 1, marginLeft: 12 },
  healthLabel: { fontSize: 14, color: "#666" },
  healthValue: { fontSize: 16, fontWeight: "600", color: "#333", marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "600", color: "#4CAF50" },
  appointmentItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  appointmentLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  appointmentDetails: { marginLeft: 12, flex: 1 },
  appointmentDoctor: { fontSize: 16, fontWeight: "600", color: "#333" },
  appointmentType: { fontSize: 14, color: "#666", marginTop: 2 },
  appointmentDate: { fontSize: 12, color: "#999", marginTop: 2 },
  recordItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  recordLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  recordDetails: { marginLeft: 12, flex: 1 },
  recordCondition: { fontSize: 16, fontWeight: "600", color: "#333" },
  recordDate: { fontSize: 14, color: "#666", marginTop: 2 },
  recordSeverity: { fontSize: 12, color: "#999", marginTop: 2 },
  chatContainer: { backgroundColor: "#fff", borderRadius: 16, marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  chatHeader: { flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  chatTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginLeft: 12, flex: 1 },
  onlineIndicator: { backgroundColor: "#4CAF50", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  onlineText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  chatMessages: { minHeight: 200, maxHeight: 400, padding: 20 },
  chatPlaceholder: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  placeholderText: { fontSize: 16, fontWeight: "600", color: "#666", marginTop: 16 },
  placeholderSubtext: { fontSize: 14, color: "#999", marginTop: 8, textAlign: "center" },
  messageContainer: { marginVertical: 8, maxWidth: "80%" },
  userMessage: { alignSelf: "flex-end" },
  botMessage: { alignSelf: "flex-start" },
  messageText: { padding: 12, borderRadius: 16, fontSize: 14, lineHeight: 20 },
  userMessageText: { backgroundColor: "#1565C0", color: "#fff", borderBottomRightRadius: 4 },
  botMessageText: { backgroundColor: "#F5F5F5", color: "#333", borderBottomLeftRadius: 4 },
  chatInput: { flexDirection: "row", alignItems: "flex-end", padding: 16, borderTopWidth: 1, borderTopColor: "#F5F5F5" },
  textInput: { flex: 1, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, fontSize: 14, marginRight: 8 },
  micButton: { backgroundColor: "#4CAF50", width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: 8 },
  sendButton: { backgroundColor: "#1565C0", width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  doctorsGrid: { padding: 20, paddingTop: 0 },
  doctorCard: { backgroundColor: "#F8FBFF", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E3F2FD" },
  doctorHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  doctorInfo: { marginLeft: 12, flex: 1 },
  doctorName: { fontSize: 16, fontWeight: "600", color: "#333" },
  doctorSpec: { fontSize: 14, color: "#666", marginTop: 2 },
  ratingContainer: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  rating: { fontSize: 12, color: "#666", marginLeft: 4 },
  doctorDetails: { marginBottom: 12 },
  availability: { fontSize: 14, color: "#666" },
  experience: { fontSize: 12, color: "#999", marginTop: 2 },

  appointmentInfo: { fontSize: 14, color: "#666", marginBottom: 8 },
  videoCallButton: { backgroundColor: "#4CAF50", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 8, marginTop: 12 },
  videoCallText: { color: "#fff", fontWeight: "600", marginLeft: 8 },
  tipsContainer: { padding: 20, paddingTop: 0 },
  tipItem: { backgroundColor: "#F8FBFF", padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: "#1565C0" },
  tipText: { fontSize: 14, color: "#333", lineHeight: 20 },
  sosButton: { marginVertical: 20, borderRadius: 16, elevation: 4, shadowColor: "#F44336", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  sosGradient: { padding: 24, borderRadius: 16, alignItems: "center" },
  sosText: { color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 8 },
  sosSubtext: { color: "#FFE0E0", fontSize: 14, marginTop: 4 },
  bottomSpacing: { height: 20 },
});
