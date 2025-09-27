import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import axios from "axios";

const { width } = Dimensions.get("window");

export default function DoctorLanding() {
  const [doctorId,setdoctorId]=useState("");
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);
  const [doctorName, setDoctorName] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    const loadDoctor = async () => {
      const name = await AsyncStorage.getItem("doctorName");
      const spec = await AsyncStorage.getItem("specialization");
      const id=await AsyncStorage.getItem("doctorId");
      setDoctorName(name || "Doctor");
      setSpecialization(spec || "");
      setdoctorId(id||"");
    };
    loadDoctor();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoadingChart(true);
        const doctorId = await AsyncStorage.getItem("doctorId");
        if (!doctorId) return;

        // Fetch all appointments for this doctor
        const response = await axios.get(`https://7300c4c894de.ngrok-free.app/api/appointments/doctor/${doctorId}`);
        const appointments = response.data;

        // Initialize counts for each day: Sun -> Sat
        const counts = [0, 0, 0, 0, 0, 0, 0];

        appointments.forEach(appt => {
          const date = new Date(appt.createdAt);
          const dayIndex = date.getDay(); // 0=Sun, 1=Mon ...
          counts[dayIndex] += 1;
        });

        // Reorder counts to Mon -> Sun
        const orderedCounts = [counts[1], counts[2], counts[3], counts[4], counts[5], counts[6], counts[0]];
        setWeeklyData(orderedCounts);
        setLoadingChart(false);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setLoadingChart(false);
      }
    };

    fetchAppointments();
    const interval = setInterval(fetchAppointments, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);
const updateStatus = async (value) => {
  try {
    console.log("inside handle")
    setIsAvailable(value); // update UI immediately
    // const doctorId = await AsyncStorage.getItem("doctorId");
    // if (!doctorId) return;

    const res = await fetch(`https://7300c4c894de.ngrok-free.app/api/doctors/${doctorId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_online: value }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error("Failed to update status");
    }
  } catch (err) {
    console.error("Error updating status:", err);
    setIsAvailable(!value); // rollback if API fails
  }
};
  const handleLogout = async () => {
    await AsyncStorage.clear();
    Alert.alert("Logged Out", "You have been logged out successfully");
    router.replace("/doctor-auth");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Good morning</Text>
          <Text style={styles.doctorName}> {doctorName}</Text>
          <Text style={styles.specialization}>{specialization}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/doctor/profile")}
          >
            <Ionicons name="person-circle" size={32} color="#1E40AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#1E40AF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: isAvailable ? '#10B981' : '#EF4444' }]} />
              <Text style={styles.statusText}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </Text>
            </View>
           <Switch
  value={isAvailable}
  onValueChange={updateStatus}
  trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
  thumbColor={isAvailable ? '#1E40AF' : '#F3F4F6'}
/>
          </View>
        </View>

        {/* Analytics Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Weekly Appointments</Text>
          <View style={styles.chartWrapper}>
            {loadingChart ? (
              <Text>Loading chart...</Text>
            ) : (
              <LineChart
                data={{
                  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                  datasets: [{ data: weeklyData }],
                }}
                width={width - 60}
                height={200}
                chartConfig={{
                  backgroundColor: "#FFFFFF",
                  backgroundGradientFrom: "#FFFFFF",
                  backgroundGradientTo: "#FFFFFF",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(30, 64, 175, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#1E40AF",
                    fill: "#1E40AF"
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: "",
                    stroke: "#E5E7EB",
                    strokeWidth: 1,
                  },
                }}
                bezier
                style={styles.chart}
                withHorizontalLines={true}
                withVerticalLines={false}
                withInnerLines={false}
                withOuterLines={false}
              />
            )}
          </View>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome to your Dashboard</Text>
          <Text style={styles.welcomeMessage}>
            Use the navigation tabs below to access Patients, Appointments, Activity logs, and Video calls.
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {weeklyData.reduce((sum, count) => sum + count, 0)}
            </Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {Math.max(...weeklyData)}
            </Text>
            <Text style={styles.statLabel}>Peak Day</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC",
    paddingBottom: 100, // Add padding for floating navbar
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#ffffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: { flex: 1 },
  welcomeText: { fontSize: 14, color: "#6B7280", fontWeight: "400" },
  doctorName: { fontSize: 24, fontWeight: "700", color: "#1E40AF", marginTop: 2 },
  specialization: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  profileButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center"
  },
  logoutButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center"
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  statusCard: { 
    backgroundColor: "#FFFFFF", 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 20, 
    shadowColor: "#1E40AF", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    elevation: 4 
  },
  statusHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusIndicator: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusText: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  chartCard: { 
    backgroundColor: "#FFFFFF", 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 20, 
    shadowColor: "#1E40AF", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    elevation: 4 
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#1F2937", marginBottom: 16 },
  chartWrapper: { alignItems: "center", overflow: "hidden" },
  chart: { marginVertical: 8, borderRadius: 12 },
  welcomeCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#1E40AF",
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 8,
  },
  welcomeMessage: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});