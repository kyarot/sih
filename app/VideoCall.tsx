// app/VideoCall.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, Stack } from "expo-router";

export default function VideoCallScreen() {
  const { videoLink } = useLocalSearchParams<{ videoLink: string }>();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: "Video Consultation" }} />
      <WebView
        source={{ uri: videoLink }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  webview: { flex: 1 },
});
