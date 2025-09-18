import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

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


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Center</Text>
        <Text style={styles.headerSubtitle}>Stay updated with your latest activities</Text>
      </View>

      {/* Recent Activities Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash" size={20} color="#1E40AF" />
          <Text style={styles.sectionTitle}>Recent Activities</Text>
        </View>
        
        <View style={styles.activitiesContainer}>
          {activities.map((act, index) => (
            <View key={act.id} style={[
              styles.activityCard,
              index === activities.length - 1 && styles.lastActivityCard
            ]}>
              <View style={styles.activityIconContainer}>
                <Ionicons
                  name={getActivityIcon(act.type)}
                  size={20}
                  color="#1E40AF"
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{act.message}</Text>
                <Text style={styles.activityTime}>{act.time}</Text>
              </View>
              <View style={styles.activityIndicator} />
            </View>
          ))}
        </View>
      </View>

      {/* Today's Reminders Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time" size={20} color="#1E40AF" />
          <Text style={styles.sectionTitle}>Today's Reminders</Text>
        </View>
        
        <View style={styles.remindersContainer}>
          {reminders.map((rem, index) => (
            <View key={rem.id} style={[
              styles.reminderCard,
              index === reminders.length - 1 && styles.lastReminderCard
            ]}>
              <View style={styles.reminderIconContainer}>
                <MaterialIcons name="alarm" size={18} color="#1E40AF" />
              </View>
              <View style={styles.reminderContent}>
                <Text style={styles.reminderTask}>{rem.task}</Text>
                <Text style={styles.reminderTime}>{rem.time}</Text>
              </View>
              <TouchableOpacity style={styles.reminderAction}>
                <Ionicons name="chevron-forward" size={16} color="#1E40AF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions Section */}
      <View style={styles.actionsSection}>
        <Text style={styles.actionsTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryAction}>
            <Ionicons name="notifications-outline" size={20} color="white" />
            <Text style={styles.primaryActionText}>View Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction}>
            <Ionicons name="add-circle-outline" size={20} color="#1E40AF" />
            <Text style={styles.secondaryActionText}>Add Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },

  // Section Styles
  section: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginLeft: 8,
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
    borderBottomColor: "#f1f5f9",
    position: "relative",
  },
  lastActivityCard: {
    borderBottomWidth: 0,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 2,
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  activityIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1E40AF",
    opacity: 0.6,
  },

  // Reminders Styles
  remindersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  lastReminderCard: {
    borderBottomWidth: 0,
  },
  reminderIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTask: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 2,
  },
  reminderTime: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  reminderAction: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },

  // Actions Section Styles
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  primaryAction: {
    backgroundColor: "#1E40AF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryAction: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1E40AF",
  },
  secondaryActionText: {
    color: "#1E40AF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});