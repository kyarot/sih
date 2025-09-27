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
          backgroundColor: 'rgba(30, 64, 175, 0.85)',
          borderRadius: 25,
          height: Platform.OS === "ios" ? 70 : 65,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 12 : 8,
          paddingHorizontal: 10,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          elevation: 20,
          shadowColor: "#1E40AF",
          shadowOffset: { 
            width: 0, 
            height: 10 
          },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)",
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
            color: "#1E40AF",
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
            <MaterialIcons 
              name="timeline" 
              size={focused ? size + 3 : size} 
              color={color}
            />
          ),
          tabBarLabel: "Activity",
        }}
      />
      
      <Tabs.Screen
        name="video-call"
        options={{
          title: "Video Call",
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
              name={focused ? "videocam" : "videocam-outline"} 
              size={focused ? size + 3 : size} 
              color={color}
            />
          ),
          tabBarLabel: "Video Call",
        }}
      />
    </Tabs>
  );
}