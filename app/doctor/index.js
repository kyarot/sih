import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

const { width } = Dimensions.get("window");

export default function DoctorLanding() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);
  const [doctorName, setDoctorName] = useState("");
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    const loadDoctor = async () => {
      const name = await AsyncStorage.getItem("doctorName");
      const spec = await AsyncStorage.getItem("specialization");
      setDoctorName(name || "Doctor");
      setSpecialization(spec || "");
    };
    loadDoctor();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    Alert.alert("Logged Out", "You have been logged out successfully");
    router.replace("/doctor-auth");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>👨‍⚕️ Welcome, {doctorName}</Text>
          <Text style={styles.headerSub}>{specialization}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/doctor/profile")}
          >
            <Ionicons name="person-circle" size={40} color="#1976D2" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 10 }} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={34} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Availability Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>
          Status: {isAvailable ? "🟢 Online" : "🔴 Offline"}
        </Text>
        <Switch
          value={isAvailable}
          onValueChange={setIsAvailable}
          trackColor={{ false: "#767577", true: "#90CAF9" }}
          thumbColor={isAvailable ? "#1976D2" : "#f4f3f4"}
        />
      </View>

      {/* Analytics Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>📊 Weekly Appointments</Text>
        <LineChart
          data={{
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            datasets: [{ data: [5, 3, 7, 4, 8, 6] }],
          }}
          width={width * 0.9}
          height={220}
          chartConfig={{
            backgroundColor: "#fdfdfd",
            backgroundGradientFrom: "#fdfdfd",
            backgroundGradientTo: "#fdfdfd",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 37, 41, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(108, 117, 125, ${opacity})`,
            propsForDots: { r: "6", strokeWidth: "2", stroke: "#1976D2" },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Grid of Feature Cards */}
      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#E3F2FD" }]}
          onPress={() => router.push("/doctor/activity")}
        >
          <MaterialIcons name="timeline" size={40} color="#1976D2" />
          <Text style={styles.cardText}>Activity</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#E8F5E9" }]}
          onPress={() => router.push("/doctor/appointments")}
        >
          <FontAwesome5 name="calendar-check" size={36} color="#388E3C" />
          <Text style={styles.cardText}>Appointments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#E0F7FA" }]}
          onPress={() => router.push("/doctor/patient-details")}
        >
          <Ionicons name="people-circle" size={40} color="#0097A7" />
          <Text style={styles.cardText}>Patients</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#FFEBEE" }]}
          onPress={() => router.push("/doctor/video-call")}
        >
          <Ionicons name="videocam" size={40} color="#D32F2F" />
          <Text style={styles.cardText}>Video Call</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfdfd",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212529",
  },
  headerSub: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  profileButton: { padding: 2 },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
    padding: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
  },
  toggleLabel: { fontSize: 16, fontWeight: "600", color: "#374151" },
  chartContainer: { alignItems: "center", marginBottom: 20 },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#212529",
  },
  chart: { borderRadius: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: width * 0.42,
    height: width * 0.42,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  cardText: { marginTop: 12, fontSize: 16, fontWeight: "600", color: "#333" },
});
