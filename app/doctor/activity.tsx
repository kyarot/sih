import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from "react-native-safe-area-context";

const ActivityScreen = () => {
  type ActivityType = "appointment" | "report" | "payment" | "cancel";

interface Activity {
  id: number;
  type: ActivityType;
  message: string;
  time: string;
}

const activities: Activity[] = [
  { id: 1, type: "appointment", message: "New appointment with Sarah", time: "10:30 AM" },
  { id: 2, type: "report", message: "Blood report uploaded by John Doe", time: "9:15 AM" },
  { id: 3, type: "payment", message: "Payment received from Alice", time: "Yesterday" },
  { id: 4, type: "cancel", message: "David canceled his appointment", time: "Yesterday" },
];

  const reminders = [
    { id: 1, task: "Consultation with Sarah", time: "11:00 AM" },
    { id: 2, task: "Follow-up with John", time: "2:00 PM" },
    { id: 3, task: "Team meeting", time: "5:00 PM" },
  ];

const getActivityIcon = (type: "appointment" | "report" | "payment" | "cancel") => {
  switch (type) {
    case "appointment":
      return "calendar-outline";
    case "report":
      return "document-text-outline";
    case "payment":
      return "cash-outline";
    case "cancel":
      return "close-circle-outline";
    default:
      return "notifications-outline";
  }
};

const getActivityColor = (type: ActivityType) => {
  switch (type) {
    case "appointment":
      return "#00D4AA";
    case "report":
      return "#3B82F6";
    case "payment":
      return "#10B981";
    case "cancel":
      return "#FF6B6B";
    default:
      return "#8DA4CC";
  }
};

  return (
    <LinearGradient
      colors={['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Activity Center</Text>
            <Text style={styles.headerSubtitle}>Stay updated with your latest activities</Text>
          </View>

          {/* Recent Activities Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={['#FFB800', '#FFA000']}
                  style={styles.sectionIconGradient}
                >
                  <Ionicons name="flash" size={20} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
            </View>
            
            <View style={styles.activitiesContainer}>
              {activities.map((act, index) => (
                <View key={act.id} style={[
                  styles.activityCard,
                  index === activities.length - 1 && styles.lastActivityCard
                ]}>
                  <View style={styles.activityIconContainer}>
                    <LinearGradient
                      colors={[getActivityColor(act.type), getActivityColor(act.type) + 'DD']}
                      style={styles.activityIconGradient}
                    >
                      <Ionicons
                        name={getActivityIcon(act.type)}
                        size={20}
                        color="#FFFFFF"
                      />
                    </LinearGradient>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>{act.message}</Text>
                    <Text style={styles.activityTime}>{act.time}</Text>
                  </View>
                  <View style={[styles.activityIndicator, { backgroundColor: getActivityColor(act.type) }]} />
                </View>
              ))}
            </View>
          </View>

          {/* Today's Reminders Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.sectionIconGradient}
                >
                  <Ionicons name="time" size={20} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.sectionTitle}>Today's Reminders</Text>
            </View>
            
            <View style={styles.remindersContainer}>
              {reminders.map((rem, index) => (
                <View key={rem.id} style={[
                  styles.reminderCard,
                  index === reminders.length - 1 && styles.lastReminderCard
                ]}>
                  <View style={styles.reminderIconContainer}>
                    <LinearGradient
                      colors={['#F59E0B', '#D97706']}
                      style={styles.reminderIconGradient}
                    >
                      <MaterialIcons name="alarm" size={18} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <View style={styles.reminderContent}>
                    <Text style={styles.reminderTask}>{rem.task}</Text>
                    <Text style={styles.reminderTime}>{rem.time}</Text>
                  </View>
                  <TouchableOpacity style={styles.reminderAction} activeOpacity={0.8}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                      style={styles.reminderActionGradient}
                    >
                      <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions Section */}
          <View style={styles.actionsSection}>
            <Text style={styles.actionsTitle}>Quick Actions</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.primaryAction} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFF']}
                  style={styles.primaryActionGradient}
                >
                  <Ionicons name="notifications-outline" size={22} color="#1E40AF" />
                  <Text style={styles.primaryActionText}>View Notifications</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.8}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.secondaryActionGradient}
                >
                  <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
                  <Text style={styles.secondaryActionText}>Add Task</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // Header Styles
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 17,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },

  // Section Styles
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginHorizontal: 16,
    marginBottom: 16,
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  sectionIconContainer: {
    marginRight: 12,
  },
  sectionIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Activities Styles
  activitiesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
  },
  lastActivityCard: {
    borderBottomWidth: 0,
  },
  activityIconContainer: {
    marginRight: 16,
  },
  activityIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  activityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Reminders Styles
  remindersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  lastReminderCard: {
    borderBottomWidth: 0,
  },
  reminderIconContainer: {
    marginRight: 16,
  },
  reminderIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTask: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  reminderAction: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  reminderActionGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  // Actions Section Styles
  actionsSection: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionsContainer: {
    gap: 12,
  },
  primaryAction: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  primaryActionText: {
    color: "#1E40AF",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },
  secondaryAction: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  secondaryActionText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },
});