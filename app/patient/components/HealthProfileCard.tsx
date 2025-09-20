import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { useTranslation } from "../../../components/TranslateProvider"; 

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

function GenderButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.genderBtn, selected && styles.genderBtnSelected]}
      activeOpacity={0.7}
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

export default function HealthProfileCard({
  expanded,
  onToggle,
  selectedFamily,
  editingProfile,
  setEditingProfile,
  addingNewProfile,
  setAddingNewProfile,
  newProfileDraft,
  setNewProfileDraft,
  onSaveExisting,
  onCreateNew,
  onRefreshSelected,
}: Props) {
  const { t } = useTranslation(); // ✅

  const profileFields = [
    { key: "name", label: "Full Name", icon: "person-outline", required: true },
    { key: "age", label: "Age", icon: "calendar-outline", required: false },
    { key: "gender", label: "Gender", icon: "people-outline", required: false },
    { key: "email", label: "Email Address", icon: "mail-outline", required: false },
    { key: "phone", label: "Phone Number", icon: "call-outline", required: false },
    { key: "bloodGroup", label: "Blood Type", icon: "water-outline", required: false },
    { key: "address", label: "Address", icon: "location-outline", required: false },
  ];

  const getBloodTypeIcon = (bloodType: string) => {
    if (!bloodType) return "water-outline";
    return "medical-outline";
  };

  const formatProfileSubtext = (profile: FamilyProfile) => {
    const parts = [];
    if (profile.age) parts.push(`${profile.age} years old`);
    if (profile.gender) parts.push(profile.gender);
    if (profile.bloodGroup) parts.push(`Type ${profile.bloodGroup}`);
    return parts.length > 0 ? parts.join(" • ") : "Health Profile";
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onToggle}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="medical" size={18} color="white" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Medical Profile</Text>
              <Text style={styles.subtitle}>Personal health information</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {!addingNewProfile && selectedFamily && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditingProfile(!editingProfile)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={editingProfile ? "close" : "create-outline"}
                  size={16}
                  color="white"
                />
              </TouchableOpacity>
            )}
            <View style={styles.chevronContainer}>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={18}
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
                  <Ionicons name="person-add-outline" size={16} color="white" />
                </View>
                <View style={styles.formHeaderText}>
                  <Text style={styles.formTitle}>Create New Profile</Text>
                  <Text style={styles.formSubtitle}>Add family member details</Text>
                </View>
              </View>

              <View style={styles.formContent}>
                {profileFields.map((field) => (
                  <View key={field.key} style={styles.inputContainer}>
                    <View style={styles.inputHeader}>
                      <Ionicons name={field.icon as any} size={14} color="#1E40AF" />
                      <Text style={styles.inputLabel}>
                        {field.label}
                        {field.required && <Text style={styles.requiredStar}> *</Text>}
                      </Text>
                    </View>

                    {field.key === "gender" ? (
                      <View style={styles.genderContainer}>
                        {(["Male", "Female", "Other"] as const).map((g) => (
                          <GenderButton
                            key={g}
                            label={g}
                            selected={(newProfileDraft.gender ?? "Male") === g}
                            onPress={() =>
                              setNewProfileDraft({ ...newProfileDraft, gender: g as Gender })
                            }
                          />
                        ))}
                      </View>
                    ) : (
                      <TextInput
                        style={styles.input}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        placeholderTextColor="#94A3B8"
                        value={String((newProfileDraft as any)[field.key] ?? "")}
                        keyboardType={
                          field.key === "age"
                            ? "numeric"
                            : field.key === "phone"
                            ? "phone-pad"
                            : field.key === "email"
                            ? "email-address"
                            : "default"
                        }
                        onChangeText={(text) => {
                          const value =
                            field.key === "age"
                              ? text === ""
                                ? ""
                                : Number(text)
                              : text;
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
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                    <Text style={styles.saveButtonText}>Create Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setAddingNewProfile(false)}
                    activeOpacity={0.8}
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
                  <Ionicons name="person" size={24} color="white" />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{selectedFamily.name}</Text>
                  <Text style={styles.profileSubtext}>
                    {formatProfileSubtext(selectedFamily)}
                  </Text>
                  <View style={styles.profileBadge}>
                    <Ionicons name="shield-checkmark-outline" size={12} color="#10B981" />
                    <Text style={styles.profileBadgeText}>Verified Profile</Text>
                  </View>
                </View>
              </View>

              <View style={styles.profileContent}>
                {profileFields.map((field) => (
                  <View key={field.key} style={styles.fieldContainer}>
                    <View style={styles.fieldHeader}>
                      <View style={styles.fieldIconContainer}>
                        <Ionicons 
                          name={field.key === "bloodGroup" ? getBloodTypeIcon((selectedFamily as any)[field.key]) : field.icon as any} 
                          size={14} 
                          color="#1E40AF" 
                        />
                      </View>
                      <Text style={styles.fieldLabel}>{field.label}</Text>
                      {field.required && <Text style={styles.requiredIndicator}>Required</Text>}
                    </View>

                    {editingProfile ? (
                      field.key === "gender" ? (
                        <View style={styles.genderContainer}>
                          {(["Male", "Female", "Other"] as const).map((g) => (
                            <GenderButton
                              key={g}
                              label={g}
                              selected={selectedFamily?.gender === g}
                              onPress={() => {
                                (selectedFamily as any).gender = g;
                              }}
                            />
                          ))}
                        </View>
                      ) : (
                        <TextInput
                          style={styles.input}
                          value={String((selectedFamily as any)[field.key] ?? "")}
                          keyboardType={
                            field.key === "age"
                              ? "numeric"
                              : field.key === "phone"
                              ? "phone-pad"
                              : field.key === "email"
                              ? "email-address"
                              : "default"
                          }
                          placeholderTextColor="#94A3B8"
                          onChangeText={(text) => {
                            const value =
                              field.key === "age"
                                ? text === ""
                                  ? ""
                                  : Number(text)
                                : text;
                            (selectedFamily as any)[field.key] = value;
                          }}
                        />
                      )
                    ) : (
                      <View style={styles.fieldValueContainer}>
                        <Text style={styles.fieldValue}>
                          {String(
                            (selectedFamily as any)[field.key] !== undefined &&
                              (selectedFamily as any)[field.key] !== null &&
                              (selectedFamily as any)[field.key] !== ""
                              ? (selectedFamily as any)[field.key]
                              : "Not specified"
                          )}
                        </Text>
                        {field.key === "bloodGroup" && (selectedFamily as any)[field.key] && (
                          <View style={styles.bloodTypeIndicator}>
                            <Ionicons name="medical" size={12} color="#DC2626" />
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))}

                {editingProfile && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => {
                        if (selectedFamily) onSaveExisting(selectedFamily as FamilyProfile);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="save-outline" size={16} color="white" />
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={onRefreshSelected}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {!editingProfile && (
                <View style={styles.profileActions}>
                  <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
                    <Ionicons name="document-text-outline" size={18} color="#1E40AF" />
                    <Text style={styles.actionCardText}>Medical Records</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
                    <Ionicons name="calendar-outline" size={18} color="#1E40AF" />
                    <Text style={styles.actionCardText}>Appointments</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="person-add-outline" size={40} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Profile Selected</Text>
              <Text style={styles.emptySubtext}>Select a family member to view their medical profile and health information.</Text>
              <TouchableOpacity 
                style={styles.createProfileButton}
                onPress={() => setAddingNewProfile(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={16} color="#1E40AF" />
                <Text style={styles.createProfileButtonText}>Create New Profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  chevronContainer: {
    padding: 4,
  },
  content: {
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Form Container
  formContainer: {
    padding: 16,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  formIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  formHeaderText: {
    flex: 1,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 1,
  },
  formSubtitle: {
    fontSize: 11,
    color: "#64748B",
  },
  formContent: {
    gap: 12,
  },

  // Profile Container
  profileContainer: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  profileSubtext: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 4,
  },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  profileBadgeText: {
    fontSize: 10,
    color: "#10B981",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  profileContent: {
    gap: 12,
  },

  // Input Fields
  inputContainer: {
    gap: 6,
  },
  fieldContainer: {
    gap: 6,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
  requiredStar: {
    color: "#DC2626",
  },
  requiredIndicator: {
    fontSize: 9,
    color: "#DC2626",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    backgroundColor: "white",
    color: "#1E293B",
  },
  fieldValueContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldValue: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "500",
    flex: 1,
  },
  bloodTypeIndicator: {
    marginLeft: 8,
  },

  // Gender Buttons
  genderContainer: {
    flexDirection: "row",
    gap: 6,
  },
  genderBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
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
    fontSize: 12,
  },
  genderBtnTextSelected: {
    color: "#1E40AF",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: "#1E40AF",
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
  cancelButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 13,
  },

  // Profile Actions
  profileActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionCardText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E40AF",
    textAlign: "center",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  createProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E40AF",
    gap: 6,
  },
  createProfileButtonText: {
    color: "#1E40AF",
    fontSize: 13,
    fontWeight: "600",
  },
});