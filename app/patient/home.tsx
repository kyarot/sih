import { useState } from "react";
import { Stack} from "expo-router";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type SectionKey = 'health' | 'appointments' | 'records';

export default function PatientHome() {
  const [chat, setChat] = useState<{ type: 'user' | 'bot'; message: string }[]>([]);
  const [step, setStep] = useState(0);
  const [appointment, setAppointment] = useState<any>(null);
  const [selectedFamily, setSelectedFamily] = useState("You");
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    health: false,
    appointments: false,
    records: false,
  });
  const [inputMessage, setInputMessage] = useState("");

  // Demo doctors
  const doctors = [
    { 
      id: 1, 
      name: "Dr. Mehta", 
      specialization: "Cardiologist", 
      available: "10:00 AM - 12:00 PM",
      rating: 4.8,
      experience: "15 years"
    },
    { 
      id: 2, 
      name: "Dr. Singh", 
      specialization: "Dermatologist", 
      available: "2:00 PM - 4:00 PM",
      rating: 4.6,
      experience: "12 years"
    },
    { 
      id: 3, 
      name: "Dr. Sharma", 
      specialization: "General Physician", 
      available: "5:00 PM - 7:00 PM",
      rating: 4.9,
      experience: "20 years"
    },
  ];

  // Demo family profiles
  const familyProfiles = [
    { name: "You", icon: "person" },
    { name: "Father", icon: "man" },
    { name: "Mother", icon: "woman" },
    { name: "Child", icon: "happy" },
  ];

  // Health data
  const healthData = [
    { label: "Blood Pressure", value: "120/80 mmHg", status: "normal", icon: "heart" },
    { label: "Heart Rate", value: "76 bpm", status: "normal", icon: "pulse" },
    { label: "Temperature", value: "98.6°F", status: "normal", icon: "thermometer" },
    { label: "Weight", value: "70 kg", status: "normal", icon: "fitness" },
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

  const toggleSection = (section: SectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleMicPress = async () => {
    let newChat = [...chat];
    if (step === 0) {
      newChat.push({ type: 'bot', message: "Hello! I'm your AI health assistant. What symptoms are you experiencing?" });
    } else if (step === 1) {
      newChat.push({ type: 'user', message: "I have fever and cough" });
      newChat.push({ type: 'bot', message: "Based on your symptoms, you may have flu-like symptoms. Here are some preventive measures:" });
      newChat.push({ type: 'bot', message: "• Drink warm fluids\n• Get plenty of rest\n• Try ginger tea\n• Monitor your temperature" });
      newChat.push({ type: 'bot', message: "Would you like to book an appointment with a doctor?" });
    } else if (step === 2) {
      newChat.push({ type: 'user', message: "Yes, please book an appointment" });
      newChat.push({ type: 'bot', message: "I'll show you available doctors now..." });
    }
    setChat(newChat);
    setStep(step + 1);
  };

  const sendMessage = () => {
    if (inputMessage.trim()) {
      setChat([...chat, { type: 'user', message: inputMessage }]);
      setInputMessage("");
      // Simulate AI response
      setTimeout(() => {
        setChat(prev => [...prev, { type: 'bot', message: "Thank you for your message. I'm analyzing your symptoms..." }]);
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

  return (
    <View style={styles.container}>
         <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <LinearGradient colors={['#1565C0', '#1976D2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.nameText}>{selectedFamily} 👋</Text>
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
                key={profile.name}
                style={[
                  styles.familyCard,
                  selectedFamily === profile.name && styles.familyCardActive,
                ]}
                onPress={() => setSelectedFamily(profile.name)}
              >
                <Ionicons 
                  name={profile.icon as any} 
                  size={24} 
                  color={selectedFamily === profile.name ? "#fff" : "#1565C0"} 
                />
                <Text style={[
                  styles.familyText,
                  selectedFamily === profile.name && styles.familyTextActive
                ]}>
                  {profile.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Health Overview Card */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => toggleSection('health')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="heart" size={24} color="#1565C0" />
              <Text style={styles.cardTitle}>Health Overview</Text>
            </View>
            <Ionicons 
              name={expandedSections.health ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </View>
          {expandedSections.health && (
            <View style={styles.expandedContent}>
              {healthData.map((item, index) => (
                <View key={index} style={styles.healthItem}>
                  <Ionicons name={item.icon as any} size={20} color="#1565C0" />
                  <View style={styles.healthDetails}>
                    <Text style={styles.healthLabel}>{item.label}</Text>
                    <Text style={styles.healthValue}>{item.value}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: '#E8F5E8' }]}>
                    <Text style={styles.statusText}>Normal</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Previous Appointments Card */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => toggleSection('appointments')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="calendar" size={24} color="#1565C0" />
              <Text style={styles.cardTitle}>Previous Appointments</Text>
            </View>
            <Ionicons 
              name={expandedSections.appointments ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </View>
          {expandedSections.appointments && (
            <View style={styles.expandedContent}>
              {previousAppointments.map((appointment, index) => (
                <View key={index} style={styles.appointmentItem}>
                  <View style={styles.appointmentLeft}>
                    <Ionicons name="medical" size={20} color="#1565C0" />
                    <View style={styles.appointmentDetails}>
                      <Text style={styles.appointmentDoctor}>{appointment.doctor}</Text>
                      <Text style={styles.appointmentType}>{appointment.type}</Text>
                      <Text style={styles.appointmentDate}>{appointment.date}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: '#E8F5E8' }]}>
                    <Text style={styles.statusText}>{appointment.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Medical Records Card */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => toggleSection('records')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="document-text" size={24} color="#1565C0" />
              <Text style={styles.cardTitle}>Medical History</Text>
            </View>
            <Ionicons 
              name={expandedSections.records ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </View>
          {expandedSections.records && (
            <View style={styles.expandedContent}>
              {medicalRecords.map((record, index) => (
                <View key={index} style={styles.recordItem}>
                  <View style={styles.recordLeft}>
                    <Ionicons name="medical-outline" size={20} color="#1565C0" />
                    <View style={styles.recordDetails}>
                      <Text style={styles.recordCondition}>{record.condition}</Text>
                      <Text style={styles.recordDate}>{record.date}</Text>
                      <Text style={styles.recordSeverity}>Severity: {record.severity}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: '#E8F5E8' }]}>
                    <Text style={styles.statusText}>{record.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* AI Chat Interface */}
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <Ionicons name="chatbubbles" size={24} color="#1565C0" />
            <Text style={styles.chatTitle}>AI Health Assistant</Text>
            <View style={styles.onlineIndicator}>
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
          
          <View style={styles.chatMessages}>
            {chat.length === 0 ? (
              <View style={styles.chatPlaceholder}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color="#ccc" />
                <Text style={styles.placeholderText}>Start a conversation with AI</Text>
                <Text style={styles.placeholderSubtext}>Describe your symptoms or ask health questions</Text>
              </View>
            ) : (
              chat.map((msg, index) => (
                <View key={index} style={[
                  styles.messageContainer,
                  msg.type === 'user' ? styles.userMessage : styles.botMessage
                ]}>
                  <Text style={[
                    styles.messageText,
                    msg.type === 'user' ? styles.userMessageText : styles.botMessageText
                  ]}>
                    {msg.message}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Chat Input */}
          <View style={styles.chatInput}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
            />
            <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
              <Ionicons name="mic" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Available Doctors */}
        {step >= 2 && !appointment && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="people" size={24} color="#1565C0" />
                <Text style={styles.cardTitle}>Available Doctors</Text>
              </View>
            </View>
            <View style={styles.doctorsGrid}>
              {doctors.map((doctor) => (
                <TouchableOpacity
                  key={doctor.id}
                  style={styles.doctorCard}
                  onPress={() => handleBookDoctor(doctor)}
                >
                  <View style={styles.doctorHeader}>
                    <Ionicons name="person-circle" size={40} color="#1565C0" />
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>{doctor.name}</Text>
                      <Text style={styles.doctorSpec}>{doctor.specialization}</Text>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.rating}>{doctor.rating}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.doctorDetails}>
                    <Text style={styles.availability}>Available: {doctor.available}</Text>
                    <Text style={styles.experience}>{doctor.experience} experience</Text>
                  </View>
                  <LinearGradient colors={['#1565C0', '#1976D2']} style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>Book Appointment</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Current Appointment */}
        {appointment && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.cardTitle}>Your Appointment</Text>
              </View>
            </View>
            <View style={styles.appointmentDetails}>
              <Text style={styles.appointmentInfo}>Doctor: {appointment.name}</Text>
              <Text style={styles.appointmentInfo}>Specialization: {appointment.specialization}</Text>
              <Text style={styles.appointmentInfo}>Time: {appointment.available}</Text>
              <TouchableOpacity style={styles.videoCallButton}>
                <Ionicons name="videocam" size={20} color="white" />
                <Text style={styles.videoCallText}>Join Video Consultation</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
  familyText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#1565C0",
  },
  familyTextActive: {
    color: "#fff",
  },
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
  healthItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  healthDetails: {
    flex: 1,
    marginLeft: 12,
  },
  healthLabel: {
    fontSize: 14,
    color: "#666",
  },
  healthValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
  appointmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  appointmentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  appointmentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  appointmentType: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  appointmentDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  recordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  recordLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recordDetails: {
    marginLeft: 12,
    flex: 1,
  },
  recordCondition: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  recordDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  recordSeverity: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  chatContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  onlineIndicator: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  chatMessages: {
    minHeight: 200,
    maxHeight: 400,
    padding: 20,
  },
  chatPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  messageContainer: {
    marginVertical: 8,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  botMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    padding: 12,
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    backgroundColor: "#1565C0",
    color: "#fff",
    borderBottomRightRadius: 4,
  },
  botMessageText: {
    backgroundColor: "#F5F5F5",
    color: "#333",
    borderBottomLeftRadius: 4,
  },
  chatInput: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    marginRight: 8,
  },
  micButton: {
    backgroundColor: "#4CAF50",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#1565C0",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  doctorsGrid: {
    padding: 20,
    paddingTop: 0,
  },
  doctorCard: {
    backgroundColor: "#F8FBFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E3F2FD",
  },
  doctorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  doctorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  doctorSpec: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  doctorDetails: {
    marginBottom: 12,
  },
  availability: {
    fontSize: 14,
    color: "#666",
  },
  experience: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  bookButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  appointmentInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  videoCallButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  videoCallText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  tipsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  tipItem: {
    backgroundColor: "#F8FBFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#1565C0",
  },
  tipText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  sosButton: {
    marginVertical: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#F44336",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sosGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  sosText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  sosSubtext: {
    color: "#FFE0E0",
    fontSize: 14,
    marginTop: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});