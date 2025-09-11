import React from "react";
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfilePage() {
  const doctor = {
    name: "Dr. Rajesh Kumar",
    specialization: "Cardiologist",
    experience: "12 years",
    bio: "Passionate about preventive cardiology and patient-centered care. Helping patients lead healthier lives with holistic treatments.",
    certifications: ["MBBS, MD - Cardiology", "FACC - Fellow of the American College of Cardiology"],
    hospital: "Apollo Hospitals, New Delhi",
    license: "IN-56789",
    languages: ["English", "Hindi", "Punjabi"],
    phone: "+91 98765 43210",
    email: "dr.rajesh@example.com",
    address: "Apollo Heart Center, Ring Road, New Delhi",
    availability: "Mon - Fri, 9:00 AM - 5:00 PM",
    rating: 4.8,
    patients: 1200,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=12" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{doctor.name}</Text>
        <Text style={styles.specialization}>{doctor.specialization}</Text>
        <Text style={styles.experience}>{doctor.experience} experience</Text>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.text}>{doctor.bio}</Text>
      </View>

      {/* Certifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        {doctor.certifications.map((cert, i) => (
          <Text key={i} style={styles.text}>• {cert}</Text>
        ))}
      </View>

      {/* Contact & Availability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact & Availability</Text>
        <Text style={styles.text}>🏥 {doctor.hospital}</Text>
        <Text style={styles.text}>📜 License: {doctor.license}</Text>
        <Text style={styles.text}>🌍 Languages: {doctor.languages.join(", ")}</Text>
        <Text style={styles.text}>📞 {doctor.phone}</Text>
        <Text style={styles.text}>📧 {doctor.email}</Text>
        <Text style={styles.text}>📍 {doctor.address}</Text>
        <Text style={styles.text}>🕒 {doctor.availability}</Text>
      </View>

      {/* Ratings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
        <Text style={styles.rating}>⭐ {doctor.rating} / 5.0</Text>
        <Text style={styles.text}>{doctor.patients}+ patients served</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.btnText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { alignItems: "center", marginBottom: 20 },
  avatar: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#E5E7EB"
  },
  name: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 4
  },
  specialization: { 
    fontSize: 18, 
    color: "#374151",
    textAlign: "center",
    marginBottom: 2
  },
  experience: { 
    fontSize: 14, 
    color: "#6B7280",
    textAlign: "center"
  },
  section: { 
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginBottom: 8, 
    color: "#1E40AF"
  },
  text: { 
    fontSize: 15, 
    color: "#374151", 
    marginBottom: 4,
    lineHeight: 20
  },
  rating: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#F59E0B",
    marginBottom: 4
  },
  buttonRow: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    marginTop: 20,
    marginBottom: 20
  },
  editBtn: { 
    backgroundColor: "#2563EB", 
    padding: 12, 
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center"
  },
  logoutBtn: { 
    backgroundColor: "#DC2626", 
    padding: 12, 
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center"
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "600",
    fontSize: 16
  },
});
