import React, { useState, useRef } from "react";
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
} from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { Ionicons } from '@expo/vector-icons';
interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export default function AIChat() {
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

      // Step 1: Start transcription
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

      // Step 2: Poll status until transcription is ready
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

      // Step 3: Pass text to chatbot
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

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: finalInput,
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

      const aiMessage: Message = {
        id: Date.now().toString() + "_ai",
        sender: "ai",
        text: data.answer || "Sorry, I couldn't process that.",
      };

      setMessages((prev) => [...prev, aiMessage]);

      // 🔊 Speak response only if speaker is enabled
      if (speakerEnabled) {
        Speech.speak(aiMessage.text, { language: "en" });
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "_err", sender: "ai", text: "⚠️ Server error, try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeaker = () => {
    setSpeakerEnabled(!speakerEnabled);
    if (!speakerEnabled) {
      // Stop any current speech
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
              <Ionicons name="medical" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.aiLabel}>AI Assistant</Text>
          </View>
        )}
        <Text style={[
          styles.messageText,
          item.sender === "user" ? styles.userText : styles.aiText
        ]}>
          {item.text}
        </Text>
        {item.sender === "user" && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={16} color="#FFFFFF" />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="medical-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Medical AI Chat</Text>
        </View>
        <TouchableOpacity
          style={[styles.speakerButton, !speakerEnabled && styles.speakerDisabled]}
          onPress={toggleSpeaker}
        >
          <Ionicons 
            name={speakerEnabled ? "volume-high" : "volume-mute"} 
            size={20} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <View style={styles.chatWrapper}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}
      </View>

      {/* Input Container */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Describe your symptoms..."
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
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.micButton,
            recording ? styles.micActive : styles.micInactive
          ]}
          onPress={recording ? stopRecording : startRecording}
          disabled={loading}
        >
          <Ionicons 
            name={recording ? "stop-circle" : "mic"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
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
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  speakerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  speakerDisabled: {
    backgroundColor: "#6B7280",
  },
  chatWrapper: {
    flex: 1,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 4,
  },
  message: {
    padding: 16,
    borderRadius: 16,
    maxWidth: "85%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userMessage: {
    backgroundColor: "#3B82F6",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  aiMessage: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  aiAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1E3A8A",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  userText: {
    color: "#FFFFFF",
  },
  aiText: {
    color: "#1F2937",
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
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
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: "#F9FAFB",
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sendButtonDisabled: {
    backgroundColor: "#9CA3AF",
    elevation: 0,
    shadowOpacity: 0,
  },
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  micActive: {
    backgroundColor: "#DC2626",
  },
  micInactive: {
    backgroundColor: "#10B981",
  },
});