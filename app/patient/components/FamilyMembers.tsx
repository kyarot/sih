import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from "react-native";
import { useTranslation } from "../../../components/TranslateProvider"; 

const { width } = Dimensions.get('window');

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
  const { t } = useTranslation();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [isMainExpanded, setIsMainExpanded] = useState<boolean>(true);

  const toggleMainExpansion = () => {
    setIsMainExpanded(!isMainExpanded);
    // Close any individual expanded cards when collapsing main
    if (isMainExpanded) {
      setExpandedCard(null);
    }
  };

  const handleMemberPress = (profile: FamilyProfile) => {
    const profileId = profile._id ?? profile.uid;
    
    // Toggle expansion
    if (expandedCard === profileId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(profileId);
    }
    
    // Call the original onSelect function
    onSelect(profile);
  };

  const getGenderIcon = (gender?: string) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return 'man';
      case 'female':
        return 'woman';
      default:
        return 'person';
    }
  };

  const getAgeGroup = (age?: number | string) => {
    const ageNum = typeof age === 'string' ? parseInt(age) : age;
    if (!ageNum) return '';
    
    if (ageNum < 13) return 'Child';
    if (ageNum < 20) return 'Teen';
    if (ageNum < 60) return 'Adult';
    return 'Senior';
  };

  return (
    <View style={styles.container}>
      {/* Compact Header */}
      <TouchableOpacity style={styles.header} onPress={toggleMainExpansion} activeOpacity={0.8}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="people" size={16} color="white" />
          </View>
          <Text style={styles.title}>Family Members</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{familyProfiles.length}</Text>
          </View>
          <Ionicons 
            name={isMainExpanded ? "chevron-up" : "chevron-down"} 
            size={18} 
            color="white" 
            style={styles.expandIcon}
          />
        </View>
      </TouchableOpacity>

      {/* Conditional Content - Only show when expanded */}
      {isMainExpanded && (
        <>
          {/* Compact Scroll View */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            {familyProfiles.map((profile) => {
          const profileId = profile._id ?? profile.uid;
          const isSelected = selectedFamilyId === profileId;
          const isExpanded = expandedCard === profileId;
          
          return (
            <TouchableOpacity
              key={profileId}
              style={[
                styles.memberCard,
                isSelected && styles.memberCardActive,
                isExpanded && styles.memberCardExpanded
              ]}
              onPress={() => handleMemberPress(profile)}
              activeOpacity={0.8}
            >
              {/* Compact Card Content */}
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, isSelected && styles.avatarActive]}>
                  <Ionicons 
                    name={getGenderIcon(profile.gender)} 
                    size={18} 
                    color={isSelected ? "white" : "#1E40AF"} 
                  />
                </View>
                
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, isSelected && styles.memberNameActive]} numberOfLines={1}>
                    {profile.name}
                  </Text>
                  {profile.age && (
                    <Text style={[styles.memberAge, isSelected && styles.memberAgeActive]}>
                      {profile.age}y • {getAgeGroup(profile.age)}
                    </Text>
                  )}
                </View>

                {/* Status Icons */}
                <View style={styles.statusIcons}>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={14} color="white" />
                  )}
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={12} 
                    color={isSelected ? "white" : "#64748B"} 
                  />
                </View>
              </View>

              {/* Expandable Details */}
              {isExpanded && (
                <View style={styles.expandedDetails}>
                  <View style={styles.detailsGrid}>
                    {profile.gender && (
                      <View style={styles.detailItem}>
                        <Ionicons name="person-outline" size={12} color={isSelected ? "rgba(255,255,255,0.7)" : "#64748B"} />
                        <Text style={[styles.detailText, isSelected && styles.detailTextActive]}>
                          {profile.gender}
                        </Text>
                      </View>
                    )}
                    
                    {profile.bloodGroup && (
                      <View style={styles.detailItem}>
                        <Ionicons name="water-outline" size={12} color={isSelected ? "rgba(255,255,255,0.7)" : "#64748B"} />
                        <Text style={[styles.detailText, isSelected && styles.detailTextActive]}>
                          {profile.bloodGroup}
                        </Text>
                      </View>
                    )}

                    {profile.phone && (
                      <View style={styles.detailItem}>
                        <Ionicons name="call-outline" size={12} color={isSelected ? "rgba(255,255,255,0.7)" : "#64748B"} />
                        <Text style={[styles.detailText, isSelected && styles.detailTextActive]} numberOfLines={1}>
                          {profile.phone}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        }        )}

        {/* Compact Add Card */}
        {familyProfiles.length < 5 && (
          <TouchableOpacity style={styles.addCard} onPress={onAddPress} activeOpacity={0.7}>
            <View style={styles.addHeader}>
              <View style={styles.addIcon}>
                <Ionicons name="add" size={18} color="#1E40AF" />
              </View>
              <View style={styles.addInfo}>
                <Text style={styles.addText}>Add Member</Text>
                <Text style={styles.addCount}>{familyProfiles.length}/5</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Compact Helper */}
      <View style={styles.helperContainer}>
        <Ionicons name="information-circle-outline" size={14} color="#64748B" />
        <Text style={styles.helperText}>Tap to expand • Selected for appointments</Text>
      </View>
      </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  
  // Compact Header
  header: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.2,
  },
  countBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  expandIcon: {
    marginLeft: 4,
  },

  // Compact Scroll
  scrollView: {
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  // Compact Member Cards
  memberCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginRight: 12,
    width: 120,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memberCardActive: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
    shadowColor: "#1E40AF",
    shadowOpacity: 0.2,
    elevation: 4,
  },
  memberCardExpanded: {
    width: 140,
  },
  
  cardHeader: {
    padding: 12,
    alignItems: "center",
  },
  
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  avatarActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  
  memberInfo: {
    alignItems: "center",
    width: "100%",
  },
  memberName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  memberNameActive: {
    color: "white",
  },
  memberAge: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
  },
  memberAgeActive: {
    color: "rgba(255, 255, 255, 0.8)",
  },

  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },

  // Expanded Details
  expandedDetails: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  detailsGrid: {
    gap: 6,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    flex: 1,
  },
  detailTextActive: {
    color: "rgba(255, 255, 255, 0.8)",
  },

  // Compact Add Card
  addCard: {
    backgroundColor: "white",
    borderRadius: 12,
    width: 120,
    borderWidth: 1.5,
    borderColor: "#1E40AF",
    borderStyle: "dashed",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addHeader: {
    padding: 12,
    alignItems: "center",
  },
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#DBEAFE",
  },
  addInfo: {
    alignItems: "center",
  },
  addText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 2,
    textAlign: "center",
  },
  addCount: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
  },

  // Compact Helper
  helperContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F8FAFC",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  helperText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    flex: 1,
  },
});