import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

type Props = {
  familyProfiles: FamilyProfile[];
  selectedFamilyId: string | null;
  onSelect: (profile: FamilyProfile) => void;
  onAddPress: () => void;
};

export default function FamilyMembers({ familyProfiles, selectedFamilyId, onSelect, onAddPress }: Props) {
  const { t } = useTranslation(); // ✅

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={20} color="white" />
          </View>
          <Text style={styles.title}>{t("family_members")}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{familyProfiles.length}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {familyProfiles.map((profile) => {
          const isSelected = selectedFamilyId === (profile._id ?? profile.uid);
          return (
            <TouchableOpacity
              key={profile._id ?? profile.uid}
              style={[styles.memberCard, isSelected && styles.memberCardActive]}
              onPress={() => onSelect(profile)}
              activeOpacity={0.8}
            >
              <View style={[styles.avatarContainer, isSelected && styles.avatarContainerActive]}>
                <Ionicons name="person" size={24} color={isSelected ? "white" : "#1E40AF"} />
              </View>

              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, isSelected && styles.memberNameActive]} numberOfLines={1}>
                  {profile.name}
                </Text>

                {profile.age && (
                  <Text style={[styles.memberAge, isSelected && styles.memberAgeActive]}>
                    {profile.age} {t("years")}
                  </Text>
                )}
              </View>

              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {familyProfiles.length < 5 && (
          <TouchableOpacity style={styles.addCard} onPress={onAddPress} activeOpacity={0.7}>
            <View style={styles.addIconContainer}>
              <Ionicons name="add" size={28} color="#1E40AF" />
            </View>
            <View style={styles.addInfo}>
              <Text style={styles.addText}>{t("add_member")}</Text>
              <Text style={styles.addSubtext}>{t("up_to_5_members")}</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: "white",
    borderRadius: 16,
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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  countBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    backgroundColor: "white",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  memberCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    position: "relative",
  },
  memberCardActive: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
    transform: [{ scale: 1.02 }],
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  avatarContainerActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  memberInfo: {
    alignItems: "center",
    width: "100%",
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 2,
  },
  memberNameActive: {
    color: "white",
  },
  memberAge: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  memberAgeActive: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 2,
  },
  addCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    minWidth: 120,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1E40AF",
    borderStyle: "dashed",
  },
  addIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  addInfo: {
    alignItems: "center",
  },
  addText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 2,
  },
  addSubtext: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
});