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
  const activities = [
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

  return (
    <ScrollView style={styles.container}>
      {/* Activity Feed */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Recent Activities</Text>
        {activities.map((act) => (
          <View key={act.id} style={styles.activityCard}>
            <Ionicons
              name={
                act.type === "appointment"
                  ? "calendar-outline"
                  : act.type === "report"
                  ? "document-text-outline"
                  : act.type === "payment"
                  ? "cash-outline"
                  : "close-circle-outline"
              }
              size={24}
              color="#2563eb"
              style={{ marginRight: 10 }}
            />
            <View>
              <Text style={styles.activityText}>{act.message}</Text>
              <Text style={styles.activityTime}>{act.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Reminders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏰ Today's Reminders</Text>
        {reminders.map((rem) => (
          <View key={rem.id} style={styles.reminderCard}>
            <MaterialIcons name="alarm" size={20} color="#f59e0b" />
            <Text style={styles.reminderText}>
              {rem.task} - {rem.time}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="notifications-outline" size={20} color="white" />
          <Text style={styles.actionText}> View Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text style={styles.actionText}> Add Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 15 },

  section: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },

  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5ff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  activityText: { fontSize: 14, fontWeight: "500" },
  activityTime: { fontSize: 12, color: "gray" },

  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7ed",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  reminderText: { marginLeft: 8, fontSize: 14, fontWeight: "500" },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  actionText: { color: "white", fontWeight: "bold" },
});