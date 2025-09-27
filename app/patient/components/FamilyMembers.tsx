// app/components/FamilyMembers.tsx
import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

export type FamilyProfile = {
  _id?: string;
  uid: string;
  name: string;
  age?: number | string;
  gender?: string;
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

export default function FamilyMembers({
  familyProfiles,
  selectedFamilyId,
  onSelect,
  onAddPress,
}: Props) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {familyProfiles.map((profile) => {
          const isSelected =
            profile._id === selectedFamilyId || profile.uid === selectedFamilyId;
          return (
            <TouchableOpacity
              key={profile._id || profile.uid}
              style={[styles.card, isSelected && styles.selectedCard]}
              onPress={() => onSelect(profile)}
            >
              <Text style={styles.cardText}>{profile.name}</Text>
              {profile.age && <Text style={styles.cardSubText}>Age: {profile.age}</Text>}
            </TouchableOpacity>
          );
        })}

        {/* Add new profile button */}
        <TouchableOpacity style={styles.addCard} onPress={onAddPress}>
          <Text style={styles.addText}>+ Add Family</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  card: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  selectedCard: { borderColor: "#3B82F6", borderWidth: 2 },
  cardText: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  cardSubText: { fontSize: 12, color: "#64748B", marginTop: 4 },
  addCard: {
    backgroundColor: "#E0E7FF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  addText: { color: "#1D4ED8", fontWeight: "700" },
});
