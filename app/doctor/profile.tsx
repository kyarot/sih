import axios from "axios";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Doctor {
  name: string;
  specialization: string;
  experience: string;
  bio: string;
  certifications: string[];
  hospital: string;
  license: string;
  languages: string[];
  phone: string;
  email: string;
  address: string;
  rating: number;
  patients: number;
  availability: "online" | "offline";
}

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const doctorId = localStorage.getItem("doctorId"); // Fetch doctorId from localStorage

  useEffect(() => {
    fetchDoctor();
  }, []);

  const fetchDoctor = async () => {
    if (!doctorId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/doctors/${doctorId}`);
      setDoctor(res.data);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to fetch doctor profile");
    }
  };

  const handleSave = async () => {
    if (!doctor || !doctorId) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/doctors/${doctorId}`, doctor);
      setDoctor(res.data);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const addCertification = () => {
    if (!doctor) return;
    setDoctor({ ...doctor, certifications: [...doctor.certifications, ""] });
  };

  const removeCertification = (index: number) => {
    if (!doctor) return;
    const newCerts = [...doctor.certifications];
    newCerts.splice(index, 1);
    setDoctor({ ...doctor, certifications: newCerts });
  };

  if (!doctor) return <Text style={{ textAlign: "center", marginTop: 50 }}>Loading...</Text>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <TextInput
            style={styles.input}
            value={doctor.name}
            editable={isEditing}
            onChangeText={(text) => setDoctor({ ...doctor, name: text })}
            placeholder="Name"
          />
          <TextInput
            style={styles.input}
            value={doctor.specialization}
            editable={isEditing}
            onChangeText={(text) => setDoctor({ ...doctor, specialization: text })}
            placeholder="Specialization"
          />
          <TextInput
            style={styles.input}
            value={doctor.experience}
            editable={isEditing}
            onChangeText={(text) => setDoctor({ ...doctor, experience: text })}
            placeholder="Experience"
          />
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={doctor.bio}
            editable={isEditing}
            onChangeText={(text) => setDoctor({ ...doctor, bio: text })}
            placeholder="Bio"
            multiline
          />
        </View>

        {/* Certifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {doctor.certifications.map((cert, idx) => (
            <View key={idx} style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={cert}
                editable={isEditing}
                onChangeText={(text) => {
                  const newCerts = [...doctor.certifications];
                  newCerts[idx] = text;
                  setDoctor({ ...doctor, certifications: newCerts });
                }}
                placeholder="Certification"
              />
              {isEditing && (
                <TouchableOpacity onPress={() => removeCertification(idx)} style={{ marginLeft: 8 }}>
                  <Text style={{ color: "red", fontWeight: "bold" }}>X</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          {isEditing && (
            <TouchableOpacity onPress={addCertification} style={{ marginTop: 8 }}>
              <Text style={{ color: "#2563EB", fontWeight: "600" }}>+ Add Certification</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact & Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact & Info</Text>
          <TextInput
            style={styles.input}
            value={doctor.phone}
            editable={isEditing}
            keyboardType="phone-pad"
            onChangeText={(text) => setDoctor({ ...doctor, phone: text })}
            placeholder="Phone"
          />
          <TextInput
            style={styles.input}
            value={doctor.email}
            editable={isEditing}
            keyboardType="email-address"
            onChangeText={(text) => setDoctor({ ...doctor, email: text })}
            placeholder="Email"
          />
          <TextInput
            style={[styles.input, { height: 60 }]}
            value={doctor.address}
            editable={isEditing}
            multiline
            onChangeText={(text) => setDoctor({ ...doctor, address: text })}
            placeholder="Address"
          />
          <TextInput
            style={styles.input}
            value={doctor.hospital}
            editable={isEditing}
            onChangeText={(text) => setDoctor({ ...doctor, hospital: text })}
            placeholder="Hospital"
          />
          <TextInput
            style={styles.input}
            value={doctor.license}
            editable={isEditing}
            onChangeText={(text) => setDoctor({ ...doctor, license: text })}
            placeholder="License"
          />
          <TextInput
            style={styles.input}
            value={doctor.languages.join(", ")}
            editable={isEditing}
            onChangeText={(text) =>
              setDoctor({ ...doctor, languages: text.split(",").map((l) => l.trim()) })
            }
            placeholder="Languages (comma separated)"
          />
        </View>

        {/* Availability */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <Switch
            value={doctor.availability === "online"}
            onValueChange={(val) => setDoctor({ ...doctor, availability: val ? "online" : "offline" })}
            disabled={!isEditing}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          {isEditing ? (
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
              <Text style={styles.btnText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20 },
  section: { marginBottom: 20 },
  sectionRow: { marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
  buttonRow: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  editBtn: { backgroundColor: "#2563EB", padding: 12, borderRadius: 10, minWidth: 140, alignItems: "center" },
  saveBtn: { backgroundColor: "#16A34A", padding: 12, borderRadius: 10, minWidth: 140, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
