import { useLocalSearchParams } from "expo-router";
import { View, StyleSheet, Text, Platform } from "react-native";
import { WebView } from "react-native-webview";

export default function VideoCallScreen() {
  const { videoLink } = useLocalSearchParams();

  if (!videoLink) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>No video link provided</Text>
      </View>
    );
  }

  // ✅ On Web, use iframe
  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <iframe
          src={String(videoLink)}
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="camera; microphone; fullscreen; display-capture"
        />
      </View>
    );
  }

  // ✅ On Android/iOS, use WebView
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: String(videoLink) }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  webview: { flex: 1 },
});
