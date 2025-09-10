import { View, Text, Button, StyleSheet } from "react-native";

export default function AuthScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Role</Text>

      <Button title="Doctor Login / Register" onPress={() => {}} />
      <Button title="Patient Login / Register" onPress={() => {}} />
      <Button title="Pharmacy Login / Register" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
  },
});
