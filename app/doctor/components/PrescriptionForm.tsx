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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
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
      console.log("Sending to backend:", {
        doctorId,
        patientId,
        medicines,
      });

      const response = await axios.post(
        "https://7300c4c894de.ngrok-free.app/api/prescriptions",
        {
          doctorId,
          patientId,
          medicines,
        }
      );

      if (response.data) {
        Alert.alert("Success", "Prescription saved successfully!");
        onClose();
      }
    } catch (error: any) {
      console.error("generatePrescription error:", error.response?.data || error);
      Alert.alert("Error", error?.response?.data?.message || "Failed to save prescription. Please try again.");
    }
  };

  return (
    <LinearGradient
      colors={['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD']}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Ionicons name="medical" size={24} color="#1E40AF" />
              </View>
              <Text style={styles.title}>Create Prescription</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.closeButtonGradient}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {medicines.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="medical-outline" size={48} color="rgba(255, 255, 255, 0.6)" />
              </View>
              <Text style={styles.emptyTitle}>No Medicines Added</Text>
              <Text style={styles.emptyText}>Add medicines to create a prescription</Text>
            </View>
          )}

          {/* Medicine Cards */}
          {medicines.map((med, index) => (
            <View key={index} style={styles.medicineCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <View style={styles.medicineNumber}>
                    <Text style={styles.medicineNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.cardTitle}>Medicine {index + 1}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeMedicine(index)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#E55353']}
                    style={styles.removeButtonGradient}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="medical" size={14} color="#1E40AF" /> Medicine Name *
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter medicine name"
                  placeholderTextColor="rgba(30, 64, 175, 0.5)"
                  value={med.name}
                  onChangeText={(text) => updateMedicine(index, "name", text)}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>
                    <Ionicons name="apps" size={14} color="#1E40AF" /> Quantity *
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10"
                    placeholderTextColor="rgba(30, 64, 175, 0.5)"
                    keyboardType="numeric"
                    value={med.quantity}
                    onChangeText={(text) =>
                      updateMedicine(index, "quantity", text.replace(/[^0-9]/g, ""))
                    }
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>
                    <Ionicons name="scale" size={14} color="#1E40AF" /> Dosage *
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="500mg"
                    placeholderTextColor="rgba(30, 64, 175, 0.5)"
                    value={med.dosage}
                    onChangeText={(text) =>
                      updateMedicine(index, "dosage", text)
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="calendar" size={14} color="#1E40AF" /> Duration (days) *
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="7"
                  placeholderTextColor="rgba(30, 64, 175, 0.5)"
                  keyboardType="numeric"
                  value={med.duration}
                  onChangeText={(text) =>
                    updateMedicine(index, "duration", text.replace(/[^0-9]/g, ""))
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="document-text" size={14} color="#1E40AF" /> Special Instructions
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Take after meals, with water..."
                  placeholderTextColor="rgba(30, 64, 175, 0.5)"
                  multiline
                  numberOfLines={3}
                  value={med.instructions}
                  onChangeText={(text) =>
                    updateMedicine(index, "instructions", text)
                  }
                />
              </View>
            </View>
          ))}

          {/* Add Medicine Button */}
          <TouchableOpacity style={styles.addButton} onPress={addMedicine} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Medicine</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.generateButton,
                !canGenerate && styles.generateButtonDisabled,
              ]}
              onPress={generatePrescription}
              disabled={!canGenerate}
              activeOpacity={canGenerate ? 0.8 : 1}
            >
              <LinearGradient
                colors={canGenerate ? ['#FFFFFF', '#F8FAFF'] : ['#8DA4CC', '#7A92B8']}
                style={styles.generateButtonGradient}
              >
                <Ionicons 
                  name="document-text" 
                  size={20} 
                  color={canGenerate ? "#1E40AF" : "#FFFFFF"} 
                />
                <Text
                  style={[
                    styles.generateButtonText,
                    { color: canGenerate ? "#1E40AF" : "#FFFFFF" }
                  ]}
                >
                  Generate Prescription
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

export default PrescriptionForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    margin: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: 'blur(10px)',
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },

  medicineCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "rgba(0, 0, 0, 0.08)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(30, 64, 175, 0.1)",
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  medicineNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  medicineNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E40AF",
  },
  removeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  removeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },

  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderWidth: 2,
    borderColor: "rgba(30, 64, 175, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E40AF",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },

  addButton: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "dashed",
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  actionButtons: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
});