import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Profile } from "./types";

interface Props {
  visible: boolean;
  onClose: () => void;
  editingProfile: boolean;
  setEditingProfile: (v: boolean) => void;
  profile: Profile;
  tempProfile: Profile;
  setTempProfile: (p: Profile) => void;
  saveProfile: () => void;
  cancelEdit: () => void;
  logout: () => void;
}

export default function ProfileModal({
  visible,
  onClose,
  editingProfile,
  setEditingProfile,
  profile,
  tempProfile,
  setTempProfile,
  saveProfile,
  cancelEdit,
  logout,
}: Props) {
  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: '#F8FAFC',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'white',
      paddingHorizontal: 24,
      paddingVertical: 16,
      paddingTop: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    modalCancel: {
      fontSize: 16,
      color: '#64748B',
      fontWeight: '600',
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1E40AF',
      letterSpacing: 0.5,
    },
    modalSave: {
      fontSize: 16,
      color: '#1E40AF',
      fontWeight: '700',
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    modalContent: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 32,
    },
    profileSection: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    profileAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#1E40AF',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: 32,
      shadowColor: '#1E40AF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
    },
    profileAvatarText: {
      color: 'white',
      fontSize: 28,
      fontWeight: '700',
      letterSpacing: 2,
    },
    profileForm: {},
    formGroup: {
      marginBottom: 20,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1E40AF',
      marginBottom: 8,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    formInput: {
      backgroundColor: '#F8FAFC',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: '#374151',
      fontWeight: '500',
      minHeight: 48,
    },
    formInputDisabled: {
      backgroundColor: '#F1F5F9',
      color: '#64748B',
    },
    formInputFocused: {
      borderColor: '#1E40AF',
      backgroundColor: 'white',
      shadowColor: '#1E40AF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
      paddingTop: 14,
    },
    cancelEditBtn: {
      backgroundColor: 'white',
      borderWidth: 2,
      borderColor: '#E5E7EB',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cancelEditText: {
      color: '#64748B',
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    logoutBtn: {
      backgroundColor: '#1E40AF',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 40,
      shadowColor: '#1E40AF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
    },
    logoutText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Pharmacy Profile</Text>
          <TouchableOpacity 
            onPress={() => (editingProfile ? saveProfile() : setEditingProfile(true))}
            activeOpacity={0.7}
          >
            <Text style={styles.modalSave}>{editingProfile ? "Save" : "Edit"}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {profile.ownerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.profileForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Owner Name</Text>
                <TextInput
                  style={[styles.formInput, !editingProfile && styles.formInputDisabled]}
                  value={editingProfile ? tempProfile.ownerName : profile.ownerName}
                  onChangeText={(text) => editingProfile && setTempProfile({ ...tempProfile, ownerName: text })}
                  editable={editingProfile}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Shop Name</Text>
                <TextInput
                  style={[styles.formInput, !editingProfile && styles.formInputDisabled]}
                  value={editingProfile ? tempProfile.shopName : profile.shopName}
                  onChangeText={(text) => editingProfile && setTempProfile({ ...tempProfile, shopName: text })}
                  editable={editingProfile}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number</Text>
                <TextInput
                  style={[styles.formInput, !editingProfile && styles.formInputDisabled]}
                  value={editingProfile ? tempProfile.phone : profile.phone}
                  onChangeText={(text) => editingProfile && setTempProfile({ ...tempProfile, phone: text })}
                  editable={editingProfile}
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={[styles.formInput, !editingProfile && styles.formInputDisabled]}
                  value={editingProfile ? tempProfile.email : profile.email}
                  onChangeText={(text) => editingProfile && setTempProfile({ ...tempProfile, email: text })}
                  editable={editingProfile}
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Address</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea, !editingProfile && styles.formInputDisabled]}
                  value={editingProfile ? tempProfile.address : profile.address}
                  onChangeText={(text) => editingProfile && setTempProfile({ ...tempProfile, address: text })}
                  multiline
                  numberOfLines={3}
                  editable={editingProfile}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>License Number</Text>
                <TextInput
                  style={[styles.formInput, !editingProfile && styles.formInputDisabled]}
                  value={editingProfile ? tempProfile.license : profile.license}
                  onChangeText={(text) => editingProfile && setTempProfile({ ...tempProfile, license: text })}
                  editable={editingProfile}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          </View>

          {editingProfile && (
            <TouchableOpacity 
              style={styles.cancelEditBtn} 
              onPress={cancelEdit}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelEditText}>Cancel Changes</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={logout}
            activeOpacity={0.9}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}