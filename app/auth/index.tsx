import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function AuthPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Role</Text>
      <Button title="Doctor" onPress={() => router.push("/auth/doctor")} />
      <Button title="Patient" onPress={() => router.push("/auth/patient")} />
      <Button title="Pharmacy" onPress={() => router.push("/auth/pharmacy")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
  },
});
