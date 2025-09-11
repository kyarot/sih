import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AppointmentsPage() {
  const appointments = [
    {
      id: 1,
      patient: "Amit Sharma",
      time: "10:00 AM",
      date: "Sep 12, 2025",
      status: "Upcoming",
      type: "In-person",
    },
    {
      id: 2,
      patient: "Neha Verma",
      time: "12:30 PM",
      date: "Sep 12, 2025",
      status: "Upcoming",
      type: "Video Call",
    },
    {
      id: 3,
      patient: "Rahul Gupta",
      time: "Yesterday",
      date: "Sep 9, 2025",
      status: "Completed",
      type: "In-person",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>📅 Appointments</Text>
      <Text style={styles.subtitle}>
        View and manage all your upcoming and past appointments
      </Text>

      {/* Appointment List */}
      {appointments.map((appt) => (
        <View
          key={appt.id}
          style={[
            styles.card,
            appt.status === "Completed"
              ? { borderLeftColor: "#16A34A" }
              : { borderLeftColor: "#2563EB" },
          ]}
        >
          <View style={styles.row}>
            <Text style={styles.patient}>{appt.patient}</Text>
            <Text
              style={[
                styles.status,
                appt.status === "Completed"
                  ? { color: "#16A34A" }
                  : { color: "#2563EB" },
              ]}
            >
              {appt.status}
            </Text>
          </View>

          <Text style={styles.details}>
            {appt.date} • {appt.time}
          </Text>
          <Text style={styles.details}>Type: {appt.type}</Text>

          <View style={styles.actions}>
            {appt.status === "Upcoming" ? (
              <>
                <TouchableOpacity style={styles.primaryBtn}>
                  <Text style={styles.btnText}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn}>
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>View Report</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },
  header: { fontSize: 24, fontWeight: "700", color: "#1E3A8A", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  patient: { fontSize: 18, fontWeight: "600", color: "#111827" },
  status: { fontSize: 14, fontWeight: "600" },
  details: { fontSize: 14, color: "#374151", marginBottom: 2 },
  actions: { flexDirection: "row", marginTop: 10 },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#DC2626",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#111827", fontWeight: "600" },
});
