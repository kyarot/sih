import { useLocalSearchParams } from "expo-router";
import { View, StyleSheet, Text, Platform, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import React from "react";

export default function VideoCallScreen() {
  const { videoLink } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  if (!videoLink) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="videocam-off" size={48} color="#1E40AF" />
          </View>
          <Text style={styles.errorTitle}>No Video Link Available</Text>
          <Text style={styles.errorSubtitle}>
            Please check your connection and try again
          </Text>
          <TouchableOpacity style={styles.retryButton}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ✅ On Web, use iframe
  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="settings" size={20} color="#1E40AF" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.videoContainer}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner} />
                <Text style={styles.loadingText}>Connecting to video call...</Text>
              </View>
            </View>
          )}
          <iframe
            src={String(videoLink)}
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="camera; microphone; fullscreen; display-capture"
            onLoad={() => setIsLoading(false)}
          />
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="mic" size={24} color="#1E40AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="videocam" size={24} color="#1E40AF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, styles.endCallButton]}>
            <Ionicons name="call" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="chatbubble" size={24} color="#1E40AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="people" size={24} color="#1E40AF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ✅ On Android/iOS, use WebView
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="settings" size={20} color="#1E40AF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.videoContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSpinner} />
              <Text style={styles.loadingText}>Connecting to video call...</Text>
            </View>
          </View>
        )}
        <WebView
          source={{ uri: String(videoLink) }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="mic" size={24} color="#1E40AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="videocam" size={24} color="#1E40AF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, styles.endCallButton]}>
          <Ionicons name="call" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="chatbubble" size={24} color="#1E40AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="people" size={24} color="#1E40AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
    letterSpacing: 0.5,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000000",
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  webview: { 
    flex: 1,
    borderRadius: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderRadius: 16,
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#E5E7EB",
    borderTopColor: "#1E40AF",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  endCallButton: {
    backgroundColor: "#1E40AF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#FFFFFF",
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E40AF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});