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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import FloatingBottomNav from "./components/FloatingBottomNav"; // Adjust path as needed

const { width } = Dimensions.get("window");

export default function DoctorLanding() {
  const [doctorId, setdoctorId] = useState("");
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
      const id = await AsyncStorage.getItem("doctorId");
      setDoctorName(name || "Doctor");
      setSpecialization(spec || "");
      setdoctorId(id || "");
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
    router.replace("/auth/doctor");
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <Stack.Screen options={{ headerShown: false }} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.welcomeText}>{getTimeGreeting()}</Text>
              <Text style={styles.doctorName}>Dr. {doctorName}</Text>
              <View style={styles.specializationContainer}>
                <Ionicons name="medical" size={14} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.specialization}>{specialization}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => router.push("/doctor/profile")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F0F9FF']}
                  style={styles.profileGradient}
                >
                  <Ionicons name="person" size={24} color="#1E40AF" />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.logoutGradient}
                >
                  <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                </LinearGradient>
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
                <View style={styles.statusLeft}>
                  <View style={styles.statusIconContainer}>
                    <LinearGradient
                      colors={isAvailable ? ['#00D4AA', '#00B894'] : ['#FF6B6B', '#E55353']}
                      style={styles.statusIconGradient}
                    >
                      <Ionicons 
                        name={isAvailable ? "checkmark-circle" : "pause-circle"} 
                        size={20} 
                        color="#FFFFFF" 
                      />
                    </LinearGradient>
                  </View>
                  <View>
                    <Text style={styles.statusTitle}>Doctor Status</Text>
                    <View style={styles.statusIndicator}>
                      <View style={[styles.statusDot, { backgroundColor: isAvailable ? '#00D4AA' : '#FF6B6B' }]} />
                      <Text style={[styles.statusText, { color: isAvailable ? '#00D4AA' : '#FF6B6B' }]}>
                        {isAvailable ? 'Available for Consultations' : 'Currently Unavailable'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Switch
                  value={isAvailable}
                  onValueChange={updateStatus}
                  trackColor={{ false: 'rgba(255, 107, 107, 0.3)', true: 'rgba(0, 212, 170, 0.3)' }}
                  thumbColor={isAvailable ? '#00D4AA' : '#FF6B6B'}
                  ios_backgroundColor="rgba(255, 255, 255, 0.3)"
                  style={styles.switch}
                />
              </View>
            </View>

            {/* Analytics Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View style={styles.chartTitleContainer}>
                  <View style={styles.chartIconContainer}>
                    <LinearGradient
                      colors={['#8B5CF6', '#7C3AED']}
                      style={styles.chartIconGradient}
                    >
                      <Ionicons name="analytics" size={18} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.cardTitle}>Weekly Appointments</Text>
                </View>
              </View>
              <View style={styles.chartWrapper}>
                {loadingChart ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="analytics" size={32} color="rgba(30, 64, 175, 0.5)" />
                    <Text style={styles.loadingText}>Loading analytics...</Text>
                  </View>
                ) : (
                  <LineChart
                    data={{
                      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                      datasets: [{ data: weeklyData.map(val => val || 0) }],
                    }}
                    width={width - 72}
                    height={200}
                    chartConfig={{
                      backgroundColor: "#FFFFFF",
                      backgroundGradientFrom: "#FFFFFF",
                      backgroundGradientTo: "#FFFFFF",
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(30, 64, 175, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(30, 64, 175, ${opacity * 0.8})`,
                      propsForDots: {
                        r: "6",
                        strokeWidth: "3",
                        stroke: "#1E40AF",
                        fill: "#FFFFFF",
                        strokeDasharray: "",
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: "",
                        stroke: "rgba(30, 64, 175, 0.1)",
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

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    style={styles.statIconGradient}
                  >
                    <Ionicons name="calendar" size={16} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.statLabel}>This Week</Text>
                </View>
                <Text style={styles.statNumber}>
                  {weeklyData.reduce((sum, count) => sum + count, 0)}
                </Text>
                <Text style={styles.statSubtext}>Total Appointments</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.statIconGradient}
                  >
                    <Ionicons name="trending-up" size={16} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.statLabel}>Peak Day</Text>
                </View>
                <Text style={styles.statNumber}>
                  {Math.max(...weeklyData)}
                </Text>
                <Text style={styles.statSubtext}>Maximum in a Day</Text>
              </View>
            </View>

            {/* Welcome Message */}
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeHeader}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.welcomeIconGradient}
                >
                  <Ionicons name="star" size={18} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.welcomeTitle}>Dashboard Overview</Text>
              </View>
              <Text style={styles.welcomeMessage}>
                Access your patient appointments, consultation history, activity logs, and video calls using the navigation tabs below. Your dashboard provides real-time insights into your practice.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Floating Bottom Navigation */}
      <FloatingBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 16,
  },
  headerLeft: { 
    flex: 1 
  },
  welcomeText: { 
    fontSize: 16, 
    color: "rgba(255, 255, 255, 0.8)", 
    fontWeight: "500" 
  },
  doctorName: { 
    fontSize: 28, 
    fontWeight: "800", 
    color: "#FFFFFF", 
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  specializationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  specialization: { 
    fontSize: 15, 
    color: "rgba(255, 255, 255, 0.8)", 
    marginLeft: 6,
    fontWeight: "500",
  },
  headerRight: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12 
  },
  profileButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  profileGradient: {
    width: 48, 
    height: 48, 
    borderRadius: 24,
    justifyContent: "center", 
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  logoutButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  logoutGradient: {
    width: 48, 
    height: 48, 
    borderRadius: 24,
    justifyContent: "center", 
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    paddingHorizontal: 16, 
    paddingTop: 8, 
    paddingBottom: 140 // Increased padding to accommodate floating nav
  },
  
  statusCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: 'blur(10px)',
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  statusHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusIconContainer: {
    marginRight: 16,
  },
  statusIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statusIndicator: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  statusDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 8,
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: { 
    fontSize: 14, 
    fontWeight: "600" 
  },
  switch: {
    transform: [{ scale: 1.1 }],
  },
  
  chartCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: 'blur(10px)',
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chartIconContainer: {
    marginRight: 12,
  },
  chartIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#FFFFFF" 
  },
  chartWrapper: { 
    alignItems: "center", 
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "rgba(30, 64, 175, 0.7)",
    fontWeight: "500",
  },
  chart: { 
    marginVertical: 8, 
    borderRadius: 12 
  },
  
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: 'blur(10px)',
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statIconGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statSubtext: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  
  welcomeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: 'blur(10px)',
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  welcomeIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  welcomeMessage: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    fontWeight: "400",
  },
});