import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  patientId: string | null;
}

export default function BellIcon({ patientId }: Props) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = async () => {
    if (!patientId) {
      setNotifications([]);
      return;
    }
    try {
      const res = await fetch(
        `https://7300c4c894de.ngrok-free.app/api/notifications/patient/${patientId}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (!patientId) return;
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 5000); // poll every 5 sec
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [patientId]);

  // mark all as read when opening the panel
  const handleToggle = async () => {
    const newState = !showNotifications;
    setShowNotifications(newState);
    if (newState && patientId) {
      try {
        await fetch(
          `https://7300c4c894de.ngrok-free.app/api/notifications/patient/${patientId}/read-all`,
          {
            method: "PUT",
          }
        );
        // update local state to mark read (optimistic)
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error("Failed to mark read all:", err);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View>
      <TouchableOpacity onPress={handleToggle} style={styles.bellButton}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={24} color="white" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {showNotifications && (
        <View style={styles.panelContainer}>
          <View style={styles.panel}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="rgba(0, 0, 0, 0.6)" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="notifications-off-outline" size={48} color="rgba(30, 58, 138, 0.6)" />
                  </View>
                  <Text style={styles.emptyText}>No notifications yet</Text>
                  <Text style={styles.emptySubtext}>You'll receive updates about your appointments and health reminders here</Text>
                </View>
              ) : (
                notifications.map((note) => (
                  <View
                    key={note._id}
                    style={[
                      styles.notificationItem,
                      note.read ? styles.readNotification : styles.unreadNotification
                    ]}
                  >
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationIcon}>
                        <Ionicons 
                          name={note.read ? "checkmark-circle" : "information-circle"} 
                          size={20} 
                          color={note.read ? "rgba(34, 197, 94, 0.8)" : "rgba(59, 130, 246, 0.9)"} 
                        />
                      </View>
                      <View style={styles.notificationText}>
                        <Text style={[styles.messageText, note.read && styles.readMessageText]}>
                          {note.message}
                        </Text>
                        <Text style={styles.timeText}>
                          {new Date(note.createdAt).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    {!note.read && <View style={styles.unreadDot} />}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    padding: 8,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ef4444",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  panelContainer: {
    position: "absolute",
    top: 45,
    right: -10,
    zIndex: 1000,
  },
  panel: {
    width: 320,
    maxHeight: 420,
    borderRadius: 20,
    padding: 0,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  closeButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  scrollContainer: {
    maxHeight: 340,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.2)',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(30, 58, 138, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationItem: {
    marginVertical: 6,
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    borderWidth: 1,
  },
  unreadNotification: {
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    borderColor: 'rgba(30, 58, 138, 0.2)',
  },
  readNotification: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.2)',
  },
  notificationText: {
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    color: '#1e3a8a',
    lineHeight: 20,
    marginBottom: 6,
    fontWeight: '500',
  },
  readMessageText: {
    color: 'rgba(30, 58, 138, 0.6)',
    fontWeight: '400',
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(30, 58, 138, 0.5)',
    fontWeight: '400',
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
});