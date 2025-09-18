import { Ionicons } from "@expo/vector-icons";
import { Stack, Tabs } from "expo-router";
import { Platform } from "react-native";

export default function DoctorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: "white",
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "600",
          color: "#1E40AF",
        },
        headerTitleAlign: "left",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          height: Platform.OS === "ios" ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          elevation: 8,
          shadowColor: "#1E40AF",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: "#1E40AF",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
        <Stack screenOptions={{ headerShown: false }} />
      <Tabs.Screen
      
        options={{
         
          headerLeft: () => null,
          headerStyle: {
            backgroundColor: "white",
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: "700",
            color: "#1E40AF",
            marginLeft: 16,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "grid" : "grid-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
          
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: "Patients",
          headerLeft: () => null,
          headerStyle: {
            backgroundColor: "white",
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: "700",
            color: "#1E40AF",
            marginLeft: 16,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "people" : "people-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
          tabBarLabel: "Patients",
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Appointments",
          headerLeft: () => null,
          headerStyle: {
            backgroundColor: "white",
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: "700",
            color: "#1E40AF",
            marginLeft: 16,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "calendar" : "calendar-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
          tabBarLabel: "Appointments",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerLeft: () => null,
          headerStyle: {
            backgroundColor: "white",
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: "700",
            color: "#1E40AF",
            marginLeft: 16,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "person-circle" : "person-circle-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  );
}