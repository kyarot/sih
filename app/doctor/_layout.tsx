import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { Stack, Tabs } from "expo-router";
import React from "react";
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
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          backgroundColor: 'rgba(30, 64, 175, 0.15)',
          borderRadius: 25,
          height: Platform.OS === "ios" ? 70 : 65,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 12 : 8,
          paddingHorizontal: 10,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          elevation: 20,
          shadowColor: "#1E40AF",
          shadowOffset: { 
            width: 0, 
            height: 10 
          },
          shadowOpacity: 0.2,
          shadowRadius: 20,
        },
        tabBarActiveTintColor: "#1E40AF",
        tabBarInactiveTintColor: "rgba(107, 114, 128, 0.7)",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
          borderRadius: 15,
          marginHorizontal: 2,
        },
        tabBarBackground: () => null,
      }}
    >
      <Stack screenOptions={{ headerShown: false }} />
      
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
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
              name={focused ? "home" : "home-outline"} 
              size={focused ? size + 3 : size} 
              color={color}
            />
          ),
          tabBarLabel: "Dashboard",
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
              name={focused ? "people-circle" : "people-circle-outline"} 
              size={focused ? size + 3 : size} 
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
            color: "#b9c3e3ff",
            marginLeft: 16,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <FontAwesome5 
              name={focused ? "calendar-check" : "calendar"} 
              size={focused ? size + 1 : size - 2} 
              color={color}
            />
          ),
          tabBarLabel: "Appointments",
        }}
      />
      
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
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
              name={focused ? "pulse" : "pulse-outline"} 
              size={focused ? size + 3 : size} 
              color={color}
            />
          ),
          tabBarLabel: "Activity",
        }}
      />
      
      {/* Hide unwanted tabs */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // This completely hides the tab
        }}
      />
      
     
      <Tabs.Screen
        name="video-call"
        options={{
          href: null, // This completely hides the tab
        }}
      />
      <Tabs.Screen
  name="prescriptions"
  options={{
    href: null, // completely hides it from the tab bar
  }}
/>

      
      <Tabs.Screen
        name="patient-details"
        options={{
          
        }}
      />
    </Tabs>
  );
}