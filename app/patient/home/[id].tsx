// [id].tsx
import React, { JSX,useState, useRef, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

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
import { Alert, ActivityIndicator } from "react-native";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { updatePatientLocation } from "../utils/patientHelper";
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

  const { id } = useLocalSearchParams();
  const accountId: string = (id as string) || "";
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<{ uid: string; name: string } | null>(null);
  const [familyProfiles, setFamilyProfiles] = useState<any[]>([]);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const [sheetY] = useState(new Animated.Value(height * 0.55));
  const [currentY, setCurrentY] = useState(height * 0.55);
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

    //handle location
  const handleSaveLocation = async () => {
    setLocationLoading(true);
    console.log("Patient UID:", patientUid);
    if (patientUid === null) {
      setLocationLoading(false);
      Alert.alert("Error", "Patient UID is missing. Try logging in again.");
      return;
    }
    const result = await updatePatientLocation(
      patientUid,
      "https://7300c4c894de.ngrok-free.app/api"
    );
    setLocationLoading(false);

    if (result.success) {
      Alert.alert("Location Saved Successfully", result.message);
    } else {
      Alert.alert("Error", result.message);
    }
  };


const switcherAnim = useRef(new Animated.Value(-width)).current;

  const toggleSwitcher = () => {
    if (showSwitcher) {
      Animated.timing(switcherAnim, { toValue: -width, duration: 300, useNativeDriver: false }).start(() =>
        setShowSwitcher(false)
      );
    } else {
      setShowSwitcher(true);
      Animated.timing(switcherAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
    }
  };

  const selectProfile = async (profile: any) => {
    setSelectedFamily(profile);
    await AsyncStorage.setItem(`family-${accountId}`, JSON.stringify(profile));
    toggleSwitcher();
  };

    useEffect(() => {
    async function loadFamily() {
      try {
        const storedFamily = await AsyncStorage.getItem(`family-${accountId}`);
        if (storedFamily) {
          setSelectedFamily(JSON.parse(storedFamily));
        }

        // Fetch family profiles from API
        if (accountId) {
          const res = await fetch(`https://7300c4c894de.ngrok-free.app/api/patients/family/${accountId}`);
          const data = await res.json();
          setFamilyProfiles(data || []);
        }
      } catch (error) {
        console.error("Failed to load family data:", error);
      }
    }

    if (accountId) loadFamily();
  }, [accountId]);
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to gestures on the handle bar area
      const touchY = evt.nativeEvent.pageY;
      const handleBarY = currentY + 15; // Handle bar position
      return Math.abs(touchY - handleBarY) < 30; // Only handle bar area
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const touchY = evt.nativeEvent.pageY;
      const handleBarY = currentY + 15;
      return Math.abs(touchY - handleBarY) < 30 && Math.abs(gestureState.dy) > 8;
    },
    onPanResponderGrant: () => {
      sheetY.setOffset(currentY);
      sheetY.setValue(0);
    },
    onPanResponderMove: (_, gestureState) => {
      const minY = height * 0.55;
      const maxY = height * 0.88;
      const newY = Math.max(minY, Math.min(maxY, gestureState.dy + currentY));
      sheetY.setValue(newY - currentY);
    },
    onPanResponderRelease: (_, gestureState) => {
      sheetY.flattenOffset();
      let finalY = currentY + gestureState.dy;
      const velocity = gestureState.vy;
      let targetY;
      
      if (velocity > 0.8) targetY = height * 0.88;
      else if (velocity < -0.8) targetY = height * 0.55;
      else if (finalY < height * 0.715) targetY = height * 0.55;
      else targetY = height * 0.88;
      
      setCurrentY(targetY);
      Animated.spring(sheetY, { 
        toValue: targetY, 
        useNativeDriver: false, 
        tension: 80, 
        friction: 12 
      }).start();
    },
  });

  const routetoSearch=()=>{
    router.push('/patient/screens/searchpharma')
  }

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
      
      {/* Background Gradient */}
      <LinearGradient 
        colors={["#1E3A8A", "#3B82F6", "#60A5FA"]} 
        style={StyleSheet.absoluteFillObject} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
              style={styles.headerButtonGradient}
            >
              <Ionicons name="person" size={22} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSaveLocation}
            disabled={locationLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
              style={styles.headerButtonGradient}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="location" size={22} color="white" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>MediConnect</Text>
          <Text style={styles.headerSubtitle}>Your Health Assistant</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.languageButton} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
              style={styles.languageButtonGradient}
            >
              <Text style={styles.languageText}>EN</Text>
              <Ionicons name="language" size={14} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
              style={styles.headerButtonGradient}
            >
              <Ionicons name="notifications" size={22} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Area */}
      <Animated.View style={[
        styles.chatContainer,
        {
          maxHeight: Animated.subtract(sheetY, new Animated.Value(180)).interpolate({
            inputRange: [height * 0.3, height * 0.88],
            outputRange: [height * 0.15, height * 0.4],
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
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>AI is analyzing...</Text>
          </View>
        )}
      </Animated.View>

      {/* Mic Button */}
      <Animated.View style={[
        styles.micButtonContainer,
        { 
          top: Animated.subtract(sheetY, new Animated.Value(110))
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.micButton,
            recording && styles.micButtonRecording
          ]}
          onPress={recording ? stopRecording : startRecording}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={recording 
              ? ['rgba(220, 38, 38, 0.9)', 'rgba(239, 68, 68, 0.8)'] 
              : ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']
            }
            style={styles.micButtonGradient}
          >
            <Ionicons 
              name={recording ? "stop" : "mic"} 
              size={28} 
              color="white" 
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Text Input */}
      <Animated.View style={[
        styles.inputWrapper, 
        { 
          top: Animated.subtract(sheetY, new Animated.Value(50))
        }
      ]}>
        <View style={styles.textInputContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
            style={styles.textInputGradient}
          >
            <TextInput
              style={styles.textInput}
              placeholder="Describe your symptoms..."
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
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']}
                style={styles.sendButtonGradient}
              >
                <Ionicons name="arrow-forward" size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <TouchableOpacity 
          style={styles.speakerButton} 
          onPress={toggleSpeaker}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
            style={styles.speakerButtonGradient}
          >
            <Ionicons name={speakerEnabled ? "volume-high" : "volume-mute"} size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.bottomContainer, { top: sheetY }]}>
        <View style={styles.handleBar} {...panResponder.panHandlers} />

        <View style={styles.scrollableWrapper}>
          <ScrollView 
            style={styles.scrollableContent} 
            contentContainerStyle={styles.scrollableContentContainer}
            showsVerticalScrollIndicator={false} 
            bounces={true}
            nestedScrollEnabled={true}
            scrollEventThrottle={16}
          >
            {/* Service Grid */}
            <View style={styles.servicesGrid}>
              {/* Row 1 */}
              <TouchableOpacity 
                style={styles.serviceCard} 
                onPress={() => router.push('/patient/screens/AppointementsScreen')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
                  style={styles.serviceCardGradient}
                >
                  <View style={styles.serviceIconContainer}>
                    <Ionicons name="calendar-outline" size={28} color="white" />
                  </View>
                  <Text style={styles.serviceTitle}>Appointments</Text>
                  <Text style={styles.serviceSubtitle}>Book & manage</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.serviceCard}
                onPress={() =>
                  router.push({
                    pathname: "/patient/screens/PrescriptionScreen",
                    params: { patientUid: patientId },
                  })
                }
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
                  style={styles.serviceCardGradient}
                >
                  <View style={styles.serviceIconContainer}>
                    <Ionicons name="document-text-outline" size={28} color="white" />
                  </View>
                  <Text style={styles.serviceTitle}>Prescriptions</Text>
                  <Text style={styles.serviceSubtitle}>View & download</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.serviceCard} 
                onPress={() => router.push('/patient/screens/history')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
                  style={styles.serviceCardGradient}
                >
                  <View style={styles.serviceIconContainer}>
                    <Ionicons name="time-outline" size={28} color="white" />
                  </View>
                  <Text style={styles.serviceTitle}>History</Text>
                  <Text style={styles.serviceSubtitle}>Medical records</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Row 2 */}
              <TouchableOpacity 
                style={styles.serviceCard} 
                onPress={routetoSearch}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
                  style={styles.serviceCardGradient}
                >
                  <View style={styles.serviceIconContainer}>
                    <Ionicons name="medical-outline" size={28} color="white" />
                  </View>
                  <Text style={styles.serviceTitle}>Pharmacy</Text>
                  <Text style={styles.serviceSubtitle}>Find medicines</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push(`/patient/screens/Family?id=${accountId}`)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
                  style={styles.serviceCardGradient}
                >
                  <View style={styles.serviceIconContainer}>
                    <Ionicons name="people-outline" size={28} color="white" />
                  </View>
                  <Text style={styles.serviceTitle}>Family</Text>
                  <Text style={styles.serviceSubtitle}>Manage profiles</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.serviceCard} activeOpacity={0.8}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
                  style={styles.serviceCardGradient}
                >
                  <View style={styles.serviceIconContainer}>
                    <Ionicons name="fitness-outline" size={28} color="white" />
                  </View>
                  <Text style={styles.serviceTitle}>Health Tips</Text>
                  <Text style={styles.serviceSubtitle}>Stay healthy</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Emergency SOS Button */}
            <TouchableOpacity style={styles.emergencyButton} activeOpacity={0.8}>
              <LinearGradient 
                colors={["#DC2626", "#EF4444"]} 
                style={styles.emergencyGradient}
              >
                <View style={styles.emergencyContent}>
                  <Ionicons name="medical" size={24} color="white" />
                  <Text style={styles.emergencyText}>Emergency SOS</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Additional Services */}
            <View style={styles.additionalServices}>
              <Text style={styles.sectionTitle}>More Services</Text>
              <View style={styles.additionalGrid}>
                <TouchableOpacity style={styles.additionalService} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                    style={styles.additionalServiceGradient}
                  >
                    <Ionicons name="heart-outline" size={20} color="white" />
                    <Text style={styles.additionalServiceText}>Health Monitoring</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.additionalService} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                    style={styles.additionalServiceGradient}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color="white" />
                    <Text style={styles.additionalServiceText}>Telemedicine</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.additionalService} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                    style={styles.additionalServiceGradient}
                  >
                    <Ionicons name="settings-outline" size={20} color="white" />
                    <Text style={styles.additionalServiceText}>Settings</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
  },
  headerButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginTop: 2,
  },
  languageButton: {
    height: 40,
  },
  languageButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  languageText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  chatContainer: { 
    position: 'absolute',
    left: 20,
    right: 20,
    top: 130,
    zIndex: 5,
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
    padding: 16, 
    borderRadius: 20, 
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  userMessage: { 
    backgroundColor: "rgba(255,255,255,0.95)", 
    alignSelf: "flex-end", 
    borderBottomRightRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  aiMessage: { 
    backgroundColor: "rgba(30, 58, 138, 0.9)", 
    alignSelf: "flex-start", 
    borderBottomLeftRadius: 6,
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
  },
  messageText: { 
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  userMessageText: { 
    color: "#1E3A8A" 
  },
  aiMessageText: { 
    color: "white" 
  },
  loadingContainer: { 
    alignItems: "center", 
    paddingVertical: 12 
  },
  loadingText: { 
    color: "rgba(255,255,255,0.8)", 
    fontSize: 14, 
    fontWeight: "500",
  },
  micButtonContainer: {
    position: 'absolute',
    left: width / 2 - 32,
    zIndex: 15,
    alignItems: 'center',
  },
  micButton: {
    width: 64,
    height: 64,
  },
  micButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  micButtonRecording: {
    // This style is handled by the gradient colors in the component
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
  },
  textInputGradient: {
    flexDirection: "row", 
    alignItems: "center", 
    borderRadius: 25, 
    paddingHorizontal: 20, 
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  textInput: { 
    flex: 1, 
    color: "white", 
    fontSize: 15, 
    paddingVertical: 12,
    fontWeight: "500",
  },
  sendButton: { 
    marginLeft: 8,
  },
  sendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  speakerButton: { 
    width: 48, 
    height: 48, 
  },
  speakerButtonGradient: {
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    alignItems: "center", 
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  bottomContainer: { 
    position: "absolute", 
    left: 0, 
    right: 0, 
    height: height * 0.55,
    backgroundColor: "rgba(255,255,255,0.15)", 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    paddingTop: 25,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  handleBar: { 
    width: 60, 
    height: 5, 
    backgroundColor: "rgba(255,255,255,0.5)", 
    borderRadius: 3, 
    alignSelf: "center", 
    marginBottom: 20,
    paddingVertical: 15, // Increase touch area
    marginTop: -10, // Adjust positioning
  },
  scrollableWrapper: {
    flex: 1,
  },
  scrollableContent: { 
    flex: 1,
  },
  scrollableContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  serviceCard: {
    width: (width - 60) / 3,
    marginBottom: 16,
  },
  serviceCardGradient: {
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  serviceTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  serviceSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  emergencyButton: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emergencyGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  emergencyContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emergencyText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  additionalServices: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  additionalGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  additionalService: {
    flex: 1,
    marginHorizontal: 4,
  },
  additionalServiceGradient: {
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  additionalServiceText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  bottomPadding: {
    height: 20,
  },
});