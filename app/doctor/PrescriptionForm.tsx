import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import CheckBox from "react-native-check-box";
import axios from "axios";

interface Medicine {
  name: string;
  quantity: string;
  dosage: string;
  duration: string;
  instructions: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
}

const PrescriptionForm = ({
  onClose,
  doctorId,
  patientId,
}: {
  onClose: () => void;
  doctorId: string;
  patientId: string;
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        quantity: "",
        dosage: "",
        duration: "",
        instructions: "",
        morning: false,
        afternoon: false,
        night: false,
      },
    ]);
  };

  const updateMedicine = (
    index: number,
    field: keyof Medicine,
    value: string | boolean
  ) => {
    const newMeds = [...medicines];
    newMeds[index][field] = value as never;
    setMedicines(newMeds);
  };

  const removeMedicine = (index: number) => {
    const newMeds = medicines.filter((_, i) => i !== index);
    setMedicines(newMeds);
  };

  const canGenerate =
    medicines.length > 0 &&
    medicines.every(
      (med) => med.name && med.quantity && med.dosage && med.duration
    );

  const generatePrescription = async () => {
    if (!canGenerate) {
      Alert.alert(
        "Error",
        "Please fill all required fields for every medicine."
      );
      return;
    }

    try {
      // Send data to backend
      const response = await axios.post(
        "http://localhost:5000/api/prescriptions/",
        {
          doctorId,
          patientId,
          medicines,
        }
      );

      if (response.data) {
        Alert.alert("Success", "Prescription saved successfully!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save prescription. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Prescription Form</Text>

        {medicines.map((med, index) => (
          <View key={index} style={styles.medicineCard}>
            <TextInput
              style={styles.input}
              placeholder="Medicine Name"
              value={med.name}
              onChangeText={(text) => updateMedicine(index, "name", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              keyboardType="numeric"
              value={med.quantity}
              onChangeText={(text) =>
                updateMedicine(index, "quantity", text.replace(/[^0-9]/g, ""))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Dosage"
              keyboardType="numeric"
              value={med.dosage}
              onChangeText={(text) =>
                updateMedicine(index, "dosage", text.replace(/[^0-9]/g, ""))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Duration (e.g., 5 days)"
              keyboardType="numeric"
              value={med.duration}
              onChangeText={(text) =>
                updateMedicine(index, "duration", text.replace(/[^0-9]/g, ""))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Special Instructions"
              value={med.instructions}
              onChangeText={(text) =>
                updateMedicine(index, "instructions", text)
              }
            />

            <View style={styles.checkboxRow}>
              <CheckBox
                isChecked={med.morning}
                onClick={() => updateMedicine(index, "morning", !med.morning)}
                rightText="Morning"
              />
              <CheckBox
                isChecked={med.afternoon}
                onClick={() =>
                  updateMedicine(index, "afternoon", !med.afternoon)
                }
                rightText="Afternoon"
              />
              <CheckBox
                isChecked={med.night}
                onClick={() => updateMedicine(index, "night", !med.night)}
                rightText="Night"
              />
            </View>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeMedicine(index)}
            >
              <Text style={styles.removeBtnText}>Remove Medicine</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addMedicine}>
          <Text style={styles.addBtnText}>+ Add Medicine</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.generateBtn, { backgroundColor: canGenerate ? "#007bff" : "#999" }]}
          onPress={generatePrescription}
          disabled={!canGenerate}
        >
          <Text style={styles.generateBtnText}>Generate Prescription</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default PrescriptionForm;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15, borderRadius: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  medicineCard: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 8, marginVertical: 5 },
  checkboxRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  addBtn: { backgroundColor: "#28a745", padding: 12, borderRadius: 8, marginBottom: 10 },
  addBtnText: { color: "white", textAlign: "center", fontWeight: "bold" },
  generateBtn: { padding: 12, borderRadius: 8, marginBottom: 10 },
  generateBtnText: { color: "white", textAlign: "center", fontWeight: "bold" },
  closeBtn: { backgroundColor: "red", padding: 12, borderRadius: 8, marginBottom: 20 },
  closeBtnText: { color: "white", textAlign: "center", fontWeight: "bold" },
  removeBtn: { backgroundColor: "red", padding: 8, borderRadius: 6, marginTop: 5 },
  removeBtnText: { color: "white", textAlign: "center", fontWeight: "bold" },
});
