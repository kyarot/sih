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
  Animated,
  Dimensions,
  Modal,
} from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from "../../../components/TranslateProvider"; 

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export default function AIChat() {
  const { t, translateDynamic, lang } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Floating button animations
  React.useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (!isExpanded) {
      pulseAnimation.start();
    } else {
      pulseAnimation.stop();
      pulseAnim.setValue(1);
    }
    
    return () => pulseAnimation.stop();
  }, [isExpanded]);

  const handleFloatingButtonPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setIsExpanded(true);
  };

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

    const translatedInput = await translateDynamic(finalInput);

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
      const translatedAI = await translateDynamic(aiReply);

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
              <Ionicons name="medical" size={14} color="white" />
            </View>
            <Text style={styles.aiLabel}>Medical AI Assistant</Text>
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

  const renderFloatingButton = () => (
    <Animated.View
      style={[
        styles.floatingButtonContainer,
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleFloatingButtonPress}
        activeOpacity={0.9}
      >
        <View style={styles.floatingButtonContent}>
          <Ionicons name="medical" size={24} color="white" />
          <View style={styles.notificationBadge}>
            <Ionicons name="pulse" size={10} color="white" />
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.floatingButtonShadow} />
    </Animated.View>
  );

  const renderExpandedChat = () => (
    <Modal
      visible={isExpanded}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsExpanded(false)}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setIsExpanded(false)}
            >
              <Ionicons name="chevron-down" size={20} color="white" />
            </TouchableOpacity>
            <View style={styles.headerIconContainer}>
              <Ionicons name="heart" size={20} color="white" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>AI Medical Consultant</Text>
              <Text style={styles.headerSubtitle}>
                {messages.length > 0 
                  ? `${messages.length} consultation${messages.length !== 1 ? 's' : ''} active` 
                  : "Ready for medical consultation"
                }
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
                size={18} 
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
              <Ionicons name="heart" size={48} color="#1E40AF" />
            </View>
              <Text style={styles.emptyTitle}>Professional Medical AI Assistant</Text>
              <Text style={styles.emptyText}>
                Describe your symptoms, medical concerns, or health questions. Our AI provides evidence-based guidance and preliminary assessments.
              </Text>
              <View style={styles.disclaimerContainer}>
                <View style={styles.disclaimerIcon}>
                  <Ionicons name="information-circle-outline" size={16} color="#1E40AF" />
                </View>
                <Text style={styles.disclaimerText}>
                  This AI assistant provides general medical information only and should not replace professional medical advice, diagnosis, or treatment.
                </Text>
              </View>
              <View style={styles.featuresContainer}>
                <View style={styles.feature}>
                  <Ionicons name="mic" size={20} color="#1E40AF" />
                  <Text style={styles.featureTitle}>Voice Input</Text>
                  <Text style={styles.featureText}>Speak your symptoms naturally</Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="volume-high" size={20} color="#1E40AF" />
                  <Text style={styles.featureTitle}>Audio Response</Text>
                  <Text style={styles.featureText}>Hear responses aloud</Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="shield-checkmark" size={20} color="#1E40AF" />
                  <Text style={styles.featureTitle}>Medical AI</Text>
                  <Text style={styles.featureText}>Evidence-based guidance</Text>
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
          
          {loading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingCard}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="medical" size={14} color="white" />
                </View>
                <View style={styles.loadingContent}>
                  <Text style={styles.loadingLabel}>AI is analyzing...</Text>
                  <View style={styles.loadingDots}>
                    <Animated.View style={[styles.dot, styles.dot1]} />
                    <Animated.View style={[styles.dot, styles.dot2]} />
                    <Animated.View style={[styles.dot, styles.dot3]} />
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Input */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputCard}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Describe your symptoms or medical concerns..."
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
                  {input.length}/500 characters
                </Text>
                <TouchableOpacity
                  style={[styles.micButton, recording ? styles.micActive : styles.micInactive]}
                  onPress={recording ? stopRecording : startRecording}
                  disabled={loading}
                >
                  {recording ? (
                    <View style={styles.recordingIndicator}>
                      <Ionicons name="stop" size={20} color="white" />
                    </View>
                  ) : (
                    <Ionicons name="mic" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <>
      {renderFloatingButton()}
      {renderExpandedChat()}
    </>
  );
}

const styles = StyleSheet.create({
  // Floating Button Styles
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: "white",
  },
  floatingButtonContent: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 32,
    backgroundColor: 'rgba(30, 64, 175, 0.2)',
    zIndex: -1,
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10B981",
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },

  // Main Container Styles
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#1E40AF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
  },
  speakerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    padding: 16,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  disclaimerContainer: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  disclaimerIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  disclaimerText: {
    fontSize: 11,
    color: "#92400E",
    lineHeight: 16,
    flex: 1,
    fontWeight: "500",
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  feature: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 4,
  },
  featureTitle: {
    fontSize: 12,
    color: "#1E40AF",
    marginTop: 8,
    fontWeight: "700",
    textAlign: "center",
  },
  featureText: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "500",
    textAlign: "center",
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  inputCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: "white",
    fontSize: 14,
    maxHeight: 80,
    minHeight: 36,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 10,
    color: "#9CA3AF",
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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