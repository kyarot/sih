import { View, Text, StyleSheet } from "react-native";

export default function PharmacyAuth() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pharmacy Login / Register Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18 },
});
