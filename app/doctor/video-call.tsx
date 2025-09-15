import React, { useState } from "react";
import { Modal } from "react-native"; 
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from "react-native";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import PrescriptionForm from "./PrescriptionForm";

const VideoCallScreen = () => {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [notes, setNotes] = useState("");
  const [showPrescription, setShowPrescription] = useState(false);

  return (
    <View style={styles.container}>
      {/* Left: Video Section */}
      <View style={styles.videoSection}>
        {/* Patient Video */}
        <View style={styles.patientVideo}>
          <Text style={styles.videoText}>Patient Video</Text>
        </View>

        {/* Doctor's Own Video */}
        <View style={styles.doctorVideo}>
          <Text style={styles.videoText}>Your Video</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: micOn ? "green" : "red" }]}
            onPress={() => setMicOn(!micOn)}
          >
            <Ionicons name={micOn ? "mic" : "mic-off"} size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: camOn ? "green" : "red" }]}
            onPress={() => setCamOn(!camOn)}
          >
            <Ionicons name={camOn ? "videocam" : "videocam-off"} size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlBtn, { backgroundColor: "red" }]}>
            <MaterialIcons name="call-end" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Right: Patient Info + Chat + Notes */}
      <View style={styles.sidePanel}>
        {/* Patient Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Patient Details</Text>
          <Text>👤 Name: John Doe</Text>
          <Text>🎂 Age: 45</Text>
          <Text>🩺 Condition: Diabetes Follow-up</Text>
        </View>

        {/* Chat */}
        <ScrollView style={styles.chatSection}>
          <Text style={styles.sectionTitle}>💬 Chat</Text>
          <View style={styles.chatBubblePatient}>
            <Text>Patient: Hello Doctor!</Text>
          </View>
          <View style={styles.chatBubbleDoctor}>
            <Text>Doctor: Hello, how are you feeling?</Text>
          </View>
        </ScrollView>

        {/* Notes + Prescription */}
        <View style={styles.notesSection}>
  
  <TouchableOpacity
    style={styles.prescriptionBtn}
    onPress={() => setShowPrescription(true)}
  >
    <FontAwesome name="file-text" size={20} color="white" />
    <Text style={styles.prescriptionText}> Write Prescription</Text>
  </TouchableOpacity>

  {/* Inline scrollable Prescription Form */}
  {showPrescription && (
    <ScrollView style={{ maxHeight: 300, marginTop: 10 }}>
      <PrescriptionForm onClose={() => setShowPrescription(false)} doctorId={"64f1c2b9e5c2a3d123456789"} patientId={"64f1c2b9e5c2a3d987654321"} />
    </ScrollView>
  )}
</View>

      </View>
    </View>
  );
};

export default VideoCallScreen;

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: "#f2f2f2" },

  videoSection: { flex: 2, padding: 10 },
  patientVideo: {
    flex: 1,
    backgroundColor: "black",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  doctorVideo: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 120,
    height: 90,
    backgroundColor: "#444",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  videoText: { color: "white", fontSize: 16 },

  controls: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  controlBtn: {
    padding: 15,
    borderRadius: 50,
    marginHorizontal: 10,
  },

  sidePanel: {
    flex: 1,
    backgroundColor: "white",
    borderLeftWidth: 1,
    borderColor: "#ddd",
    padding: 10,
  },
  infoSection: { marginBottom: 10 },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },

  chatSection: { flex: 1, marginVertical: 5 },
  chatBubblePatient: {
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 10,
    marginVertical: 4,
    alignSelf: "flex-start",
  },
  chatBubbleDoctor: {
    backgroundColor: "#d1e7ff",
    padding: 8,
    borderRadius: 10,
    marginVertical: 4,
    alignSelf: "flex-end",
  },

  notesSection: { marginTop: 5 },
  notesInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    height: 70,
    marginBottom: 8,
  },
  prescriptionBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
  },
  prescriptionText: { color: "white", fontWeight: "bold" },
  prescriptionContainer: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 10,
  marginTop: 10,
  backgroundColor: "white",
  flexGrow: 0, // prevents expanding full screen
},

});