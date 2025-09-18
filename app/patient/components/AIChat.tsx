import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  Animated,
} from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from "../../../components/TranslateProvider"; 
interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export default function AIChat() {
  const { t, translateDynamic, lang } = useTranslation(); // ✅ hook
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);

  // 🎙️ Start Recording
  const startRecording = async () => {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  // 🛑 Stop Recording + Send to Whisper
  const stopRecording = async () => {
    console.log("Stopping recording..");
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log("Recording stopped and stored at", uri);
    setRecording(null);

    if (uri) {
      await sendAudioToWhisper(uri);
    }
  };

  // ⬆️ Upload audio to Whisper API
  const sendAudioToWhisper = async (uri: string) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "audio/m4a",
        name: "speech.m4a",
      } as any);

      const res = await fetch("https://api.whisper-api.com/transcribe", {
        method: "POST",
        headers: {
          "X-API-Key": "xeFbxbTcprg5knh8d6IY4SZ3xWOxA_e9IBj6BBIRMkA",
        },
        body: formData,
      });

      const data = await res.json();
      console.log("Whisper Transcribe Response:", data);

      const { task_id } = data;
      if (!task_id) {
        throw new Error("No task_id returned from Whisper API");
      }

      let transcription = "";
      while (!transcription) {
        const statusRes = await fetch(`https://api.whisper-api.com/status/${task_id}`, {
          headers: { "X-API-Key": "xeFbxbTcprg5knh8d6IY4SZ3xWOxA_e9IBj6BBIRMkA" },
        });

        const statusData = await statusRes.json();
        console.log("Whisper Status:", statusData);

        if (statusData.status === "completed") {
          transcription = statusData.result;
        } else if (statusData.status === "failed") {
          throw new Error("Whisper transcription failed");
        } else {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      if (transcription) {
        handleSubmit(transcription);
      }
    } catch (err) {
      console.error("Whisper API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Send text input to backend
  const handleSubmit = async (text?: string) => {
    const finalInput = text || input;
    if (!finalInput.trim()) return;

    const translatedInput = await translateDynamic(finalInput); // ✅ translate user input

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: translatedInput,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://5aa83c1450d9.ngrok-free.app/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: finalInput }),
      });
      const data = await res.json();

      const aiReply = data.answer || t("server_error");
      const translatedAI = await translateDynamic(aiReply); // ✅ translate AI output

      const aiMessage: Message = {
        id: Date.now().toString() + "_ai",
        sender: "ai",
        text: translatedAI,
      };
      setMessages((prev) => [...prev, aiMessage]);

      if (speakerEnabled) {
        Speech.speak(translatedAI, { language: lang });
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "_err", sender: "ai", text: t("server_error") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeaker = () => {
    setSpeakerEnabled(!speakerEnabled);
    if (!speakerEnabled) {
      Speech.stop();
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <View
        style={[
          styles.message,
          item.sender === "user" ? styles.userMessage : styles.aiMessage,
        ]}
      >
        {item.sender === "ai" && (
          <View style={styles.aiHeader}>
            <View style={styles.aiAvatar}>
              <Ionicons name="medical" size={16} color="white" />
            </View>
            <Text style={styles.aiLabel}>{t("ai_assistant")}</Text>
            <View style={styles.aiStatusDot} />
          </View>
        )}
        <Text style={[
          styles.messageText,
          item.sender === "user" ? styles.userText : styles.aiText
        ]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="chatbubbles" size={28} color="white" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{t("ai_medical_chat")}</Text>
            <Text style={styles.headerSubtitle}>
              {messages.length > 0 ? `${messages.length} ${t("messages")}` : t("start_conversation")}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.speakerButton, !speakerEnabled && styles.speakerDisabled]}
            onPress={toggleSpeaker}
          >
            <Ionicons 
              name={speakerEnabled ? "volume-high" : "volume-mute"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <View style={styles.chatWrapper}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#1E40AF" />
            </View>
            <Text style={styles.emptyTitle}>{t("welcome_ai")}</Text>
            <Text style={styles.emptyText}>
              {t("describe_prompt")}
            </Text>
            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Ionicons name="mic-outline" size={20} color="#1E40AF" />
                <Text style={styles.featureText}>{t("voice_input")}</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="volume-high-outline" size={20} color="#1E40AF" />
                <Text style={styles.featureText}>{t("audio_responses")}</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#1E40AF" />
                <Text style={styles.featureText}>{t("medical_ai")}</Text>
              </View>
            </View>
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.chatContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputCard}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={t("describe_symptoms")}
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={setInput}
              editable={!loading}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
              onPress={() => handleSubmit()}
              disabled={!input.trim() || loading}
            >
              <Ionicons name="send" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.charCount}>
              {input.length}/500
            </Text>
            <TouchableOpacity
              style={[styles.micButton, recording ? styles.micActive : styles.micInactive]}
              onPress={recording ? stopRecording : startRecording}
              disabled={loading}
            >
              {recording ? (
                <Ionicons name="stop-circle" size={24} color="white" />
              ) : (
                <Ionicons name="mic" size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#1E40AF",
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
  },
  speakerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  speakerDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    opacity: 0.6,
  },
  chatWrapper: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  feature: {
    alignItems: "center",
  },
  featureText: {
    fontSize: 12,
    color: "#1E40AF",
    marginTop: 8,
    fontWeight: "600",
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 6,
  },
  message: {
    padding: 16,
    borderRadius: 20,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userMessage: {
    backgroundColor: "#1E40AF",
    alignSelf: "flex-end",
    borderBottomRightRadius: 6,
  },
  aiMessage: {
    backgroundColor: "white",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  aiLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    flex: 1,
  },
  aiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "white",
  },
  aiText: {
    color: "#1F2937",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  messageTime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginRight: 8,
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    padding: 16,
  },
  loadingCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    maxWidth: "85%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContent: {
    marginLeft: 10,
  },
  loadingLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1E40AF",
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  inputContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  inputCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: "white",
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charCount: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  micActive: {
    backgroundColor: "#DC2626",
  },
  micInactive: {
    backgroundColor: "#10B981",
  },
  recordingIndicator: {
    justifyContent: "center",
    alignItems: "center",
  },
});