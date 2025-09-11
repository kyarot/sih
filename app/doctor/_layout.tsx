import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function DoctorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true, // show headers, but customize per tab
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          // ❌ remove back arrow from dashboard
          headerLeft: () => null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: "Patients",
          headerLeft: () => null, // no back arrow
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Appointments",
          headerLeft: () => null, // no back arrow
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerLeft: () => null, // no back arrow
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
