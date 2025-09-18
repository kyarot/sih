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
        "https://5aa83c1450d9.ngrok-free.app/api/prescriptions/",
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Prescription</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Medicine Cards */}
        {medicines.map((med, index) => (
          <View key={index} style={styles.medicineCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Medicine {index + 1}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeMedicine(index)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Medicine Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter medicine name"
                placeholderTextColor="#94a3b8"
                value={med.name}
                onChangeText={(text) => updateMedicine(index, "name", text)}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={med.quantity}
                  onChangeText={(text) =>
                    updateMedicine(index, "quantity", text.replace(/[^0-9]/g, ""))
                  }
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Dosage *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="500mg"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={med.dosage}
                  onChangeText={(text) =>
                    updateMedicine(index, "dosage", text.replace(/[^0-9]/g, ""))
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duration (days) *</Text>
              <TextInput
                style={styles.input}
                placeholder="7"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={med.duration}
                onChangeText={(text) =>
                  updateMedicine(index, "duration", text.replace(/[^0-9]/g, ""))
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Special Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Take after meals..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={2}
                value={med.instructions}
                onChangeText={(text) =>
                  updateMedicine(index, "instructions", text)
                }
              />
            </View>

            <View style={styles.timingSection}>
              <Text style={styles.timingLabel}>When to take</Text>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkboxItem,
                    med.morning && styles.checkboxItemSelected
                  ]}
                  onPress={() => updateMedicine(index, "morning", !med.morning)}
                >
                  <View style={[
                    styles.checkbox,
                    med.morning && styles.checkboxSelected
                  ]}>
                    {med.morning && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[
                    styles.checkboxLabel,
                    med.morning && styles.checkboxLabelSelected
                  ]}>Morning</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.checkboxItem,
                    med.afternoon && styles.checkboxItemSelected
                  ]}
                  onPress={() => updateMedicine(index, "afternoon", !med.afternoon)}
                >
                  <View style={[
                    styles.checkbox,
                    med.afternoon && styles.checkboxSelected
                  ]}>
                    {med.afternoon && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[
                    styles.checkboxLabel,
                    med.afternoon && styles.checkboxLabelSelected
                  ]}>Afternoon</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.checkboxItem,
                    med.night && styles.checkboxItemSelected
                  ]}
                  onPress={() => updateMedicine(index, "night", !med.night)}
                >
                  <View style={[
                    styles.checkbox,
                    med.night && styles.checkboxSelected
                  ]}>
                    {med.night && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[
                    styles.checkboxLabel,
                    med.night && styles.checkboxLabelSelected
                  ]}>Night</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Add Medicine Button */}
        <TouchableOpacity style={styles.addButton} onPress={addMedicine}>
          <Text style={styles.addButtonText}>+ Add Medicine</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              !canGenerate && styles.generateButtonDisabled
            ]}
            onPress={generatePrescription}
            disabled={!canGenerate}
          >
            <Text style={[
              styles.generateButtonText,
              !canGenerate && styles.generateButtonTextDisabled
            ]}>Generate Prescription</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default PrescriptionForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#1E40AF",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Medicine Card Styles
  medicineCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  removeButtonText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
  },

  // Input Styles
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E40AF",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#374151",
    backgroundColor: "#fefefe",
  },
  textArea: {
    height: 60,
    textAlignVertical: "top",
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },

  // Timing Section Styles
  timingSection: {
    marginTop: 4,
  },
  timingLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E40AF",
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  checkboxItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  checkboxItemSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#1E40AF",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "white",
  },
  checkboxSelected: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  checkmark: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  checkboxLabelSelected: {
    color: "#1E40AF",
  },

  // Button Styles
  addButton: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#1E40AF",
    borderStyle: "dashed",
    alignItems: "center",
  },
  addButtonText: {
    color: "#1E40AF",
    fontSize: 16,
    fontWeight: "600",
  },

  actionButtons: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  generateButton: {
    backgroundColor: "#1E40AF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    backgroundColor: "#94a3b8",
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  generateButtonTextDisabled: {
    color: "#f8fafc",
  },
});