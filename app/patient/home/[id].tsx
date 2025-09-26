// [id].tsx
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";

import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
const router = useRouter();

const { width, height } = Dimensions.get("window");

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export default function PatientHome() {
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const [sheetY] = useState(new Animated.Value(height * 0.6)); // Start at 60% for better spacing
  const [currentY, setCurrentY] = useState(height * 0.6);
const [patientId, setpatientId] = useState<string | null>(null);
  const [patientUid, setpatientUid] = useState<string| null>(null);

   useEffect(() => {
      const loadDoctor = async () => {
        const id = await AsyncStorage.getItem("patientId");
        const uid = await AsyncStorage.getItem("PatientUid");
        setpatientId(id);
        setpatientUid(uid);
      };
      loadDoctor();
    }, []);
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
    onPanResponderGrant: () => {
      sheetY.setOffset(currentY);
      sheetY.setValue(0);
    },
    onPanResponderMove: (_, gestureState) => {
      const minY = height * 0.6; // Increased minimum to provide more space for chat
      const maxY = height * 0.85; // Fixed maximum height
      const newY = Math.max(minY, Math.min(maxY, gestureState.dy + currentY));
      sheetY.setValue(newY - currentY);
    },
    onPanResponderRelease: (_, gestureState) => {
      sheetY.flattenOffset();
      let finalY = currentY + gestureState.dy;
      const velocity = gestureState.vy;
      let targetY;
      
      // Fixed snap positions with better spacing
      if (velocity > 0.5) targetY = height * 0.85;
      else if (velocity < -0.5) targetY = height * 0.6;
      else if (finalY < height * 0.725) targetY = height * 0.6;
      else targetY = height * 0.85;
      
      setCurrentY(targetY);
      Animated.spring(sheetY, { toValue: targetY, useNativeDriver: false, tension: 100, friction: 8 }).start();
    },
  });

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setRecording(recording);
    } catch (err) { console.error(err); }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      setRecording(null);
      if (!uri) return;

      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(",")[1];
        if (!base64Audio) return;
        try {
          setLoading(true);
          const res = await axios.post("https://7300c4c894de.ngrok-free.app/api/speech/transcribe", { audio: base64Audio });
          const transcription = res.data.transcription;
          if (transcription) handleSubmit(transcription);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
      };
      reader.readAsDataURL(blob);
    } catch (err) { console.error(err); setRecording(null); setLoading(false); }
  };

  const handleSubmit = async (text?: string) => {
    const finalInput = text || textInput;
    if (!finalInput.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), sender: "user", text: finalInput };
    setMessages(prev => [...prev, userMessage]);
    setTextInput("");
    setLoading(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const res = await fetch("https://7300c4c894de.ngrok-free.app/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: finalInput }),
      });
      const data = await res.json();
      const aiReply = data.answer || "Server error";
      const aiMessage: Message = { id: Date.now().toString() + "_ai", sender: "ai", text: aiReply };
      setMessages(prev => [...prev, aiMessage]);
      if (speakerEnabled) Speech.speak(aiReply);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleSpeaker = () => {
    setSpeakerEnabled(!speakerEnabled);
    if (!speakerEnabled) Speech.stop();
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <View style={[
        styles.messageBubble,
        item.sender === "user" ? styles.userMessage : styles.aiMessage
      ]}>
        <Text style={[
          styles.messageText,
          item.sender === "user" ? styles.userMessageText : styles.aiMessageText
        ]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <LinearGradient colors={["#1E3A8A", "#3B82F6", "#8dc2ffff"]} style={styles.fullBackground}>
        
        {/* Header */}
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.floatingButton}>
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton}>
            <Ionicons name="location" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.languageButton}>
            <Text style={styles.languageText}>English</Text>
            <Ionicons name="language" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton}>
            <Ionicons name="notifications" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Chat Area - Positioned with proper constraints to avoid overlap */}
      <Animated.View style={[
        styles.chatContainer,
        {
          maxHeight: Animated.subtract(sheetY, new Animated.Value(200)).interpolate({
            inputRange: [height * 0.35, height * 0.85],
            outputRange: [height * 0.2, height * 0.35],
            extrapolate: 'clamp'
          })
        }
      ]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.chatList}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}
      </Animated.View>

      {/* Mic Button - Above text input, properly spaced from chat */}
      <Animated.View style={[
        styles.micButtonContainer,
        { 
          top: Animated.subtract(sheetY, new Animated.Value(120))
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.micButton,
            recording && styles.micButtonRecording
          ]}
          onPress={recording ? stopRecording : startRecording}
          disabled={loading}
        >
          <Ionicons 
            name={recording ? "stop" : "mic"} 
            size={28} 
            color="white" 
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Text Input - Below mic button with proper spacing */}
      <Animated.View style={[
        styles.inputWrapper, 
        { 
          top: Animated.subtract(sheetY, new Animated.Value(60))
        }
      ]}>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="text here"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={textInput}
            onChangeText={setTextInput}
            editable={!loading}
            multiline={false}
            onSubmitEditing={() => handleSubmit()}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => handleSubmit()}
            disabled={!textInput.trim() || loading}
          >
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.speakerButton} onPress={toggleSpeaker}>
          <Ionicons name={speakerEnabled ? "volume-high" : "volume-mute"} size={20} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Sheet - Fixed height, scrollable content only */}
      <Animated.View style={[styles.bottomContainer, { top: sheetY }]} {...panResponder.panHandlers}>
        <View style={styles.handleBar} />

        {/* Fixed Height Scrollable Content */}
        <View style={styles.scrollableWrapper}>
          <ScrollView 
            style={styles.scrollableContent} 
            contentContainerStyle={styles.scrollableContentContainer}
            showsVerticalScrollIndicator={false} 
            bounces={true}
          >
          {/* First Row Icons */}
          <View style={styles.iconRow}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="calendar-outline" size={32} color="white" />
              <Text style={styles.iconLabel}>Appointments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}
             onPress={() =>
    router.push({
      pathname: "/patient/screens/PrescriptionScreen",
      params: { patientUid:patientId }, // pass patient id if needed
    })
  }
 >
              <Ionicons name="document-text-outline" size={32} color="white" />
              <Text style={styles.iconLabel}>Prescriptions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="time-outline" size={32} color="white" />
              <Text style={styles.iconLabel}>History</Text>
            </TouchableOpacity>
          </View>

          {/* Second Row Icons */}
          <View style={styles.iconRow}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="medical-outline" size={32} color="white" />
              <Text style={styles.iconLabel}>Search Pharma</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="people-outline" size={32} color="white" />
              <Text style={styles.iconLabel}>Family</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="bulb-outline" size={32} color="white" />
              <Text style={styles.iconLabel}>Health Tips</Text>
            </TouchableOpacity>
          </View>

          {/* Emergency SOS Button */}
          <TouchableOpacity style={styles.emergencyButton}>
            <LinearGradient colors={["#DC2626", "#EF4444"]} style={styles.emergencyGradient}>
              <Text style={styles.emergencyText}>Emergency SOS</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.extraContent}>
            <Text style={styles.extraText}>Scroll for more options</Text>
            <View style={styles.spacer} />
          </View>
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#1E3A8A" 
  },
  fullBackground: { 
    flex: 1,
    paddingTop: 50 
  },
  headerButtons: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  floatingButton: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: "rgba(255,255,255,0.2)", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  languageButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "rgba(255,255,255,0.2)", 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderRadius: 20, 
    gap: 5 
  },
  languageText: { 
    color: "white", 
    fontSize: 14, 
    fontWeight: "500" 
  },
  chatContainer: { 
    position: 'absolute',
    left: 20,
    right: 20,
    top: 140,
    zIndex: 5,
    // maxHeight will be controlled by animation to prevent overlap
  },
  chatList: {
    flex: 1,
  },
  chatContent: { 
    paddingVertical: 10,
    flexGrow: 1,
    justifyContent: 'flex-end'
  },
  messageContainer: { 
    marginVertical: 4 
  },
  messageBubble: { 
    padding: 14, 
    borderRadius: 20, 
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userMessage: { 
    backgroundColor: "rgba(255,255,255,0.95)", 
    alignSelf: "flex-end", 
    borderBottomRightRadius: 6 
  },
  aiMessage: { 
    backgroundColor: "rgba(30, 58, 138, 0.9)", 
    alignSelf: "flex-start", 
    borderBottomLeftRadius: 6,
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1
  },
  messageText: { 
    fontSize: 15,
    lineHeight: 20
  },
  userMessageText: { 
    color: "#1F2937" 
  },
  aiMessageText: { 
    color: "white" 
  },
  loadingContainer: { 
    alignItems: "center", 
    paddingVertical: 10 
  },
  loadingText: { 
    color: "rgba(255,255,255,0.8)", 
    fontSize: 14, 
    fontStyle: "italic" 
  },
  micButtonContainer: {
    position: 'absolute',
    left: width / 2 - 30,
    zIndex: 15,
    alignItems: 'center',
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)"
  },
  micButtonRecording: {
    backgroundColor: "rgba(220, 38, 38, 0.8)",
    borderColor: "rgba(220, 38, 38, 0.5)"
  },
  inputWrapper: { 
    position: "absolute", 
    left: 20, 
    right: 20, 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12, 
    zIndex: 10 
  },
  textInputContainer: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "rgba(255,255,255,0.25)", 
    borderRadius: 25, 
    paddingHorizontal: 18, 
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)"
  },
  textInput: { 
    flex: 1, 
    color: "white", 
    fontSize: 15, 
    paddingVertical: 10
  },
  sendButton: { 
    padding: 8,
    marginLeft: 5
  },
  speakerButton: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    backgroundColor: "rgba(255,255,255,0.2)", 
    alignItems: "center", 
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)"
  },
  bottomContainer: { 
    position: "absolute", 
    left: 0, 
    right: 0, 
    height: height * 0.5, // Fixed height instead of full height
    backgroundColor: "rgba(255,255,255,0.15)", 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)"
  },
  handleBar: { 
    width: 60, 
    height: 5, 
    backgroundColor: "rgba(255,255,255,0.5)", 
    borderRadius: 3, 
    alignSelf: "center", 
    marginBottom: 25 
  },
  scrollableWrapper: {
    flex: 1,
  },
  scrollableContent: { 
    flex: 1,
  },
  scrollableContentContainer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  iconRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 25 
  },
  iconButton: { 
    width: 70, 
    height: 70, 
    borderRadius: 20, 
    backgroundColor: "rgba(255,255,255,0.2)", 
    alignItems: "center", 
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)"
  },
  iconLabel: { 
    marginTop: 8, 
    color: "white", 
    fontSize: 12, 
    textAlign: "center", 
    fontWeight: "500" 
  },
  emergencyButton: { 
    marginTop: 20, 
    marginBottom: 30, 
    borderRadius: 15, 
    overflow: "hidden" 
  },
  emergencyGradient: { 
    paddingVertical: 15, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  emergencyText: { 
    color: "white", 
    fontSize: 18, 
    fontWeight: "700", 
    letterSpacing: 1 
  },
  extraContent: { 
    paddingVertical: 40, 
    alignItems: "center" 
  },
  extraText: { 
    color: "rgba(255,255,255,0.7)", 
    fontSize: 14, 
    fontStyle: "italic" 
  },
  spacer: {
    height: 100,
  },
});