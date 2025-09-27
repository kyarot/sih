import { useLocalSearchParams } from "expo-router";
import { View, StyleSheet, Text, Platform, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import React from "react";
import { LinearGradient } from 'expo-linear-gradient';

export default function VideoCallScreen() {
  const { videoLink } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  if (!videoLink) {
    return (
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        style={styles.container}
      >
        <View style={styles.errorContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.errorCard}
          >
            <View style={styles.errorIconContainer}>
              <Ionicons name="videocam-off" size={56} color="rgba(255, 255, 255, 0.9)" />
            </View>
            <Text style={styles.errorTitle}>No Video Link Available</Text>
            <Text style={styles.errorSubtitle}>
              Please check your connection and try again
            </Text>
            <TouchableOpacity style={styles.retryButton}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.retryButtonGradient}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.retryText}>Retry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </LinearGradient>
    );
  }

  // ✅ On Web, use iframe
  if (Platform.OS === "web") {
    return (
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        style={styles.container}
      >
        {/* Enhanced Header */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <View style={styles.liveIndicator}>
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                style={styles.liveIndicatorGradient}
              >
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </LinearGradient>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.headerButtonGradient}
              >
                <Ionicons name="settings" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        {/* Enhanced Video Container */}
        <View style={styles.videoContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.videoFrame}
          >
            {isLoading && (
              <LinearGradient
                colors={['rgba(30, 58, 138, 0.95)', 'rgba(59, 130, 246, 0.85)']}
                style={styles.loadingOverlay}
              >
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingSpinner} />
                  <Text style={styles.loadingText}>Connecting to video call...</Text>
                  <Text style={styles.loadingSubtext}>Please wait while we establish the connection</Text>
                </View>
              </LinearGradient>
            )}
            <iframe
              src={String(videoLink)}
              style={{ width: "100%", height: "100%", border: "none", borderRadius: 16 }}
              allow="camera; microphone; fullscreen; display-capture"
              onLoad={() => setIsLoading(false)}
            />
          </LinearGradient>
        </View>

        {/* Enhanced Controls */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.controls}
        >
          <TouchableOpacity style={styles.controlButton}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)']}
              style={styles.controlButtonGradient}
            >
              <Ionicons name="mic" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)']}
              style={styles.controlButtonGradient}
            >
              <Ionicons name="videocam" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.controlButton, styles.endCallButton]}>
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.controlButtonGradient}
            >
              <Ionicons name="call" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)']}
              style={styles.controlButtonGradient}
            >
              <Ionicons name="chatbubble" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)']}
              style={styles.controlButtonGradient}
            >
              <Ionicons name="people" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </LinearGradient>
    );
  }

  // ✅ On Android/iOS, use WebView
  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6']}
      style={styles.container}
    >
      {/* Enhanced Header */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <View style={styles.liveIndicator}>
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.liveIndicatorGradient}
            >
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </LinearGradient>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.headerButtonGradient}
            >
              <Ionicons name="settings" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Enhanced Video Container */}
      <View style={styles.videoContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.videoFrame}
        >
          {isLoading && (
            <LinearGradient
              colors={['rgba(30, 58, 138, 0.95)', 'rgba(59, 130, 246, 0.85)']}
              style={styles.loadingOverlay}
            >
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner} />
                <Text style={styles.loadingText}>Connecting to video call...</Text>
                <Text style={styles.loadingSubtext}>Please wait while we establish the connection</Text>
              </View>
            </LinearGradient>
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
        </LinearGradient>
      </View>

      {/* Enhanced Controls */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.controls}
      >
        <TouchableOpacity style={styles.controlButton}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)']}
            style={styles.controlButtonGradient}
          >
            <Ionicons name="mic" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)']}
            style={styles.controlButtonGradient}
          >
            <Ionicons name="videocam" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.controlButton, styles.endCallButton]}>
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            style={styles.controlButtonGradient}
          >
            <Ionicons name="call" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)']}
            style={styles.controlButtonGradient}
          >
            <Ionicons name="chatbubble" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)']}
            style={styles.controlButtonGradient}
          >
            <Ionicons name="people" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveIndicator: {
    alignSelf: "flex-start",
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  liveIndicatorGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
  liveText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  headerButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  videoContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  videoFrame: {
    flex: 1,
    borderRadius: 20,
    padding: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  webview: { 
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    position: "absolute",
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderRadius: 18,
  },
  loadingContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingSpinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderTopColor: "#FFFFFF",
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: 'center',
    lineHeight: 20,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    gap: 15,
  },
  controlButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  controlButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  endCallButton: {
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorCard: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  retryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});