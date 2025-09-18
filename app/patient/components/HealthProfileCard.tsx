import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

export type FamilyProfile = {
  _id?: string;
  uid: string;
  name: string;
  age?: number | string;
  gender?: "Male" | "Female" | "Other" | string;
  email?: string;
  phone?: string;
  bloodGroup?: string;
  address?: string;
  accountId?: string;
  code?: string;
};

type Gender = "Male" | "Female" | "Other" | string;

function GenderButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.genderBtn, selected && styles.genderBtnSelected]}
      activeOpacity={0.8}
    >
      <Text style={[styles.genderBtnText, selected && styles.genderBtnTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

type Props = {
  expanded: boolean;
  onToggle: () => void;
  selectedFamily: FamilyProfile | null;
  editingProfile: boolean;
  setEditingProfile: (val: boolean) => void;
  addingNewProfile: boolean;
  setAddingNewProfile: (val: boolean) => void;
  newProfileDraft: Partial<FamilyProfile>;
  setNewProfileDraft: (val: Partial<FamilyProfile>) => void;
  onSaveExisting: (profile: FamilyProfile) => void;
  onCreateNew: (draft: Partial<FamilyProfile>) => void;
  onRefreshSelected: () => void;
};

export default function HealthProfileCard({ expanded, onToggle, selectedFamily, editingProfile, setEditingProfile, addingNewProfile, setAddingNewProfile, newProfileDraft, setNewProfileDraft, onSaveExisting, onCreateNew, onRefreshSelected }: Props) {
  const profileFields = [
    { key: "name", label: "Full Name", icon: "person" },
    { key: "age", label: "Age", icon: "calendar" },
    { key: "gender", label: "Gender", icon: "male-female" },
    { key: "email", label: "Email Address", icon: "mail" },
    { key: "phone", label: "Phone Number", icon: "call" },
    { key: "bloodGroup", label: "Blood Group", icon: "water" },
    { key: "address", label: "Address", icon: "location" },
  ];

  return (
    <View style={styles.card}>
      <TouchableWithoutFeedback onPress={onToggle}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-circle" size={24} color="white" />
            </View>
            <Text style={styles.title}>Health Profile</Text>
          </View>
          <View style={styles.headerActions}>
            {!addingNewProfile && selectedFamily && (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setEditingProfile(!editingProfile)}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={editingProfile ? "close" : "create"} 
                  size={20} 
                  color="white" 
                />
              </TouchableOpacity>
            )}
            <View style={styles.chevronContainer}>
              <Ionicons 
                name={expanded ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="white" 
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {expanded && (
        <View style={styles.content}>
          {addingNewProfile ? (
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <View style={styles.formIconContainer}>
                  <Ionicons name="person-add" size={20} color="white" />
                </View>
                <Text style={styles.formTitle}>Add New Profile</Text>
              </View>

              <View style={styles.formContent}>
                {profileFields.map((field) => (
                  <View key={field.key} style={styles.inputContainer}>
                    <View style={styles.inputHeader}>
                      <Ionicons name={field.icon as any} size={16} color="#1E40AF" />
                      <Text style={styles.inputLabel}>{field.label}</Text>
                    </View>
                    
                    {field.key === "gender" ? (
                      <View style={styles.genderContainer}>
                        {(["Male", "Female", "Other"] as const).map((g) => (
                          <GenderButton 
                            key={g} 
                            label={g} 
                            selected={(newProfileDraft.gender ?? "Male") === g} 
                            onPress={() => setNewProfileDraft({ ...newProfileDraft, gender: g as Gender })} 
                          />
                        ))}
                      </View>
                    ) : (
                      <TextInput 
                        style={styles.input}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        placeholderTextColor="#94A3B8"
                        value={String((newProfileDraft as any)[field.key] ?? "")}
                        keyboardType={field.key === "age" ? "numeric" : field.key === "phone" ? "phone-pad" : "default"}
                        onChangeText={(text) => {
                          const value = field.key === "age" ? (text === "" ? "" : Number(text)) : text;
                          setNewProfileDraft({ ...newProfileDraft, [field.key]: value });
                        }}
                      />
                    )}
                  </View>
                ))}

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.saveButton} 
                    onPress={() => onCreateNew(newProfileDraft)}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={styles.saveButtonText}>Save Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => setAddingNewProfile(false)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : selectedFamily ? (
            <View style={styles.profileContainer}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <Ionicons name="person" size={32} color="white" />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{selectedFamily.name}</Text>
                  <Text style={styles.profileSubtext}>
                    {selectedFamily.age && selectedFamily.gender ? 
                      `${selectedFamily.age} years • ${selectedFamily.gender}` :
                      selectedFamily.age ? `${selectedFamily.age} years` :
                      selectedFamily.gender || "Profile"
                    }
                  </Text>
                </View>
              </View>

              <View style={styles.profileContent}>
                {profileFields.map((field) => (
                  <View key={field.key} style={styles.fieldContainer}>
                    <View style={styles.fieldHeader}>
                      <View style={styles.fieldIconContainer}>
                        <Ionicons name={field.icon as any} size={16} color="#1E40AF" />
                      </View>
                      <Text style={styles.fieldLabel}>{field.label}</Text>
                    </View>

                    {editingProfile ? (
                      field.key === "gender" ? (
                        <View style={styles.genderContainer}>
                          {(["Male", "Female", "Other"] as const).map((g) => (
                            <GenderButton 
                              key={g} 
                              label={g} 
                              selected={selectedFamily?.gender === g} 
                              onPress={() => { (selectedFamily as any).gender = g; }} 
                            />
                          ))}
                        </View>
                      ) : (
                        <TextInput
                          style={styles.input}
                          value={String((selectedFamily as any)[field.key] ?? "")}
                          keyboardType={field.key === "age" ? "numeric" : field.key === "phone" ? "phone-pad" : "default"}
                          placeholderTextColor="#94A3B8"
                          onChangeText={(text) => {
                            const value = field.key === "age" ? (text === "" ? "" : Number(text)) : text;
                            (selectedFamily as any)[field.key] = value;
                          }}
                        />
                      )
                    ) : (
                      <View style={styles.fieldValueContainer}>
                        <Text style={styles.fieldValue}>
                          {String((selectedFamily as any)[field.key] !== undefined && (selectedFamily as any)[field.key] !== null ? (selectedFamily as any)[field.key] : "Not provided")}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}

                {editingProfile && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.saveButton} 
                      onPress={() => { if (selectedFamily) onSaveExisting(selectedFamily as FamilyProfile); }}
                      activeOpacity={0.9}
                    >
                      <Ionicons name="checkmark" size={20} color="white" />
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.cancelButton} 
                      onPress={onRefreshSelected}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="person-outline" size={48} color="#E5E7EB" />
              <Text style={styles.emptyText}>No profile selected</Text>
              <Text style={styles.emptySubtext}>Please select a family member to view their profile</Text>
            </View>
          )}
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  chevronContainer: {
    padding: 4,
  },
  content: {
    backgroundColor: "white",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },

  // Form Container
  formContainer: {
    padding: 20,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  formIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 12,
  },
  formContent: {
    gap: 16,
  },

  // Profile Container
  profileContainer: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  profileSubtext: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  profileContent: {
    gap: 16,
  },

  // Input Fields
  inputContainer: {
    gap: 8,
  },
  fieldContainer: {
    gap: 8,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  fieldIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "white",
    color: "#1E293B",
  },
  fieldValueContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  fieldValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },

  // Gender Buttons
  genderContainer: {
    flexDirection: "row",
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    backgroundColor: "white",
  },
  genderBtnSelected: {
    borderColor: "#1E40AF",
    backgroundColor: "#EFF6FF",
  },
  genderBtnText: {
    fontWeight: "600",
    color: "#64748B",
    fontSize: 14,
  },
  genderBtnTextSelected: {
    color: "#1E40AF",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: "#1E40AF",
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveButtonText: {
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
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 16,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
});