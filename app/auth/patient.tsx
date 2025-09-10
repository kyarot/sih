import { View, Text, StyleSheet } from "react-native";

export default function PatientAuth() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Patient Login / Register Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18 },
});
