// app/patient/family.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from "expo-router";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

const API_BASE = "https://7300c4c894de.ngrok-free.app";
const { width, height } = Dimensions.get('window');

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

/* ==========================
   Helper UI Components Inline
   ========================== */
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
      activeOpacity={0.8}
    >
      <Text
        style={[styles.genderBtnText, selected && styles.genderBtnTextSelected]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SpeechAnimation({ isRecording }: { isRecording: boolean }) {
  const animatedValues = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.5),
    new Animated.Value(0.3),
    new Animated.Value(0.7),
    new Animated.Value(0.4),
  ]).current;

  useEffect(() => {
    if (isRecording) {
      const animations = animatedValues.map((animValue, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 300 + index * 100,
              useNativeDriver: false,
            }),
            Animated.timing(animValue, {
              toValue: 0.3 + index * 0.1,
              duration: 300 + index * 100,
              useNativeDriver: false,
            }),
          ])
        )
      );
      Animated.stagger(50, animations).start();
    } else {
      animatedValues.forEach((animValue) => {
        animValue.stopAnimation();
        Animated.timing(animValue, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isRecording, animatedValues]);

  if (!isRecording) return null;

  return (
    <View style={styles.speechAnimation}>
      {animatedValues.map((animValue, index) => (
        <Animated.View
          key={index}
          style={[styles.speechBar, { transform: [{ scaleY: animValue }] }]}
        />
      ))}
    </View>
  );
}

/* ==========================
   Main Family Screen
   ========================== */
export default function FamilyScreen() {
  const { id } = useLocalSearchParams();
  const accountId = (id as string) || "";

  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfile[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyProfile | null>(
    null
  );
  const [patientDetails, setPatientDetails] = useState<FamilyProfile | null>(
    null
  );

  const [editingProfile, setEditingProfile] = useState(false);
  const [addingNewProfile, setAddingNewProfile] = useState(false);
  const [newProfileDraft, setNewProfileDraft] =
    useState<Partial<FamilyProfile>>({});
  const [editProfileDraft, setEditProfileDraft] = 
    useState<FamilyProfile | null>(null);

  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Speech-to-text
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  /* ==========================
     API Helpers
     ========================== */
  async function fetchFamilyProfiles() {
    try {
      setLoadingProfiles(true);
      const res = await axios.get(
        `${API_BASE}/api/patients/family/${accountId}`
      );
      const data = res.data || [];
      setFamilyProfiles(data);

      if (data.length > 0 && !selectedFamily) {
        setSelectedFamily(data[0]);
        setPatientDetails(data[0]);
      }
    } catch (err) {
      console.error("fetchFamilyProfiles:", err);
      Toast.show({ type: "error", text1: "Failed to load family profiles" });
    } finally {
      setLoadingProfiles(false);
    }
  }

  async function fetchPatientDetails(uid: string) {
    try {
      const res = await axios.get(`${API_BASE}/api/patients/profile/${uid}`);
      setPatientDetails(res.data || null);
    } catch (err) {
      console.error("fetchPatientDetails:", err);
    }
  }

  async function handleSaveProfile(editedProfile: FamilyProfile) {
    if (!editedProfile?.uid) {
      Toast.show({ type: "error", text1: "Profile UID missing" });
      return;
    }
    const payload = { ...editedProfile };
    if (payload.age === "" || payload.age === null) {
      delete payload.age;
    }
    try {
      const res = await axios.put(
        `${API_BASE}/api/patients/profile/${payload.uid}`,
        payload
      );
      const updated = res?.data?.patient || payload;
      
      // Update the family profiles list
      setFamilyProfiles(prev => 
        prev.map(profile => 
          profile.uid === updated.uid ? updated : profile
        )
      );
      
      setSelectedFamily(updated as FamilyProfile);
      setPatientDetails(updated as FamilyProfile);
      setEditingProfile(false);
      setEditProfileDraft(null);
      Toast.show({ type: "success", text1: "Profile updated successfully!" });
    } catch (err) {
      console.error("handleSaveProfile:", err);
      Toast.show({ type: "error", text1: "Failed to update profile" });
    }
  }

  async function handleCreateProfile(payload: Partial<FamilyProfile>) {
    if (!payload.name) {
      Toast.show({ type: "error", text1: "Name required" });
      return;
    }
    const body = {
      ...payload,
      uid: payload.uid || `UID${Date.now()}`,
      code: selectedFamily?.code || patientDetails?.code || accountId,
      accountId,
    };

    try {
      const res = await axios.post(
        `${API_BASE}/api/patients/register-patient`,
        body
      );
      const created = res?.data?.patient || body;
      setFamilyProfiles((p) => [...p, created]);
      setSelectedFamily(created as FamilyProfile);
      setAddingNewProfile(false);
      setNewProfileDraft({});
      Toast.show({ type: "success", text1: "Profile created" });
    } catch (err) {
      console.error("handleCreateProfile:", err);
      Toast.show({ type: "error", text1: "Failed to create profile" });
    }
  }

  /* ==========================
     Speech Recording
     ========================== */
  const startRecording = async (fieldKey: string) => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setRecordingField(fieldKey);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = async (fieldKey: string, isNewProfile: boolean) => {
    if (!recordingRef.current || recordingField !== fieldKey) return;

    try {
      setIsProcessing(true);
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      setRecordingField(null);
      recordingRef.current = null;

      if (!uri) {
        setIsProcessing(false);
        return;
      }

      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(",")[1];
        try {
          const res = await axios.post(
            "https://7300c4c894de.ngrok-free.app/api/speech/transcribe",
            { audio: base64Audio }
          );
          const transcription = res.data.transcription;
          if (transcription) {
            if (isNewProfile) {
              setNewProfileDraft({
                ...newProfileDraft,
                [fieldKey]: transcription,
              });
            } else if (selectedFamily) {
              Object.assign(selectedFamily, { [fieldKey]: transcription });
            }
          }
        } catch (err) {
          console.error("Transcription error:", err);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      setRecordingField(null);
      setIsProcessing(false);
      recordingRef.current = null;
    }
  };

  const handleMicPress = async (fieldKey: string, isNewProfile: boolean) => {
    if (recordingField === fieldKey) {
      await stopRecording(fieldKey, isNewProfile);
    } else if (recordingField) {
      const currentField = recordingField;
      await stopRecording(currentField, isNewProfile);
      setTimeout(() => startRecording(fieldKey), 100);
    } else {
      await startRecording(fieldKey);
    }
  };

  const startEditingProfile = () => {
    if (selectedFamily) {
      setEditProfileDraft({ ...selectedFamily });
      setEditingProfile(true);
      setAddingNewProfile(false);
    }
  };

  const cancelEditingProfile = () => {
    setEditingProfile(false);
    setEditProfileDraft(null);
  };

  const saveEditedProfile = () => {
    if (editProfileDraft) {
      handleSaveProfile(editProfileDraft);
    }
  };

  /* ==========================
     Effects
     ========================== */
  useEffect(() => {
    if (accountId) fetchFamilyProfiles();
  }, [accountId]);

  useEffect(() => {
    if (selectedFamily?.uid) fetchPatientDetails(selectedFamily.uid);
  }, [selectedFamily?.uid]);

  /* ==========================
     Render
     ========================== */
  const profileFields = [
    { key: "name", label: "Full Name", icon: "person-outline", required: true },
    { key: "age", label: "Age", icon: "calendar-outline" },
    { key: "gender", label: "Gender", icon: "people-outline" },
    { key: "email", label: "Email Address", icon: "mail-outline" },
    { key: "phone", label: "Phone Number", icon: "call-outline" },
    { key: "bloodGroup", label: "Blood Type", icon: "water-outline" },
    { key: "address", label: "Address", icon: "location-outline" },
  ];

  const getMicButtonIcon = (fieldKey: string) => {
    if (recordingField === fieldKey) return "stop-circle";
    if (isProcessing && recordingField === null) return "hourglass-outline";
    return "mic-outline";
  };

  const getMicButtonColor = (fieldKey: string) => {
    if (recordingField === fieldKey) return "#FF6B6B";
    if (isProcessing) return "#FFB347";
    return "#FFFFFF";
  };

  function onCreateNew(newProfileDraft: Partial<FamilyProfile>): void {
    handleCreateProfile(newProfileDraft);
  }

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Stack.Screen
        options={{ 
          headerShown: false,
        }}
      />

      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            // Add your back navigation logic here
            // Example: router.back() or navigation.goBack()
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>Family Profiles</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="people" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Your Family, Our Priority</Text>
          <Text style={styles.headerSubtitle}>
            Manage healthcare profiles for your loved ones
          </Text>
        </View>

        {/* Family Members Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Family Members</Text>
          </View>
          
          <View style={styles.profileGrid}>
            {familyProfiles.map((profile) => (
              <TouchableOpacity
                key={profile.uid}
                style={[
                  styles.profileCard,
                  selectedFamily?.uid === profile.uid && styles.profileCardSelected
                ]}
                onPress={() => setSelectedFamily(profile)}
                activeOpacity={0.8}
              >
                <View style={styles.profileCardContent}>
                  <View style={styles.profileAvatar}>
                    <Ionicons name="person" size={28} color="#3B82F6" />
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{profile.name}</Text>
                    <Text style={styles.profileDetails}>
                      {profile.age ? `${profile.age} years` : 'Age not specified'} • {profile.gender || 'Gender not specified'}
                    </Text>
                  </View>
                  {selectedFamily?.uid === profile.uid && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.addProfileCard}
              onPress={() => {
                setAddingNewProfile(true);
                setEditingProfile(false);
                setNewProfileDraft({
                  name: "",
                  age: "",
                  gender: "Male",
                  email: "",
                  phone: "",
                  bloodGroup: "",
                  address: "",
                });
              }}
              activeOpacity={0.8}
            >
              <View style={styles.addProfileContent}>
                <View style={styles.addProfileIcon}>
                  <Ionicons name="add-circle" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.addProfileText}>Add New Profile</Text>
                <Text style={styles.addProfileSubtext}>Create a family member profile</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Details/Form Section */}
        {addingNewProfile ? (
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Ionicons name="person-add" size={24} color="#FFFFFF" />
              <Text style={styles.formTitle}>Create New Profile</Text>
            </View>
            
            <View style={styles.formContent}>
              {profileFields.map((field) => (
                <View key={field.key} style={styles.inputContainer}>
                  <View style={styles.inputHeader}>
                    <View style={styles.inputLabelContainer}>
                      <Ionicons
                        name={field.icon as any}
                        size={16}
                        color="#3B82F6"
                      />
                      <Text style={styles.inputLabel}>{field.label}</Text>
                      {field.required && (
                        <Text style={styles.requiredIndicator}>*</Text>
                      )}
                    </View>
                    {field.key !== "gender" && (
                      <View style={styles.micContainer}>
                        {recordingField === field.key && (
                          <SpeechAnimation isRecording={true} />
                        )}
                        <TouchableOpacity
                          onPress={() => handleMicPress(field.key, true)}
                          style={[
                            styles.micButton,
                            recordingField === field.key && styles.micButtonRecording
                          ]}
                        >
                          <Ionicons
                            name={getMicButtonIcon(field.key)}
                            size={16}
                            color={getMicButtonColor(field.key)}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  
                  {field.key === "gender" ? (
                    <View style={styles.genderContainer}>
                      {(["Male", "Female", "Other"] as const).map((g) => (
                        <GenderButton
                          key={g}
                          label={g}
                          selected={(newProfileDraft.gender ?? "Male") === g}
                          onPress={() =>
                            setNewProfileDraft({
                              ...newProfileDraft,
                              gender: g as Gender,
                            })
                          }
                        />
                      ))}
                    </View>
                  ) : (
                    <TextInput
                      style={styles.input}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      value={String((newProfileDraft as any)[field.key] ?? "")}
                      onChangeText={(text) =>
                        setNewProfileDraft({
                          ...newProfileDraft,
                          [field.key]:
                            field.key === "age" && text
                              ? Number(text)
                              : text,
                        })
                      }
                      keyboardType={field.key === "age" || field.key === "phone" ? "numeric" : "default"}
                    />
                  )}
                </View>
              ))}
              
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setAddingNewProfile(false);
                    setNewProfileDraft({});
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => onCreateNew(newProfileDraft)}
                >
                  <Ionicons name="checkmark" size={18} color="#1E3A8A" />
                  <Text style={styles.saveButtonText}>Create Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : editingProfile && editProfileDraft ? (
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Ionicons name="create" size={24} color="#FFFFFF" />
              <Text style={styles.formTitle}>Edit Profile</Text>
            </View>
            
            <View style={styles.formContent}>
              {profileFields.map((field) => (
                <View key={field.key} style={styles.inputContainer}>
                  <View style={styles.inputHeader}>
                    <View style={styles.inputLabelContainer}>
                      <Ionicons
                        name={field.icon as any}
                        size={16}
                        color="#3B82F6"
                      />
                      <Text style={styles.inputLabel}>{field.label}</Text>
                      {field.required && (
                        <Text style={styles.requiredIndicator}>*</Text>
                      )}
                    </View>
                    {field.key !== "gender" && (
                      <View style={styles.micContainer}>
                        {recordingField === field.key && (
                          <SpeechAnimation isRecording={true} />
                        )}
                        <TouchableOpacity
                          onPress={() => handleMicPress(field.key, false)}
                          style={[
                            styles.micButton,
                            recordingField === field.key && styles.micButtonRecording
                          ]}
                        >
                          <Ionicons
                            name={getMicButtonIcon(field.key)}
                            size={16}
                            color={getMicButtonColor(field.key)}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  
                  {field.key === "gender" ? (
                    <View style={styles.genderContainer}>
                      {(["Male", "Female", "Other"] as const).map((g) => (
                        <GenderButton
                          key={g}
                          label={g}
                          selected={(editProfileDraft.gender ?? "Male") === g}
                          onPress={() =>
                            setEditProfileDraft({
                              ...editProfileDraft,
                              gender: g as Gender,
                            })
                          }
                        />
                      ))}
                    </View>
                  ) : (
                    <TextInput
                      style={styles.input}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      value={String((editProfileDraft as any)[field.key] ?? "")}
                      onChangeText={(text) =>
                        setEditProfileDraft({
                          ...editProfileDraft,
                          [field.key]:
                            field.key === "age" && text
                              ? Number(text)
                              : text,
                        })
                      }
                      keyboardType={field.key === "age" || field.key === "phone" ? "numeric" : "default"}
                    />
                  )}
                </View>
              ))}
              
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelEditingProfile}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveEditedProfile}
                >
                  <Ionicons name="checkmark" size={18} color="#1E3A8A" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : selectedFamily ? (
          <View style={styles.profileDetailsContainer}>
            <View style={styles.profileDetailsHeader}>
              <View style={styles.profileDetailsAvatar}>
                <Ionicons name="person" size={40} color="#3B82F6" />
              </View>
              <View style={styles.profileDetailsInfo}>
                <Text style={styles.profileDetailsName}>{selectedFamily.name}</Text>
                <Text style={styles.profileDetailsSubtitle}>Family Member Profile</Text>
              </View>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={startEditingProfile}
              >
                <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileDetailsContent}>
              {profileFields.map((field) => {
                const value = (selectedFamily as any)[field.key];
                if (!value && field.key !== 'age') return null;
                
                return (
                  <View key={field.key} style={styles.profileDetailItem}>
                    <View style={styles.profileDetailIcon}>
                      <Ionicons name={field.icon as any} size={16} color="#3B82F6" />
                    </View>
                    <View style={styles.profileDetailContent}>
                      <Text style={styles.profileDetailLabel}>{field.label}</Text>
                      <Text style={styles.profileDetailValue}>
                        {value || "Not specified"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="rgba(255,255,255,0.5)" />
            <Text style={styles.emptyStateText}>No profile selected</Text>
            <Text style={styles.emptyStateSubtext}>
              Select a family member to view their profile
            </Text>
          </View>
        )}
      </ScrollView>
      <Toast />
    </LinearGradient>
  );
}

/* ==========================
   Styles
   ========================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50, // Adjust based on your status bar height
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  customHeaderTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, // Same width as back button for centering
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  profileGrid: {
    gap: 12,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
  },
  profileCardSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  addProfileCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addProfileContent: {
    alignItems: 'center',
  },
  addProfileIcon: {
    marginBottom: 12,
  },
  addProfileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  addProfileSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  formHeader: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  formContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  requiredIndicator: {
    color: '#FF6B6B',
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  micContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  micButtonRecording: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  genderBtnSelected: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: '#FFFFFF',
  },
  genderBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  genderBtnTextSelected: {
    color: '#3B82F6',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: 16,
  },
  profileDetailsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileDetailsHeader: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileDetailsAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetailsInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileDetailsName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileDetailsSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileDetailsContent: {
    padding: 20,
  },
  profileDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  profileDetailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileDetailContent: {
    flex: 1,
  },
  profileDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  profileDetailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  speechAnimation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 20,
    marginRight: 8,
  },
  speechBar: {
    width: 3,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
});