// // // Enhanced [id].tsx with appointment booking flow
// // import React, { JSX, useState, useRef, useEffect } from "react";
// // import { useLocalSearchParams, useRouter } from "expo-router";

// // import {
// //   Animated,
// //   Dimensions,
// //   PanResponder,
// //   ScrollView,
// //   StatusBar,
// //   StyleSheet,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   View,
// //   FlatList,
// //   Platform,
// //   KeyboardAvoidingView,
// //   Modal,
// // } from "react-native";
// // import { Ionicons } from "@expo/vector-icons";
// // import { LinearGradient } from "expo-linear-gradient";
// // import { Alert, ActivityIndicator } from "react-native";
// // import * as Speech from "expo-speech";
// // import { Audio } from "expo-av";
// // import { updatePatientLocation } from "../utils/patientHelper";
// // import axios from "axios";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // const router = useRouter();

// // const { width, height } = Dimensions.get("window");

// // interface Message {
// //   id: string;
// //   sender: "user" | "ai";
// //   text: string;
// //   showBookingPrompt?: boolean;
// // }

// // interface Doctor {
// //   _id: string;
// //   name: string;
// //   specialization?: string;
// //   available?: string;
// //   rating?: number;
// //   experience?: string;
// // }

// // interface BookingFormData {
// //   symptomDuration: string;
// //   symptomSeverity: "mild" | "moderate" | "severe";
// //   additionalNotes: string;
// // }

// // export default function PatientHome() {
// //   const { id } = useLocalSearchParams();
// //   const accountId: string = (id as string) || "";
// //   const [locationLoading, setLocationLoading] = useState(false);
// //   const [selectedFamily, setSelectedFamily] = useState<{ uid: string; name: string } | null>(null);
// //   const [familyProfiles, setFamilyProfiles] = useState<any[]>([]);
// //   const [showSwitcher, setShowSwitcher] = useState(false);
// //   const [textInput, setTextInput] = useState("");
// //   const [messages, setMessages] = useState<Message[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [recording, setRecording] = useState<Audio.Recording | null>(null);
// //   const [speakerEnabled, setSpeakerEnabled] = useState(true);

// //   // New states for appointment booking
// //   const [showBookingPrompt, setShowBookingPrompt] = useState(false);
// //   const [doctors, setDoctors] = useState<Doctor[]>([]);
// //   const [loadingDoctors, setLoadingDoctors] = useState(false);
// //   const [showDoctorsList, setShowDoctorsList] = useState(false);
// //   const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
// //   const [showBookingForm, setShowBookingForm] = useState(false);
// //   const [bookingData, setBookingData] = useState<BookingFormData>({
// //     symptomDuration: "",
// //     symptomSeverity: "mild",
// //     additionalNotes: "",
// //   });

// //   const recordingRef = useRef<Audio.Recording | null>(null);
// //   const flatListRef = useRef<FlatList>(null);

// //   const [sheetY] = useState(new Animated.Value(height * 0.55));
// //   const [currentY, setCurrentY] = useState(height * 0.55);
// //   const [patientId, setpatientId] = useState<string | null>(null);
// //   const [patientUid, setpatientUid] = useState<string | null>(null);

// //   useEffect(() => {
// //     const loadDoctor = async () => {
// //       const id = await AsyncStorage.getItem("patientId");
// //       const uid = await AsyncStorage.getItem("PatientUid");
// //       setpatientId(id);
// //       setpatientUid(uid);
// //     };
// //     loadDoctor();
// //   }, []);

// //   // Fetch doctors from backend
// //   const fetchDoctors = async () => {
// //     setLoadingDoctors(true);
// //     try {
// //       const response = await fetch("https://7300c4c894de.ngrok-free.app/api/doctors");
// //       const data = await response.json();
// //       setDoctors(data);
// //     } catch (error) {
// //       console.error("Error fetching doctors:", error);
// //       Alert.alert("Error", "Failed to load doctors. Please try again.");
// //     } finally {
// //       setLoadingDoctors(false);
// //     }
// //   };

// //   // Handle booking appointment
// //   const handleBookAppointment = async () => {
// //     if (!selectedDoctor || !patientId) {
// //       Alert.alert("Error", "Missing required information");
// //       return;
// //     }

// //     try {
// //       const appointmentData = {
// //         patientId: patientId,
// //         doctorId: selectedDoctor._id,
// //         symptomsDescription: bookingData.additionalNotes,
// //         symptomDuration: bookingData.symptomDuration,
// //         symptomSeverity: bookingData.symptomSeverity,
// //         status: "pending",
// //       };

// //       const response = await fetch("https://7300c4c894de.ngrok-free.app/api/appointments", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify(appointmentData),
// //       });

// //       if (response.ok) {
// //         const confirmationMessage: Message = {
// //           id: Date.now().toString() + "_confirmation",
// //           sender: "ai",
// //           text: "Appointment request sent successfully. For further details, please check the Appointments section.",
// //         };
        
// //         setMessages(prev => [...prev, confirmationMessage]);
        
// //         // Reset states
// //         setShowBookingForm(false);
// //         setShowDoctorsList(false);
// //         setSelectedDoctor(null);
// //         setBookingData({
// //           symptomDuration: "",
// //           symptomSeverity: "mild",
// //           additionalNotes: "",
// //         });
        
// //         setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
// //       } else {
// //         throw new Error("Failed to book appointment");
// //       }
// //     } catch (error) {
// //       console.error("Error booking appointment:", error);
// //       Alert.alert("Error", "Failed to book appointment. Please try again.");
// //     }
// //   };

// //   // Handle location
// //   const handleSaveLocation = async () => {
// //     setLocationLoading(true);
// //     console.log("Patient UID:", patientUid);
// //     if (patientUid === null) {
// //       setLocationLoading(false);
// //       Alert.alert("Error", "Patient UID is missing. Try logging in again.");
// //       return;
// //     }
// //     const result = await updatePatientLocation(
// //       patientUid,
// //       "https://7300c4c894de.ngrok-free.app/api"
// //     );
// //     setLocationLoading(false);

// //     if (result.success) {
// //       Alert.alert("Location Saved Successfully", result.message);
// //     } else {
// //       Alert.alert("Error", result.message);
// //     }
// //   };

// //   const switcherAnim = useRef(new Animated.Value(-width)).current;

// //   const toggleSwitcher = () => {
// //     if (showSwitcher) {
// //       Animated.timing(switcherAnim, { toValue: -width, duration: 300, useNativeDriver: false }).start(() =>
// //         setShowSwitcher(false)
// //       );
// //     } else {
// //       setShowSwitcher(true);
// //       Animated.timing(switcherAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
// //     }
// //   };

// //   const selectProfile = async (profile: any) => {
// //     setSelectedFamily(profile);
// //     await AsyncStorage.setItem(`family-${accountId}`, JSON.stringify(profile));
// //     toggleSwitcher();
// //   };

// //   useEffect(() => {
// //     async function loadFamily() {
// //       try {
// //         const storedFamily = await AsyncStorage.getItem(`family-${accountId}`);
// //         if (storedFamily) {
// //           setSelectedFamily(JSON.parse(storedFamily));
// //         }

// //         if (accountId) {
// //           const res = await fetch(`https://7300c4c894de.ngrok-free.app/api/patients/family/${accountId}`);
// //           const data = await res.json();
// //           setFamilyProfiles(data || []);
// //         }
// //       } catch (error) {
// //         console.error("Failed to load family data:", error);
// //       }
// //     }

// //     if (accountId) loadFamily();
// //   }, [accountId]);

// //   const panResponder = PanResponder.create({
// //     onStartShouldSetPanResponder: (evt, gestureState) => {
// //       const touchY = evt.nativeEvent.pageY;
// //       const handleBarY = currentY + 15;
// //       return Math.abs(touchY - handleBarY) < 30;
// //     },
// //     onMoveShouldSetPanResponder: (evt, gestureState) => {
// //       const touchY = evt.nativeEvent.pageY;
// //       const handleBarY = currentY + 15;
// //       return Math.abs(touchY - handleBarY) < 30 && Math.abs(gestureState.dy) > 8;
// //     },
// //     onPanResponderGrant: () => {
// //       sheetY.setOffset(currentY);
// //       sheetY.setValue(0);
// //     },
// //     onPanResponderMove: (_, gestureState) => {
// //       const minY = height * 0.55;
// //       const maxY = height * 0.88;
// //       const newY = Math.max(minY, Math.min(maxY, gestureState.dy + currentY));
// //       sheetY.setValue(newY - currentY);
// //     },
// //     onPanResponderRelease: (_, gestureState) => {
// //       sheetY.flattenOffset();
// //       let finalY = currentY + gestureState.dy;
// //       const velocity = gestureState.vy;
// //       let targetY;
      
// //       if (velocity > 0.8) targetY = height * 0.88;
// //       else if (velocity < -0.8) targetY = height * 0.55;
// //       else if (finalY < height * 0.715) targetY = height * 0.55;
// //       else targetY = height * 0.88;
      
// //       setCurrentY(targetY);
// //       Animated.spring(sheetY, { 
// //         toValue: targetY, 
// //         useNativeDriver: false, 
// //         tension: 80, 
// //         friction: 12 
// //       }).start();
// //     },
// //   });

// //   const routetoSearch = () => {
// //     router.push('/patient/screens/searchpharma')
// //   }

// //   const startRecording = async () => {
// //     try {
// //       await Audio.requestPermissionsAsync();
// //       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
// //       const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
// //       recordingRef.current = recording;
// //       setRecording(recording);
// //     } catch (err) { console.error(err); }
// //   };

// //   const stopRecording = async () => {
// //     try {
// //       if (!recordingRef.current) return;
// //       await recordingRef.current.stopAndUnloadAsync();
// //       const uri = recordingRef.current.getURI();
// //       setRecording(null);
// //       if (!uri) return;

// //       const response = await fetch(uri);
// //       const blob = await response.blob();
// //       const reader = new FileReader();
// //       reader.onloadend = async () => {
// //         const base64Audio = reader.result?.toString().split(",")[1];
// //         if (!base64Audio) return;
// //         try {
// //           setLoading(true);
// //           const res = await axios.post("https://7300c4c894de.ngrok-free.app/api/speech/transcribe", { audio: base64Audio });
// //           const transcription = res.data.transcription;
// //           if (transcription) handleSubmit(transcription);
// //         } catch (err) { console.error(err); }
// //         finally { setLoading(false); }
// //       };
// //       reader.readAsDataURL(blob);
// //     } catch (err) { console.error(err); setRecording(null); setLoading(false); }
// //   };

// //   const handleSubmit = async (text?: string) => {
// //     const finalInput = text || textInput;
// //     if (!finalInput.trim()) return;

// //     const userMessage: Message = { id: Date.now().toString(), sender: "user", text: finalInput };
// //     setMessages(prev => [...prev, userMessage]);
// //     setTextInput("");
// //     setLoading(true);

// //     setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

// //     try {
// //       const res = await fetch("https://7300c4c894de.ngrok-free.app/diagnose", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ symptoms: finalInput }),
// //       });
// //       const data = await res.json();
// //       const aiReply = data.answer || "Server error";
// //       const aiMessage: Message = { 
// //         id: Date.now().toString() + "_ai", 
// //         sender: "ai", 
// //         text: aiReply,
// //         showBookingPrompt: true // Add booking prompt after AI response
// //       };
// //       setMessages(prev => [...prev, aiMessage]);
// //       if (speakerEnabled) Speech.speak(aiReply);
// //       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
// //     } catch (err) { console.error(err); }
// //     finally { setLoading(false); }
// //   };

// //   const handleBookingResponse = (wantsToBook: boolean) => {
// //     if (wantsToBook) {
// //       fetchDoctors();
// //       setShowDoctorsList(true);
// //     }
    
// //     // Remove booking prompts from messages
// //     setMessages(prev => prev.map(msg => ({ ...msg, showBookingPrompt: false })));
// //   };

// //   const toggleSpeaker = () => {
// //     setSpeakerEnabled(!speakerEnabled);
// //     if (!speakerEnabled) Speech.stop();
// //   };

// //   const renderItem = ({ item }: { item: Message }) => (
// //     <View style={styles.messageContainer}>
// //       <View style={[
// //         styles.messageBubble,
// //         item.sender === "user" ? styles.userMessage : styles.aiMessage
// //       ]}>
// //         <Text style={[
// //           styles.messageText,
// //           item.sender === "user" ? styles.userMessageText : styles.aiMessageText
// //         ]}>
// //           {item.text}
// //         </Text>
// //       </View>
      
// //       {/* Booking Prompt */}
// //       {item.showBookingPrompt && (
// //         <View style={styles.bookingPromptContainer}>
// //           <Text style={styles.bookingPromptText}>Do you want to book an appointment with a doctor?</Text>
// //           <View style={styles.bookingButtonsContainer}>
// //             <TouchableOpacity 
// //               style={styles.bookingYesButton} 
// //               onPress={() => handleBookingResponse(true)}
// //             >
// //               <Text style={styles.bookingYesButtonText}>Yes</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity 
// //               style={styles.bookingNoButton} 
// //               onPress={() => handleBookingResponse(false)}
// //             >
// //               <Text style={styles.bookingNoButtonText}>No</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       )}
// //     </View>
// //   );

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
// //       {/* Background Gradient */}
// //       <LinearGradient 
// //         colors={["#1E3A8A", "#3B82F6", "#60A5FA"]} 
// //         style={StyleSheet.absoluteFillObject} 
// //       />
      
// //       {/* Header */}
// //       <View style={styles.header}>
// //         <View style={styles.headerLeft}>
// //           <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
// //             <LinearGradient
// //               colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //               style={styles.headerButtonGradient}
// //             >
// //               <Ionicons name="person" size={22} color="white" />
// //             </LinearGradient>
// //           </TouchableOpacity>
          
// //           <TouchableOpacity
// //             style={styles.headerButton}
// //             onPress={handleSaveLocation}
// //             disabled={locationLoading}
// //             activeOpacity={0.8}
// //           >
// //             <LinearGradient
// //               colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //               style={styles.headerButtonGradient}
// //             >
// //               {locationLoading ? (
// //                 <ActivityIndicator size="small" color="white" />
// //               ) : (
// //                 <Ionicons name="location" size={22} color="white" />
// //               )}
// //             </LinearGradient>
// //           </TouchableOpacity>
// //         </View>

// //         <View style={styles.headerCenter}>
// //           <Text style={styles.headerTitle}>MediConnect</Text>
// //           <Text style={styles.headerSubtitle}>Your Health Assistant</Text>
// //         </View>

// //         <View style={styles.headerRight}>
// //           <TouchableOpacity style={styles.languageButton} activeOpacity={0.8}>
// //             <LinearGradient
// //               colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //               style={styles.languageButtonGradient}
// //             >
// //               <Text style={styles.languageText}>EN</Text>
// //               <Ionicons name="language" size={14} color="white" />
// //             </LinearGradient>
// //           </TouchableOpacity>
          
// //           <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
// //             <LinearGradient
// //               colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //               style={styles.headerButtonGradient}
// //             >
// //               <Ionicons name="notifications" size={22} color="white" />
// //             </LinearGradient>
// //           </TouchableOpacity>
// //         </View>
// //       </View>

// //       {/* Chat Area */}
// //       <Animated.View style={[
// //         styles.chatContainer,
// //         {
// //           maxHeight: Animated.subtract(sheetY, new Animated.Value(180)).interpolate({
// //             inputRange: [height * 0.3, height * 0.88],
// //             outputRange: [height * 0.15, height * 0.4],
// //             extrapolate: 'clamp'
// //           })
// //         }
// //       ]}>
// //         <FlatList
// //           ref={flatListRef}
// //           data={messages}
// //           keyExtractor={item => item.id}
// //           renderItem={renderItem}
// //           contentContainerStyle={styles.chatContent}
// //           showsVerticalScrollIndicator={false}
// //           keyboardShouldPersistTaps="handled"
// //           style={styles.chatList}
// //           removeClippedSubviews={true}
// //           maxToRenderPerBatch={10}
// //           windowSize={10}
// //         />
// //         {loading && (
// //           <View style={styles.loadingContainer}>
// //             <Text style={styles.loadingText}>AI is analyzing...</Text>
// //           </View>
// //         )}
// //       </Animated.View>

// //       {/* Mic Button */}
// //       <Animated.View style={[
// //         styles.micButtonContainer,
// //         { 
// //           top: Animated.subtract(sheetY, new Animated.Value(110))
// //         }
// //       ]}>
// //         <TouchableOpacity
// //           style={[
// //             styles.micButton,
// //             recording && styles.micButtonRecording
// //           ]}
// //           onPress={recording ? stopRecording : startRecording}
// //           disabled={loading}
// //           activeOpacity={0.8}
// //         >
// //           <LinearGradient
// //             colors={recording 
// //               ? ['rgba(220, 38, 38, 0.9)', 'rgba(239, 68, 68, 0.8)'] 
// //               : ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']
// //             }
// //             style={styles.micButtonGradient}
// //           >
// //             <Ionicons 
// //               name={recording ? "stop" : "mic"} 
// //               size={28} 
// //               color="white" 
// //             />
// //           </LinearGradient>
// //         </TouchableOpacity>
// //       </Animated.View>

// //       {/* Text Input */}
// //       <Animated.View style={[
// //         styles.inputWrapper, 
// //         { 
// //           top: Animated.subtract(sheetY, new Animated.Value(50))
// //         }
// //       ]}>
// //         <View style={styles.textInputContainer}>
// //           <LinearGradient
// //             colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //             style={styles.textInputGradient}
// //           >
// //             <TextInput
// //               style={styles.textInput}
// //               placeholder="Describe your symptoms..."
// //               placeholderTextColor="rgba(255,255,255,0.6)"
// //               value={textInput}
// //               onChangeText={setTextInput}
// //               editable={!loading}
// //               multiline={false}
// //               onSubmitEditing={() => handleSubmit()}
// //             />
// //             <TouchableOpacity
// //               style={styles.sendButton}
// //               onPress={() => handleSubmit()}
// //               disabled={!textInput.trim() || loading}
// //             >
// //               <LinearGradient
// //                 colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']}
// //                 style={styles.sendButtonGradient}
// //               >
// //                 <Ionicons name="arrow-forward" size={18} color="white" />
// //               </LinearGradient>
// //             </TouchableOpacity>
// //           </LinearGradient>
// //         </View>

// //         <TouchableOpacity 
// //           style={styles.speakerButton} 
// //           onPress={toggleSpeaker}
// //           activeOpacity={0.8}
// //         >
// //           <LinearGradient
// //             colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //             style={styles.speakerButtonGradient}
// //           >
// //             <Ionicons name={speakerEnabled ? "volume-high" : "volume-mute"} size={20} color="white" />
// //           </LinearGradient>
// //         </TouchableOpacity>
// //       </Animated.View>

// //       {/* Doctors List Modal */}
// //       <Modal
// //         visible={showDoctorsList}
// //         transparent={true}
// //         animationType="slide"
// //         onRequestClose={() => setShowDoctorsList(false)}
// //       >
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.modalContent}>
// //             <View style={styles.modalHeader}>
// //               <Text style={styles.modalTitle}>Available Doctors</Text>
// //               <TouchableOpacity onPress={() => setShowDoctorsList(false)}>
// //                 <Ionicons name="close" size={24} color="white" />
// //               </TouchableOpacity>
// //             </View>
            
// //             {loadingDoctors ? (
// //               <View style={styles.loadingDoctors}>
// //                 <ActivityIndicator size="large" color="#1E3A8A" />
// //                 <Text>Loading doctors...</Text>
// //               </View>
// //             ) : (
// //               <ScrollView style={styles.doctorsContainer}>
// //                 {doctors.map((doctor) => (
// //                   <View key={doctor._id} style={styles.doctorCard}>
// //                     <View style={styles.doctorInfo}>
// //                       <View style={styles.doctorAvatar}>
// //                         <Ionicons name="person" size={24} color="white" />
// //                       </View>
// //                       <View style={styles.doctorDetails}>
// //                         <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
// //                         <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
// //                         {doctor.experience && (
// //                           <Text style={styles.doctorExperience}>{doctor.experience} years experience</Text>
// //                         )}
// //                         {doctor.rating && (
// //                           <View style={styles.ratingContainer}>
// //                             <Ionicons name="star" size={16} color="#FCD34D" />
// //                             <Text style={styles.rating}>{doctor.rating}</Text>
// //                           </View>
// //                         )}
// //                       </View>
// //                     </View>
// //                     <TouchableOpacity
// //                       style={styles.bookNowButton}
// //                       onPress={() => {
// //                         setSelectedDoctor(doctor);
// //                         setShowDoctorsList(false);
// //                         setShowBookingForm(true);
// //                       }}
// //                     >
// //                       <Text style={styles.bookNowButtonText}>Book Now</Text>
// //                     </TouchableOpacity>
// //                   </View>
// //                 ))}
// //               </ScrollView>
// //             )}
// //           </View>
// //         </View>
// //       </Modal>

// //       {/* Booking Form Modal */}
// //       <Modal
// //         visible={showBookingForm}
// //         transparent={true}
// //         animationType="slide"
// //         onRequestClose={() => setShowBookingForm(false)}
// //       >
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.modalContent}>
// //             <View style={styles.modalHeader}>
// //               <Text style={styles.modalTitle}>Book Appointment</Text>
// //               <TouchableOpacity onPress={() => setShowBookingForm(false)}>
// //                 <Ionicons name="close" size={24} color="white" />
// //               </TouchableOpacity>
// //             </View>
            
// //             <ScrollView style={styles.bookingFormContainer}>
// //               {selectedDoctor && (
// //                 <View style={styles.selectedDoctorInfo}>
// //                   <Text style={styles.selectedDoctorTitle}>Dr. {selectedDoctor.name}</Text>
// //                   <Text style={styles.selectedDoctorSpec}>{selectedDoctor.specialization}</Text>
// //                 </View>
// //               )}
              
// //               <View style={styles.formGroup}>
// //                 <Text style={styles.formLabel}>Duration of symptoms</Text>
// //                 <TextInput
// //                   style={styles.formInput}
// //                   placeholder="e.g., 3 days, 1 week"
// //                   value={bookingData.symptomDuration}
// //                   onChangeText={(text) => setBookingData(prev => ({ ...prev, symptomDuration: text }))}
// //                 />
// //               </View>
              
// //               <View style={styles.formGroup}>
// //                 <Text style={styles.formLabel}>Symptom severity</Text>
// //                 <View style={styles.severityButtonsContainer}>
// //                   {['mild', 'moderate', 'severe'].map((severity) => (
// //                     <TouchableOpacity
// //                       key={severity}
// //                       style={[
// //                         styles.severityButton,
// //                         bookingData.symptomSeverity === severity && styles.severityButtonActive
// //                       ]}
// //                       onPress={() => setBookingData(prev => ({ 
// //                         ...prev, 
// //                         symptomSeverity: severity as "mild" | "moderate" | "severe" 
// //                       }))}
// //                     >
// //                       <Text style={[
// //                         styles.severityButtonText,
// //                         bookingData.symptomSeverity === severity && styles.severityButtonTextActive
// //                       ]}>
// //                         {severity.charAt(0).toUpperCase() + severity.slice(1)}
// //                       </Text>
// //                     </TouchableOpacity>
// //                   ))}
// //                 </View>
// //               </View>
              
// //               <View style={styles.formGroup}>
// //                 <Text style={styles.formLabel}>Additional notes</Text>
// //                 <TextInput
// //                   style={[styles.formInput, styles.textArea]}
// //                   placeholder="Any additional information about your symptoms..."
// //                   value={bookingData.additionalNotes}
// //                   onChangeText={(text) => setBookingData(prev => ({ ...prev, additionalNotes: text }))}
// //                   multiline
// //                   numberOfLines={4}
// //                 />
// //               </View>
              
// //               <TouchableOpacity style={styles.submitButton} onPress={handleBookAppointment}>
// //                 <Text style={styles.submitButtonText}>Submit Booking Request</Text>
// //               </TouchableOpacity>
// //             </ScrollView>
// //           </View>
// //         </View>
// //       </Modal>

// //       {/* Bottom Sheet - keeping your existing content */}
// //       <Animated.View style={[styles.bottomContainer, { top: sheetY }]}>
// //         <View style={styles.handleBar} {...panResponder.panHandlers} />

// //         <View style={styles.scrollableWrapper}>
// //           <ScrollView 
// //             style={styles.scrollableContent} 
// //             contentContainerStyle={styles.scrollableContentContainer}
// //             showsVerticalScrollIndicator={false} 
// //             bounces={true}
// //             nestedScrollEnabled={true}
// //             scrollEventThrottle={16}
// //           >
// //             {/* Your existing service grid and content... */}
// //             <View style={styles.servicesGrid}>
// //               <TouchableOpacity 
// //                 style={styles.serviceCard} 
// //                 onPress={() => router.push('/patient/screens/AppointementsScreen')}
// //                 activeOpacity={0.8}
// //               >
// //                 <LinearGradient
// //                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //                   style={styles.serviceCardGradient}
// //                 >
// //                   <View style={styles.serviceIconContainer}>
// //                     <Ionicons name="calendar-outline" size={28} color="white" />
// //                   </View>
// //                   <Text style={styles.serviceTitle}>Appointments</Text>
// //                   <Text style={styles.serviceSubtitle}>Book & manage</Text>
// //                 </LinearGradient>
// //               </TouchableOpacity>

// //               <TouchableOpacity 
// //                 style={styles.serviceCard}
// //                 onPress={() =>
// //                   router.push({
// //                     pathname: "/patient/screens/PrescriptionScreen",
// //                     params: { patientUid: patientId },
// //                   })
// //                 }
// //                 activeOpacity={0.8}
// //               >
// //                 <LinearGradient
// //                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //                   style={styles.serviceCardGradient}
// //                 >
// //                   <View style={styles.serviceIconContainer}>
// //                     <Ionicons name="document-text-outline" size={28} color="white" />
// //                   </View>
// //                   <Text style={styles.serviceTitle}>Prescriptions</Text>
// //                   <Text style={styles.serviceSubtitle}>View & download</Text>
// //                 </LinearGradient>
// //               </TouchableOpacity>

// //               <TouchableOpacity 
// //                 style={styles.serviceCard} 
// //                 onPress={() => router.push('/patient/screens/history')}
// //                 activeOpacity={0.8}
// //               >
// //                 <LinearGradient
// //                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //                   style={styles.serviceCardGradient}
// //                 >
// //                   <View style={styles.serviceIconContainer}>
// //                     <Ionicons name="time-outline" size={28} color="white" />
// //                   </View>
// //                   <Text style={styles.serviceTitle}>History</Text>
// //                   <Text style={styles.serviceSubtitle}>Medical records</Text>
// //                 </LinearGradient>
// //               </TouchableOpacity>

// //               {/* Row 2 */}
// //               <TouchableOpacity 
// //                 style={styles.serviceCard} 
// //                 onPress={routetoSearch}
// //                 activeOpacity={0.8}
// //               >
// //                 <LinearGradient
// //                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //                   style={styles.serviceCardGradient}
// //                 >
// //                   <View style={styles.serviceIconContainer}>
// //                     <Ionicons name="medical-outline" size={28} color="white" />
// //                   </View>
// //                   <Text style={styles.serviceTitle}>Pharmacy</Text>
// //                   <Text style={styles.serviceSubtitle}>Find medicines</Text>
// //                 </LinearGradient>
// //               </TouchableOpacity>

// //               <TouchableOpacity
// //                 style={styles.serviceCard}
// //                 onPress={() => router.push(`/patient/screens/Family?id=${accountId}`)}
// //                 activeOpacity={0.8}
// //               >
// //                 <LinearGradient
// //                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //                   style={styles.serviceCardGradient}
// //                 >
// //                   <View style={styles.serviceIconContainer}>
// //                     <Ionicons name="people-outline" size={28} color="white" />
// //                   </View>
// //                   <Text style={styles.serviceTitle}>Family</Text>
// //                   <Text style={styles.serviceSubtitle}>Manage profiles</Text>
// //                 </LinearGradient>
// //               </TouchableOpacity>

// //               <TouchableOpacity style={styles.serviceCard} activeOpacity={0.8}>
// //                 <LinearGradient
// //                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //                   style={styles.serviceCardGradient}
// //                 >
// //                   <View style={styles.serviceIconContainer}>
// //                     <Ionicons name="fitness-outline" size={28} color="white" />
// //                   </View>
// //                   <Text style={styles.serviceTitle}>Health Tips</Text>
// //                   <Text style={styles.serviceSubtitle}>Stay healthy</Text>
// //                 </LinearGradient>
// //               </TouchableOpacity>
// //             </View>

// //             {/* Emergency SOS Button */}
// //             <TouchableOpacity style={styles.emergencyButton} activeOpacity={0.8}>
// //               <LinearGradient 
// //                 colors={["#DC2626", "#EF4444"]} 
// //                 style={styles.emergencyGradient}
// //               >
// //                 <View style={styles.emergencyContent}>
// //                   <Ionicons name="medical" size={24} color="white" />
// //                   <Text style={styles.emergencyText}>Emergency SOS</Text>
// //                 </View>
// //               </LinearGradient>
// //             </TouchableOpacity>

// //             {/* Additional Services */}
// //             <View style={styles.additionalServices}>
// //               <Text style={styles.sectionTitle}>More Services</Text>
// //               <View style={styles.additionalGrid}>
// //                 <TouchableOpacity style={styles.additionalService} activeOpacity={0.8}>
// //                   <LinearGradient
// //                     colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
// //                     style={styles.additionalServiceGradient}
// //                   >
// //                     <Ionicons name="heart-outline" size={20} color="white" />
// //                     <Text style={styles.additionalServiceText}>Health Monitoring</Text>
// //                   </LinearGradient>
// //                 </TouchableOpacity>

// //                 <TouchableOpacity style={styles.additionalService} activeOpacity={0.8}>
// //                   <LinearGradient
// //                     colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
// //                     style={styles.additionalServiceGradient}
// //                   >
// //                     <Ionicons name="chatbubble-outline" size={20} color="white" />
// //                     <Text style={styles.additionalServiceText}>Telemedicine</Text>
// //                   </LinearGradient>
// //                 </TouchableOpacity>

// //                 <TouchableOpacity style={styles.additionalService} activeOpacity={0.8}>
// //                   <LinearGradient
// //                     colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
// //                     style={styles.additionalServiceGradient}
// //                   >
// //                     <Ionicons name="settings-outline" size={20} color="white" />
// //                     <Text style={styles.additionalServiceText}>Settings</Text>
// //                   </LinearGradient>
// //                 </TouchableOpacity>
// //               </View>
// //             </View>

// //             <View style={styles.bottomPadding} />
// //           </ScrollView>
// //         </View>
// //       </Animated.View>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { 
// //     flex: 1, 
// //   },
// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     paddingHorizontal: 20,
// //     paddingTop: 50,
// //     paddingBottom: 20,
// //   },
// //   headerLeft: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: 12,
// //   },
// //   headerCenter: {
// //     alignItems: "center",
// //     flex: 1,
// //   },
// //   headerRight: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: 12,
// //   },
// //   headerButton: {
// //     width: 40,
// //     height: 40,
// //   },
// //   headerButtonGradient: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     borderWidth: 1,
// //     borderColor: 'rgba(255, 255, 255, 0.2)',
// //   },
// //   headerTitle: {
// //     fontSize: 20,
// //     fontWeight: "700",
// //     color: "white",
// //     letterSpacing: 0.5,
// //   },
// //   headerSubtitle: {
// //     fontSize: 12,
// //     color: "rgba(255, 255, 255, 0.8)",
// //     fontWeight: "500",
// //     marginTop: 2,
// //   },
// //   languageButton: {
// //     height: 40,
// //   },
// //   languageButtonGradient: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: 12,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //     gap: 6,
// //     borderWidth: 1,
// //     borderColor: 'rgba(255, 255, 255, 0.2)',
// //   },
// //   languageText: {
// //     color: "white",
// //     fontSize: 12,
// //     fontWeight: "600",
// //   },
// //   chatContainer: { 
// //     position: 'absolute',
// //     left: 20,
// //     right: 20,
// //     top: 130,
// //     zIndex: 5,
// //   },
// //   chatList: {
// //     flex: 1,
// //   },
// //   chatContent: { 
// //     paddingVertical: 10,
// //     flexGrow: 1,
// //     justifyContent: 'flex-end'
// //   },
// //   messageContainer: { 
// //     marginVertical: 4 
// //   },
// //   messageBubble: { 
// //     padding: 16, 
// //     borderRadius: 20, 
// //     maxWidth: "85%",
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.15,
// //     shadowRadius: 8,
// //     elevation: 8,
// //   },
// //   userMessage: { 
// //     backgroundColor: "rgba(255,255,255,0.95)", 
// //     alignSelf: "flex-end", 
// //     borderBottomRightRadius: 6,
// //     borderWidth: 1,
// //     borderColor: 'rgba(255, 255, 255, 0.3)',
// //   },
// //   aiMessage: { 
// //     backgroundColor: "rgba(30, 58, 138, 0.9)", 
// //     alignSelf: "flex-start", 
// //     borderBottomLeftRadius: 6,
// //     borderColor: "rgba(255,255,255,0.2)",
// //     borderWidth: 1,
// //   },
// //   messageText: { 
// //     fontSize: 15,
// //     lineHeight: 22,
// //     fontWeight: "500",
// //   },
// //   userMessageText: { 
// //     color: "#1E3A8A" 
// //   },
// //   aiMessageText: { 
// //     color: "white" 
// //   },
  
// //   // New booking prompt styles
// //   bookingPromptContainer: {
// //     backgroundColor: "rgba(255,255,255,0.95)",
// //     borderRadius: 16,
// //     padding: 16,
// //     marginTop: 8,
// //     alignSelf: "flex-start",
// //     maxWidth: "85%",
// //     borderWidth: 1,
// //     borderColor: 'rgba(255, 255, 255, 0.3)',
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 4,
// //   },
// //   bookingPromptText: {
// //     fontSize: 14,
// //     color: "#1E3A8A",
// //     fontWeight: "600",
// //     marginBottom: 12,
// //     textAlign: "center",
// //   },
// //   bookingButtonsContainer: {
// //     flexDirection: "row",
// //     gap: 12,
// //     justifyContent: "center",
// //   },
// //   bookingYesButton: {
// //     backgroundColor: "#1E3A8A",
// //     paddingHorizontal: 24,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //     flex: 1,
// //     alignItems: "center",
// //   },
// //   bookingYesButtonText: {
// //     color: "white",
// //     fontWeight: "600",
// //     fontSize: 14,
// //   },
// //   bookingNoButton: {
// //     backgroundColor: "transparent",
// //     borderWidth: 1,
// //     borderColor: "#1E3A8A",
// //     paddingHorizontal: 24,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //     flex: 1,
// //     alignItems: "center",
// //   },
// //   bookingNoButtonText: {
// //     color: "#1E3A8A",
// //     fontWeight: "600",
// //     fontSize: 14,
// //   },

// //   // Modal styles
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: "rgba(0,0,0,0.5)",
// //     justifyContent: "flex-end",
// //   },
// //   modalContent: {
// //     backgroundColor: "white",
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     maxHeight: "80%",
// //     minHeight: "60%",
// //   },
// //   modalHeader: {
// //     backgroundColor: "#1E3A8A",
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     paddingHorizontal: 20,
// //     paddingVertical: 16,
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //   },
// //   modalTitle: {
// //     fontSize: 18,
// //     fontWeight: "700",
// //     color: "white",
// //   },

// //   // Doctors list styles
// //   loadingDoctors: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     paddingVertical: 40,
// //   },
// //   doctorsContainer: {
// //     flex: 1,
// //     padding: 20,
// //   },
// //   doctorCard: {
// //     backgroundColor: "#F8FAFC",
// //     borderRadius: 12,
// //     padding: 16,
// //     marginBottom: 12,
// //     borderWidth: 1,
// //     borderColor: "#E2E8F0",
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //   },
// //   doctorInfo: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     flex: 1,
// //   },
// //   doctorAvatar: {
// //     width: 50,
// //     height: 50,
// //     borderRadius: 25,
// //     backgroundColor: "#1E3A8A",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },
// //   doctorDetails: {
// //     marginLeft: 12,
// //     flex: 1,
// //   },
// //   doctorName: {
// //     fontSize: 16,
// //     fontWeight: "600",
// //     color: "#1E293B",
// //     marginBottom: 4,
// //   },
// //   doctorSpecialization: {
// //     fontSize: 14,
// //     color: "#64748B",
// //     marginBottom: 2,
// //   },
// //   doctorExperience: {
// //     fontSize: 12,
// //     color: "#94A3B8",
// //     marginBottom: 4,
// //   },
// //   ratingContainer: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },
// //   rating: {
// //     fontSize: 12,
// //     color: "#64748B",
// //     marginLeft: 4,
// //   },
// //   bookNowButton: {
// //     backgroundColor: "#1E3A8A",
// //     paddingHorizontal: 16,
// //     paddingVertical: 8,
// //     borderRadius: 6,
// //   },
// //   bookNowButtonText: {
// //     color: "white",
// //     fontWeight: "600",
// //     fontSize: 14,
// //   },

// //   // Booking form styles
// //   bookingFormContainer: {
// //     flex: 1,
// //     padding: 20,
// //   },
// //   selectedDoctorInfo: {
// //     backgroundColor: "#F0F4FF",
// //     padding: 16,
// //     borderRadius: 12,
// //     marginBottom: 20,
// //     alignItems: "center",
// //   },
// //   selectedDoctorTitle: {
// //     fontSize: 16,
// //     fontWeight: "600",
// //     color: "#1E3A8A",
// //     marginBottom: 4,
// //   },
// //   selectedDoctorSpec: {
// //     fontSize: 14,
// //     color: "#64748B",
// //   },
// //   formGroup: {
// //     marginBottom: 20,
// //   },
// //   formLabel: {
// //     fontSize: 14,
// //     fontWeight: "600",
// //     color: "#1E293B",
// //     marginBottom: 8,
// //   },
// //   formInput: {
// //     borderWidth: 1,
// //     borderColor: "#D1D5DB",
// //     borderRadius: 8,
// //     padding: 12,
// //     fontSize: 14,
// //     backgroundColor: "white",
// //     color: "#1E293B",
// //   },
// //   textArea: {
// //     height: 80,
// //     textAlignVertical: "top",
// //   },
// //   severityButtonsContainer: {
// //     flexDirection: "row",
// //     gap: 8,
// //   },
// //   severityButton: {
// //     flex: 1,
// //     paddingVertical: 12,
// //     paddingHorizontal: 16,
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: "#D1D5DB",
// //     backgroundColor: "white",
// //     alignItems: "center",
// //   },
// //   severityButtonActive: {
// //     backgroundColor: "#1E3A8A",
// //     borderColor: "#1E3A8A",
// //   },
// //   severityButtonText: {
// //     fontSize: 14,
// //     fontWeight: "600",
// //     color: "#64748B",
// //   },
// //   severityButtonTextActive: {
// //     color: "white",
// //   },
// //   submitButton: {
// //     backgroundColor: "#1E3A8A",
// //     paddingVertical: 14,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginTop: 20,
// //   },
// //   submitButtonText: {
// //     color: "white",
// //     fontSize: 16,
// //     fontWeight: "600",
// //   },
  
// //   loadingContainer: { 
// //     alignItems: "center", 
// //     paddingVertical: 12 
// //   },
// //   loadingText: { 
// //     color: "rgba(255,255,255,0.8)", 
// //     fontSize: 14, 
// //     fontWeight: "500",
// //   },
// //   micButtonContainer: {
// //     position: 'absolute',
// //     left: width / 2 - 32,
// //     zIndex: 15,
// //     alignItems: 'center',
// //   },
// //   micButton: {
// //     width: 64,
// //     height: 64,
// //   },
// //   micButtonGradient: {
// //     width: 64,
// //     height: 64,
// //     borderRadius: 32,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 8 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 12,
// //     elevation: 12,
// //     borderWidth: 2,
// //     borderColor: "rgba(255,255,255,0.3)",
// //   },
// //   micButtonRecording: {
// //     // This style is handled by the gradient colors in the component
// //   },
// //   inputWrapper: { 
// //     position: "absolute", 
// //     left: 20, 
// //     right: 20, 
// //     flexDirection: "row", 
// //     alignItems: "center", 
// //     gap: 12, 
// //     zIndex: 10 
// //   },
// //   textInputContainer: { 
// //     flex: 1, 
// //   },
// //   textInputGradient: {
// //     flexDirection: "row", 
// //     alignItems: "center", 
// //     borderRadius: 25, 
// //     paddingHorizontal: 20, 
// //     paddingVertical: 4,
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.2)",
// //   },
// //   textInput: { 
// //     flex: 1, 
// //     color: "white", 
// //     fontSize: 15, 
// //     paddingVertical: 12,
// //     fontWeight: "500",
// //   },
// //   sendButton: { 
// //     marginLeft: 8,
// //   },
// //   sendButtonGradient: {
// //     width: 36,
// //     height: 36,
// //     borderRadius: 18,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.2)",
// //   },
// //   speakerButton: { 
// //     width: 48, 
// //     height: 48, 
// //   },
// //   speakerButtonGradient: {
// //     width: 48, 
// //     height: 48, 
// //     borderRadius: 24, 
// //     alignItems: "center", 
// //     justifyContent: "center",
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.2)",
// //   },
// //   bottomContainer: { 
// //     position: "absolute", 
// //     left: 0, 
// //     right: 0, 
// //     height: height * 0.55,
// //     backgroundColor: "rgba(255,255,255,0.15)", 
// //     borderTopLeftRadius: 25, 
// //     borderTopRightRadius: 25, 
// //     paddingTop: 25,
// //     borderTopWidth: 1,
// //     borderTopColor: "rgba(255,255,255,0.2)",
// //   },
// //   handleBar: { 
// //     width: 60, 
// //     height: 5, 
// //     backgroundColor: "rgba(255,255,255,0.5)", 
// //     borderRadius: 3, 
// //     alignSelf: "center", 
// //     marginBottom: 20,
// //     paddingVertical: 15,
// //     marginTop: -10,
// //   },
// //   scrollableWrapper: {
// //     flex: 1,
// //   },
// //   scrollableContent: { 
// //     flex: 1,
// //   },
// //   scrollableContentContainer: {
// //     paddingHorizontal: 20,
// //     paddingBottom: 20,
// //   },
// //   servicesGrid: {
// //     flexDirection: "row",
// //     flexWrap: "wrap",
// //     justifyContent: "space-between",
// //     marginBottom: 24,
// //   },
// //   serviceCard: {
// //     width: (width - 60) / 3,
// //     marginBottom: 16,
// //   },
// //   serviceCardGradient: {
// //     borderRadius: 20,
// //     padding: 16,
// //     alignItems: "center",
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.2)",
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 5,
// //   },
// //   serviceIconContainer: {
// //     width: 48,
// //     height: 48,
// //     borderRadius: 24,
// //     backgroundColor: "rgba(255,255,255,0.2)",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     marginBottom: 12,
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.1)",
// //   },
// //   serviceTitle: {
// //     color: "white",
// //     fontSize: 14,
// //     fontWeight: "700",
// //     textAlign: "center",
// //     marginBottom: 4,
// //   },
// //   serviceSubtitle: {
// //     color: "rgba(255,255,255,0.8)",
// //     fontSize: 11,
// //     fontWeight: "500",
// //     textAlign: "center",
// //   },
// //   emergencyButton: {
// //     marginBottom: 24,
// //     borderRadius: 20,
// //     overflow: "hidden",
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 6 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 12,
// //     elevation: 8,
// //   },
// //   emergencyGradient: {
// //     paddingVertical: 16,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.2)",
// //   },
// //   emergencyContent: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: 12,
// //   },
// //   emergencyText: {
// //     color: "white",
// //     fontSize: 18,
// //     fontWeight: "700",
// //     letterSpacing: 0.5,
// //   },
// //   additionalServices: {
// //     marginBottom: 16,
// //   },
// //   sectionTitle: {
// //     color: "white",
// //     fontSize: 16,
// //     fontWeight: "700",
// //     marginBottom: 16,
// //     letterSpacing: 0.5,
// //   },
// //   additionalGrid: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //   },
// //   additionalService: {
// //     flex: 1,
// //     marginHorizontal: 4,
// //   },
// //   additionalServiceGradient: {
// //     borderRadius: 16,
// //     padding: 12,
// //     alignItems: "center",
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.1)",
// //   },
// //   additionalServiceText: {
// //     color: "white",
// //     fontSize: 12,
// //     fontWeight: "600",
// //     textAlign: "center",
// //     marginTop: 8,
// //   },
// //   bottomPadding: {
// //     height: 20,
// //   },
// // });

// // Enhanced [id].tsx with appointment booking flow
// // Enhanced [id].tsx with appointment booking flow - FIXED TypeScript errors
// // import React, { JSX, useState, useRef, useEffect } from "react";
// // import { useLocalSearchParams, useRouter } from "expo-router";

// // import {
// //   Animated,
// //   Dimensions,
// //   PanResponder,
// //   ScrollView,
// //   StatusBar,
// //   StyleSheet,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   View,
// //   FlatList,
// //   Platform,
// //   KeyboardAvoidingView,
// //   Modal,
// // } from "react-native";
// // import { Ionicons } from "@expo/vector-icons";
// // import { LinearGradient } from "expo-linear-gradient";
// // import { Alert, ActivityIndicator } from "react-native";
// // import * as Speech from "expo-speech";
// // import { Audio } from "expo-av";
// // import { updatePatientLocation } from "../utils/patientHelper";
// // import axios from "axios";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // const router = useRouter();

// // const { width, height } = Dimensions.get("window");

// // // Fixed interface with explicit boolean values
// // interface Message {
// //   id: string;
// //   sender: "user" | "ai";
// //   text: string;
// //   showBookingPrompt: boolean;
// //   showSeverityPrompt: boolean;
// //   showDurationPrompt: boolean;
// // }

// // interface Doctor {
// //   _id: string;
// //   name: string;
// //   specialization?: string;
// //   available?: string;
// //   rating?: number;
// //   experience?: string;
// // }

// // interface BookingFormData {
// //   symptomDuration: string;
// //   symptomSeverity: "mild" | "moderate" | "severe";
// //   additionalNotes: string;
// // }

// // interface CollectedSymptomData {
// //   symptoms: string;
// //   severity: "mild" | "moderate" | "severe" | null;
// //   duration: string;
// // }

// // // Helper functions to create messages with all properties explicitly set
// // const createUserMessage = (text: string): Message => ({
// //   id: Date.now().toString(),
// //   sender: "user",
// //   text,
// //   showBookingPrompt: false,
// //   showSeverityPrompt: false,
// //   showDurationPrompt: false,
// // });

// // const createAIMessage = (text: string): Message => ({
// //   id: Date.now().toString() + "_ai",
// //   sender: "ai",
// //   text,
// //   showBookingPrompt: false,
// //   showSeverityPrompt: false,
// //   showDurationPrompt: false,
// // });

// // const createBookingPromptMessage = (): Message => ({
// //   id: Date.now().toString() + "_booking_prompt",
// //   sender: "ai",
// //   text: "",
// //   showBookingPrompt: true,
// //   showSeverityPrompt: false,
// //   showDurationPrompt: false,
// // });

// // const createSeverityPromptMessage = (): Message => ({
// //   id: Date.now().toString() + "_severity_prompt",
// //   sender: "ai",
// //   text: "Please select the severity of your symptoms:",
// //   showBookingPrompt: false,
// //   showSeverityPrompt: true,
// //   showDurationPrompt: false,
// // });

// // const createDurationPromptMessage = (): Message => ({
// //   id: Date.now().toString() + "_duration_prompt",
// //   sender: "ai",
// //   text: "How long have you been experiencing these symptoms?",
// //   showBookingPrompt: false,
// //   showSeverityPrompt: false,
// //   showDurationPrompt: true,
// // });

// // const createConfirmationMessage = (text: string): Message => ({
// //   id: Date.now().toString() + "_confirmation",
// //   sender: "ai",
// //   text,
// //   showBookingPrompt: false,
// //   showSeverityPrompt: false,
// //   showDurationPrompt: false,
// // });

// // export default function PatientHome() {
// //   const { id } = useLocalSearchParams();
// //   const accountId: string = (id as string) || "";
// //   const [locationLoading, setLocationLoading] = useState(false);
// //   const [selectedFamily, setSelectedFamily] = useState<{ uid: string; name: string } | null>(null);
// //   const [familyProfiles, setFamilyProfiles] = useState<any[]>([]);
// //   const [showSwitcher, setShowSwitcher] = useState(false);
// //   const [textInput, setTextInput] = useState("");
// //   const [messages, setMessages] = useState<Message[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [recording, setRecording] = useState<Audio.Recording | null>(null);
// //   const [speakerEnabled, setSpeakerEnabled] = useState(true);

// //   // New states for enhanced appointment booking flow
// //   const [showBookingPrompt, setShowBookingPrompt] = useState(false);
// //   const [doctors, setDoctors] = useState<Doctor[]>([]);
// //   const [loadingDoctors, setLoadingDoctors] = useState(false);
// //   const [showDoctorsList, setShowDoctorsList] = useState(false);
// //   const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
// //   const [showBookingForm, setShowBookingForm] = useState(false);
// //   const [bookingData, setBookingData] = useState<BookingFormData>({
// //     symptomDuration: "",
// //     symptomSeverity: "mild",
// //     additionalNotes: "",
// //   });
  
// //   // New states for enhanced symptom collection
// //   const [collectedSymptomData, setCollectedSymptomData] = useState<CollectedSymptomData>({
// //     symptoms: "",
// //     severity: null,
// //     duration: "",
// //   });
// //   const [bookingStep, setBookingStep] = useState<"initial" | "severity" | "duration" | "doctors">("initial");

// //   const recordingRef = useRef<Audio.Recording | null>(null);
// //   const flatListRef = useRef<FlatList>(null);

// //   const [sheetY] = useState(new Animated.Value(height * 0.55));
// //   const [currentY, setCurrentY] = useState(height * 0.55);
// //   const [patientId, setpatientId] = useState<string | null>(null);
// //   const [patientUid, setpatientUid] = useState<string | null>(null);

// //   useEffect(() => {
// //     const loadDoctor = async () => {
// //       const id = await AsyncStorage.getItem("patientId");
// //       const uid = await AsyncStorage.getItem("PatientUid");
// //       setpatientId(id);
// //       setpatientUid(uid);
// //     };
// //     loadDoctor();
// //   }, []);

// //   // Fetch doctors from backend
// //   const fetchDoctors = async () => {
// //     setLoadingDoctors(true);
// //     try {
// //       console.log("Fetching doctors from API...");
// //       const response = await fetch("https://7300c4c894de.ngrok-free.app/api/doctors");
// //       console.log("Doctors API response status:", response.status);
      
// //       if (!response.ok) {
// //         throw new Error(`Failed to fetch doctors: ${response.status} ${response.statusText}`);
// //       }
      
// //       const data = await response.json();
// //       console.log("Doctors data received:", data);
      
// //       if (Array.isArray(data) && data.length > 0) {
// //         setDoctors(data);
// //       } else {
// //         console.warn("No doctors found or invalid data format");
// //         Alert.alert("No Doctors Available", "There are no doctors available at the moment. Please try again later.");
// //         setShowDoctorsList(false);
// //       }
// //     } catch (error) {
// //       console.error("Error fetching doctors:", error);
// //       Alert.alert("Error", "Failed to load doctors. Please check your connection and try again.");
// //       setShowDoctorsList(false);
// //     } finally {
// //       setLoadingDoctors(false);
// //     }
// //   };

// //   // Handle booking appointment - FIXED
// //   const handleBookAppointment = async () => {
// //     if (!selectedDoctor) {
// //       Alert.alert("Error", "Please select a doctor");
// //       return;
// //     }

// //     // Debug patient information
// //     console.log("Patient ID:", patientId);
// //     console.log("Patient UID:", patientUid);
    
// //     if (!patientUid) {
// //       Alert.alert("Error", "Patient information not found. Please log in again.");
// //       return;
// //     }

// //     // Use collected symptom data instead of booking form data
// //     if (!collectedSymptomData.symptoms.trim() || !collectedSymptomData.duration.trim() || !collectedSymptomData.severity) {
// //       Alert.alert("Error", "Missing symptom information. Please start the booking process again.");
// //       return;
// //     }

// //     try {
// //       // Use the exact same payload format as your working appointments screen
// //       const payload = {
// //         uid: patientUid, // Use UID, not patientId
// //         doctorId: selectedDoctor._id,
// //         symptomDuration: collectedSymptomData.duration,
// //         symptomsDescription: collectedSymptomData.symptoms,
// //         symptomSeverity: collectedSymptomData.severity,
// //         // These fields might be needed - you can get them from AsyncStorage if available
// //         patientName: "Patient Name", // You might want to fetch this
// //         patientAge: "", // You might want to fetch this
// //         patientGender: "", // You might want to fetch this
// //       };

// //       console.log("Booking appointment with payload:", payload);

// //       const response = await fetch("https://7300c4c894de.ngrok-free.app/api/appointments", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify(payload),
// //       });

// //       console.log("Response status:", response.status);

// //       const responseData = await response.json();
// //       console.log("Response data:", responseData);

// //       if (response.ok) {
// //         const confirmationMessage = createConfirmationMessage("Appointment request sent successfully. For further details, please check the Appointments section.");
        
// //         setMessages(prev => [...prev, confirmationMessage]);
        
// //         // Reset states
// //         setShowBookingForm(false);
// //         setShowDoctorsList(false);
// //         setSelectedDoctor(null);
// //         setCollectedSymptomData({
// //           symptoms: "",
// //           severity: null,
// //           duration: "",
// //         });
// //         setBookingStep("initial");
        
// //         setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
// //       } else {
// //         throw new Error(`Server responded with status ${response.status}: ${responseData.message || responseData.error || 'Unknown error'}`);
// //       }
// //     } catch (error) {
// //       console.error("Error booking appointment:", error);
      
// //       let errorMessage = "Failed to book appointment. Please try again.";
// //       if (error instanceof Error) {
// //         if (error.message.includes('Network')) {
// //           errorMessage = "Network error. Please check your connection.";
// //         } else if (error.message.includes('400')) {
// //           errorMessage = "Invalid booking data. Please check all fields.";
// //         } else if (error.message.includes('404')) {
// //           errorMessage = "Patient profile not found. Please complete your profile first.";
// //         } else if (error.message.includes('500')) {
// //           errorMessage = "Server error. Please try again later.";
// //         } else {
// //           errorMessage = error.message;
// //         }
// //       }
      
// //       Alert.alert("Booking Error", errorMessage);
// //     }
// //   };

// //   // Handle location
// //   const handleSaveLocation = async () => {
// //     setLocationLoading(true);
// //     console.log("Patient UID:", patientUid);
// //     if (patientUid === null) {
// //       setLocationLoading(false);
// //       Alert.alert("Error", "Patient UID is missing. Try logging in again.");
// //       return;
// //     }
// //     const result = await updatePatientLocation(
// //       patientUid,
// //       "https://7300c4c894de.ngrok-free.app/api"
// //     );
// //     setLocationLoading(false);

// //     if (result.success) {
// //       Alert.alert("Location Saved Successfully", result.message);
// //     } else {
// //       Alert.alert("Error", result.message);
// //     }
// //   };

// //   const switcherAnim = useRef(new Animated.Value(-width)).current;

// //   const toggleSwitcher = () => {
// //     if (showSwitcher) {
// //       Animated.timing(switcherAnim, { toValue: -width, duration: 300, useNativeDriver: false }).start(() =>
// //         setShowSwitcher(false)
// //       );
// //     } else {
// //       setShowSwitcher(true);
// //       Animated.timing(switcherAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
// //     }
// //   };

// //   const selectProfile = async (profile: any) => {
// //     setSelectedFamily(profile);
// //     await AsyncStorage.setItem(`family-${accountId}`, JSON.stringify(profile));
// //     toggleSwitcher();
// //   };

// //   useEffect(() => {
// //     async function loadFamily() {
// //       try {
// //         const storedFamily = await AsyncStorage.getItem(`family-${accountId}`);
// //         if (storedFamily) {
// //           setSelectedFamily(JSON.parse(storedFamily));
// //         }

// //         if (accountId) {
// //           const res = await fetch(`https://7300c4c894de.ngrok-free.app/api/patients/family/${accountId}`);
// //           const data = await res.json();
// //           setFamilyProfiles(data || []);
// //         }
// //       } catch (error) {
// //         console.error("Failed to load family data:", error);
// //       }
// //     }

// //     if (accountId) loadFamily();
// //   }, [accountId]);

// //   const panResponder = PanResponder.create({
// //     onStartShouldSetPanResponder: (evt, gestureState) => {
// //       const touchY = evt.nativeEvent.pageY;
// //       const handleBarY = currentY + 15;
// //       return Math.abs(touchY - handleBarY) < 30;
// //     },
// //     onMoveShouldSetPanResponder: (evt, gestureState) => {
// //       const touchY = evt.nativeEvent.pageY;
// //       const handleBarY = currentY + 15;
// //       return Math.abs(touchY - handleBarY) < 30 && Math.abs(gestureState.dy) > 8;
// //     },
// //     onPanResponderGrant: () => {
// //       sheetY.setOffset(currentY);
// //       sheetY.setValue(0);
// //     },
// //     onPanResponderMove: (_, gestureState) => {
// //       const minY = height * 0.55;
// //       const maxY = height * 0.88;
// //       const newY = Math.max(minY, Math.min(maxY, gestureState.dy + currentY));
// //       sheetY.setValue(newY - currentY);
// //     },
// //     onPanResponderRelease: (_, gestureState) => {
// //       sheetY.flattenOffset();
// //       let finalY = currentY + gestureState.dy;
// //       const velocity = gestureState.vy;
// //       let targetY;
      
// //       if (velocity > 0.8) targetY = height * 0.88;
// //       else if (velocity < -0.8) targetY = height * 0.55;
// //       else if (finalY < height * 0.715) targetY = height * 0.55;
// //       else targetY = height * 0.88;
      
// //       setCurrentY(targetY);
// //       Animated.spring(sheetY, { 
// //         toValue: targetY, 
// //         useNativeDriver: false, 
// //         tension: 80, 
// //         friction: 12 
// //       }).start();
// //     },
// //   });

// //   const routetoSearch = () => {
// //     router.push('/patient/screens/searchpharma')
// //   }

// //   const startRecording = async () => {
// //     try {
// //       await Audio.requestPermissionsAsync();
// //       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
// //       const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
// //       recordingRef.current = recording;
// //       setRecording(recording);
// //     } catch (err) { console.error(err); }
// //   };

// //   const stopRecording = async () => {
// //     try {
// //       if (!recordingRef.current) return;
// //       await recordingRef.current.stopAndUnloadAsync();
// //       const uri = recordingRef.current.getURI();
// //       setRecording(null);
// //       if (!uri) return;

// //       const response = await fetch(uri);
// //       const blob = await response.blob();
// //       const reader = new FileReader();
// //       reader.onloadend = async () => {
// //         const base64Audio = reader.result?.toString().split(",")[1];
// //         if (!base64Audio) return;
// //         try {
// //           setLoading(true);
// //           const res = await axios.post("https://7300c4c894de.ngrok-free.app/api/speech/transcribe", { audio: base64Audio });
// //           const transcription = res.data.transcription;
// //           if (transcription) handleSubmit(transcription);
// //         } catch (err) { console.error(err); }
// //         finally { setLoading(false); }
// //       };
// //       reader.readAsDataURL(blob);
// //     } catch (err) { console.error(err); setRecording(null); setLoading(false); }
// //   };

// //   // FIXED handleSubmit function
// //   const handleSubmit = async (text?: string) => {
// //     const finalInput = text || textInput;
// //     if (!finalInput.trim()) return;

// //     const userMessage = createUserMessage(finalInput);
// //     setMessages(prev => [...prev, userMessage]);
// //     setTextInput("");
// //     setLoading(true);

// //     setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

// //     try {
// //       const res = await fetch("https://7300c4c894de.ngrok-free.app/diagnose", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ symptoms: finalInput }),
// //       });
// //       const data = await res.json();
// //       const aiReply = data.answer || "Server error";
      
// //       // Add AI response first
// //       const aiMessage = createAIMessage(aiReply);
// //       setMessages(prev => [...prev, aiMessage]);
      
// //       // Enable speech if available
// //       if (speakerEnabled && aiReply && aiReply !== "Server error") {
// //         Speech.speak(aiReply);
// //       }
      
// //       // Add booking prompt as a separate message after a short delay
// //       setTimeout(() => {
// //         const bookingPromptMessage = createBookingPromptMessage();
// //         setMessages(prev => [...prev, bookingPromptMessage]);
// //         setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
// //       }, 1000);
      
// //       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
// //     } catch (err) { 
// //       console.error(err);
// //       const errorMessage = createAIMessage("I'm having trouble connecting to the server. Please try again.");
// //       setMessages(prev => [...prev, errorMessage]);
// //     }
// //     finally { setLoading(false); }
// //   };

// //   // FIXED handleBookingResponse function
// //   const handleBookingResponse = (wantsToBook: boolean) => {
// //     if (wantsToBook) {
// //       // Store the initial symptoms description from the last user message
// //       const lastUserMessage = messages.filter(msg => msg.sender === "user").pop();
// //       if (lastUserMessage) {
// //         setCollectedSymptomData(prev => ({
// //           ...prev,
// //           symptoms: lastUserMessage.text
// //         }));
// //       }
      
// //       // Start the enhanced booking flow - ask for severity first
// //       setBookingStep("severity");
// //       const severityPromptMessage = createSeverityPromptMessage();
// //       setMessages(prev => prev.map(msg => ({ 
// //         ...msg, 
// //         showBookingPrompt: false 
// //       })).concat([severityPromptMessage]));
// //       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
// //     } else {
// //       // Remove booking prompts from messages
// //       setMessages(prev => prev.map(msg => ({ 
// //         ...msg, 
// //         showBookingPrompt: false 
// //       })));
// //       setBookingStep("initial");
// //     }
// //   };

// //   // FIXED handleSeverityResponse function
// //   const handleSeverityResponse = (severity: "mild" | "moderate" | "severe") => {
// //     setCollectedSymptomData(prev => ({ ...prev, severity }));
// //     setBookingStep("duration");
    
// //     // Add user's severity selection to chat
// //     const userSeverityMessage = createUserMessage(`Severity: ${severity.charAt(0).toUpperCase() + severity.slice(1)}`);
    
// //     // Ask for duration
// //     const durationPromptMessage = createDurationPromptMessage();
    
// //     setMessages(prev => prev.map(msg => ({ 
// //       ...msg, 
// //       showSeverityPrompt: false 
// //     })).concat([userSeverityMessage, durationPromptMessage]));
    
// //     setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
// //   };

// //   // FIXED handleDurationResponse function
// //   const handleDurationResponse = (duration: string) => {
// //     setCollectedSymptomData(prev => ({ ...prev, duration }));
// //     setBookingStep("doctors");
    
// //     // Add user's duration to chat
// //     const userDurationMessage = createUserMessage(`Duration: ${duration}`);
    
// //     // Show processing message
// //     const processingMessage = createAIMessage("Perfect! Let me find available doctors for you...");
    
// //     setMessages(prev => prev.map(msg => ({ 
// //       ...msg, 
// //       showDurationPrompt: false 
// //     })).concat([userDurationMessage, processingMessage]));
    
// //     setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    
// //     // Fetch doctors and show the list
// //     fetchDoctors();
// //     setTimeout(() => {
// //       setShowDoctorsList(true);
// //     }, 1000);
// //   };

// //   const toggleSpeaker = () => {
// //     setSpeakerEnabled(!speakerEnabled);
// //     if (!speakerEnabled) Speech.stop();
// //   };

// //   const renderItem = ({ item }: { item: Message }) => (
// //     <View style={styles.messageContainer}>
// //       {/* Only show message bubble if there's text */}
// //       {item.text && (
// //         <View style={[
// //           styles.messageBubble,
// //           item.sender === "user" ? styles.userMessage : styles.aiMessage
// //         ]}>
// //           <Text style={[
// //             styles.messageText,
// //             item.sender === "user" ? styles.userMessageText : styles.aiMessageText
// //           ]}>
// //             {item.text}
// //           </Text>
// //         </View>
// //       )}
      
// //       {/* Initial Booking Prompt */}
// //       {item.showBookingPrompt && (
// //         <View style={styles.bookingPromptContainer}>
// //           <Text style={styles.bookingPromptText}>Do you want to book an appointment with a doctor?</Text>
// //           <View style={styles.bookingButtonsContainer}>
// //             <TouchableOpacity 
// //               style={styles.bookingYesButton} 
// //               onPress={() => handleBookingResponse(true)}
// //             >
// //               <Text style={styles.bookingYesButtonText}>Yes</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity 
// //               style={styles.bookingNoButton} 
// //               onPress={() => handleBookingResponse(false)}
// //             >
// //               <Text style={styles.bookingNoButtonText}>No</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       )}

// //       {/* Severity Prompt */}
// //       {item.showSeverityPrompt && (
// //         <View style={styles.bookingPromptContainer}>
// //           <View style={styles.severityButtonsContainer}>
// //             <TouchableOpacity 
// //               style={[styles.severityButton, { backgroundColor: "#22C55E" }]} 
// //               onPress={() => handleSeverityResponse("mild")}
// //             >
// //               <Ionicons name="happy-outline" size={20} color="white" />
// //               <Text style={styles.severityButtonText}>Mild</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity 
// //               style={[styles.severityButton, { backgroundColor: "#F59E0B" }]} 
// //               onPress={() => handleSeverityResponse("moderate")}
// //             >
// //               <Ionicons name="alert-circle-outline" size={20} color="white" />
// //               <Text style={styles.severityButtonText}>Moderate</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity 
// //               style={[styles.severityButton, { backgroundColor: "#EF4444" }]} 
// //               onPress={() => handleSeverityResponse("severe")}
// //             >
// //               <Ionicons name="warning-outline" size={20} color="white" />
// //               <Text style={styles.severityButtonText}>Severe</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       )}

// //       {/* Duration Prompt */}
// //       {item.showDurationPrompt && (
// //         <View style={styles.bookingPromptContainer}>
// //           <View style={styles.durationButtonsContainer}>
// //             <TouchableOpacity 
// //               style={styles.durationButton} 
// //               onPress={() => handleDurationResponse("Less than a day")}
// //             >
// //               <Text style={styles.durationButtonText}>Less than a day</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity 
// //               style={styles.durationButton} 
// //               onPress={() => handleDurationResponse("2-3 days")}
// //             >
// //               <Text style={styles.durationButtonText}>2-3 days</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity 
// //               style={styles.durationButton} 
// //               onPress={() => handleDurationResponse("1 week")}
// //             >
// //               <Text style={styles.durationButtonText}>1 week</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity 
// //               style={styles.durationButton} 
// //               onPress={() => handleDurationResponse("2-4 weeks")}
// //             >
// //               <Text style={styles.durationButtonText}>2-4 weeks</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity 
// //               style={styles.durationButton} 
// //               onPress={() => handleDurationResponse("1-3 months")}
// //             >
// //               <Text style={styles.durationButtonText}>1-3 months</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity 
// //               style={styles.durationButton} 
// //               onPress={() => handleDurationResponse("More than 3 months")}
// //             >
// //               <Text style={styles.durationButtonText}>More than 3 months</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       )}
// //     </View>
// //   );

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
// //       {/* Background Gradient */}
// //       <LinearGradient 
// //         colors={["#1E3A8A", "#3B82F6", "#60A5FA"]} 
// //         style={StyleSheet.absoluteFillObject} 
// //       />
      
// //       {/* Header */}
// //       <View style={styles.header}>
// //         <View style={styles.headerLeft}>
// //           <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
// //             <LinearGradient
// //               colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //               style={styles.headerButtonGradient}
// //             >
// //               <Ionicons name="person" size={22} color="white" />
// //             </LinearGradient>
// //           </TouchableOpacity>
          
// //           <TouchableOpacity
// //             style={styles.headerButton}
// //             onPress={handleSaveLocation}
// //             disabled={locationLoading}
// //             activeOpacity={0.8}
// //           >
// //             <LinearGradient
// //               colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //               style={styles.headerButtonGradient}
// //             >
// //               {locationLoading ? (
// //                 <ActivityIndicator size="small" color="white" />
// //               ) : (
// //                 <Ionicons name="location" size={22} color="white" />
// //               )}
// //             </LinearGradient>
// //           </TouchableOpacity>
// //         </View>

// //         <View style={styles.headerCenter}>
// //           <Text style={styles.headerTitle}>MediConnect</Text>
// //           <Text style={styles.headerSubtitle}>Your Health Assistant</Text>
// //         </View>

// //         <View style={styles.headerRight}>
// //           <TouchableOpacity style={styles.languageButton} activeOpacity={0.8}>
// //             <LinearGradient
// //               colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //               style={styles.languageButtonGradient}
// //             >
// //               <Text style={styles.languageText}>EN</Text>
// //               <Ionicons name="language" size={14} color="white" />
// //             </LinearGradient>
// //           </TouchableOpacity>
          
// //           <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
// //             <LinearGradient
// //               colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //               style={styles.headerButtonGradient}
// //             >
// //               <Ionicons name="notifications" size={22} color="white" />
// //             </LinearGradient>
// //           </TouchableOpacity>
// //         </View>
// //       </View>

// //       {/* Chat Area */}
// //       <Animated.View style={[
// //         styles.chatContainer,
// //         {
// //           maxHeight: Animated.subtract(sheetY, new Animated.Value(180)).interpolate({
// //             inputRange: [height * 0.3, height * 0.88],
// //             outputRange: [height * 0.15, height * 0.4],
// //             extrapolate: 'clamp'
// //           })
// //         }
// //       ]}>
// //         <FlatList
// //           ref={flatListRef}
// //           data={messages}
// //           keyExtractor={item => item.id}
// //           renderItem={renderItem}
// //           contentContainerStyle={styles.chatContent}
// //           showsVerticalScrollIndicator={false}
// //           keyboardShouldPersistTaps="handled"
// //           style={styles.chatList}
// //           removeClippedSubviews={true}
// //           maxToRenderPerBatch={10}
// //           windowSize={10}
// //         />
// //         {loading && (
// //           <View style={styles.loadingContainer}>
// //             <Text style={styles.loadingText}>AI is analyzing...</Text>
// //           </View>
// //         )}
// //       </Animated.View>

// //       {/* Mic Button */}
// //       <Animated.View style={[
// //         styles.micButtonContainer,
// //         { 
// //           top: Animated.subtract(sheetY, new Animated.Value(110))
// //         }
// //       ]}>
// //         <TouchableOpacity
// //           style={[
// //             styles.micButton,
// //             recording && styles.micButtonRecording
// //           ]}
// //           onPress={recording ? stopRecording : startRecording}
// //           disabled={loading}
// //           activeOpacity={0.8}
// //         >
// //           <LinearGradient
// //             colors={recording 
// //               ? ['rgba(220, 38, 38, 0.9)', 'rgba(239, 68, 68, 0.8)'] 
// //               : ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']
// //             }
// //             style={styles.micButtonGradient}
// //           >
// //             <Ionicons 
// //               name={recording ? "stop" : "mic"} 
// //               size={28} 
// //               color="white" 
// //             />
// //           </LinearGradient>
// //         </TouchableOpacity>
// //       </Animated.View>

// //       {/* Text Input */}
// //       <Animated.View style={[
// //         styles.inputWrapper, 
// //         { 
// //           top: Animated.subtract(sheetY, new Animated.Value(50))
// //         }
// //       ]}>
// //         <View style={styles.textInputContainer}>
// //           <LinearGradient
// //             colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //             style={styles.textInputGradient}
// //           >
// //             <TextInput
// //               style={styles.textInput}
// //               placeholder="Describe your symptoms..."
// //               placeholderTextColor="rgba(255,255,255,0.6)"
// //               value={textInput}
// //               onChangeText={setTextInput}
// //               editable={!loading}
// //               multiline={false}
// //               onSubmitEditing={() => handleSubmit()}
// //             />
// //             <TouchableOpacity
// //               style={styles.sendButton}
// //               onPress={() => handleSubmit()}
// //               disabled={!textInput.trim() || loading}
// //             >
// //               <LinearGradient
// //                 colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']}
// //                 style={styles.sendButtonGradient}
// //               >
// //                 <Ionicons name="arrow-forward" size={18} color="white" />
// //               </LinearGradient>
// //             </TouchableOpacity>
// //           </LinearGradient>
// //         </View>

// //         <TouchableOpacity 
// //           style={styles.speakerButton} 
// //           onPress={toggleSpeaker}
// //           activeOpacity={0.8}
// //         >
// //           <LinearGradient
// //             colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //             style={styles.speakerButtonGradient}
// //           >
// //             <Ionicons name={speakerEnabled ? "volume-high" : "volume-mute"} size={20} color="white" />
// //           </LinearGradient>
// //         </TouchableOpacity>
// //       </Animated.View>

// //       {/* Doctors List Modal */}
// //       <Modal
// //         visible={showDoctorsList}
// //         transparent={true}
// //         animationType="slide"
// //         onRequestClose={() => setShowDoctorsList(false)}
// //       >
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.modalContent}>
// //             <View style={styles.modalHeader}>
// //               <Text style={styles.modalTitle}>Available Doctors</Text>
// //               <TouchableOpacity onPress={() => setShowDoctorsList(false)}>
// //                 <Ionicons name="close" size={24} color="white" />
// //               </TouchableOpacity>
// //             </View>
            
// //             {loadingDoctors ? (
// //               <View style={styles.loadingDoctors}>
// //                 <ActivityIndicator size="large" color="#1E3A8A" />
// //                 <Text>Loading doctors...</Text>
// //               </View>
// //             ) : (
// //               <ScrollView style={styles.doctorsContainer}>
// //                 {doctors.map((doctor) => (
// //                   <View key={doctor._id} style={styles.doctorCard}>
// //                     <View style={styles.doctorInfo}>
// //                       <View style={styles.doctorAvatar}>
// //                         <Ionicons name="person" size={24} color="white" />
// //                       </View>
// //                       <View style={styles.doctorDetails}>
// //                         <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
// //                         <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
// //                         {doctor.experience && (
// //                           <Text style={styles.doctorExperience}>{doctor.experience} years experience</Text>
// //                         )}
// //                         {doctor.rating && (
// //                           <View style={styles.ratingContainer}>
// //                             <Ionicons name="star" size={16} color="#FCD34D" />
// //                             <Text style={styles.rating}>{doctor.rating}</Text>
// //                           </View>
// //                         )}
// //                       </View>
// //                     </View>
// //                     <TouchableOpacity
// //                       style={styles.bookNowButton}
// //                       onPress={() => {
// //                         setSelectedDoctor(doctor);
// //                         setShowDoctorsList(false);
                        
// //                         // Show confirmation with pre-filled data
// //                         Alert.alert(
// //                           "Confirm Appointment",
// //                           `Book appointment with Dr. ${doctor.name}?\n\nSymptoms: ${collectedSymptomData.symptoms}\nSeverity: ${collectedSymptomData.severity}\nDuration: ${collectedSymptomData.duration}`,
// //                           [
// //                             { text: "Cancel", style: "cancel" },
// //                             { 
// //                               text: "Book Now", 
// //                               onPress: () => handleBookAppointment() 
// //                             }
// //                           ]
// //                         );
// //                       }}
// //                     >
// //                       <Text style={styles.bookNowButtonText}>Book Now</Text>
// //                     </TouchableOpacity>
// //                   </View>
// //                 ))}
// //               </ScrollView>
// //             )}
// //           </View>
// //         </View>
// //       </Modal>

// //       {/* Booking Form Modal */}
// //       <Modal
// //         visible={showBookingForm}
// //         transparent={true}
// //         animationType="slide"
// //         onRequestClose={() => setShowBookingForm(false)}
// //       >
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.modalContent}>
// //             <View style={styles.modalHeader}>
// //               <Text style={styles.modalTitle}>Book Appointment</Text>
// //               <TouchableOpacity onPress={() => setShowBookingForm(false)}>
// //                 <Ionicons name="close" size={24} color="white" />
// //               </TouchableOpacity>
// //             </View>
            
// //             <ScrollView style={styles.bookingFormContainer}>
// //               {selectedDoctor && (
// //                 <View style={styles.selectedDoctorInfo}>
// //                   <Text style={styles.selectedDoctorTitle}>Dr. {selectedDoctor.name}</Text>
// //                   <Text style={styles.selectedDoctorSpec}>{selectedDoctor.specialization}</Text>
// //                 </View>
// //               )}
              
// //               <View style={styles.formGroup}>
// //                 <Text style={styles.formLabel}>Duration of symptoms</Text>
// //                 <TextInput
// //                   style={styles.formInput}
// //                   placeholder="e.g., 3 days, 1 week"
// //                   value={bookingData.symptomDuration}
// //                   onChangeText={(text) => setBookingData(prev => ({ ...prev, symptomDuration: text }))}
// //                 />
// //               </View>
              
// //               <View style={styles.formGroup}>
// //                 <Text style={styles.formLabel}>Symptom severity</Text>
// //                 <View style={styles.severityButtonsContainer}>
// //                   {['mild', 'moderate', 'severe'].map((severity) => (
// //                     <TouchableOpacity
// //                       key={severity}
// //                       style={[
// //                         styles.severityButton,
// //                         bookingData.symptomSeverity === severity && styles.severityButtonActive
// //                       ]}
// //                       onPress={() => setBookingData(prev => ({ 
// //                         ...prev, 
// //                         symptomSeverity: severity as "mild" | "moderate" | "severe" 
// //                       }))}
// //                     >
// //                       <Text style={[
// //                         styles.severityButtonText,
// //                         bookingData.symptomSeverity === severity && styles.severityButtonTextActive
// //                       ]}>
// //                         {severity.charAt(0).toUpperCase() + severity.slice(1)}
// //                       </Text>
// //                     </TouchableOpacity>
// //                   ))}
// //                 </View>
// //               </View>
              
// //               <View style={styles.formGroup}>
// //                 <Text style={styles.formLabel}>Additional notes</Text>
// //                 <TextInput
// //                   style={[styles.formInput, styles.textArea]}
// //                   placeholder="Any additional information about your symptoms..."
// //                   value={bookingData.additionalNotes}
// //                   onChangeText={(text) => setBookingData(prev => ({ ...prev, additionalNotes: text }))}
// //                   multiline
// //                   numberOfLines={4}
// //                 />
// //               </View>
              
// //               <TouchableOpacity style={styles.submitButton} onPress={handleBookAppointment}>
// //                 <Text style={styles.submitButtonText}>Submit Booking Request</Text>
// //               </TouchableOpacity>
// //             </ScrollView>
// //           </View>
// //         </View>
// //       </Modal>

// //       {/* Bottom Sheet - keeping your existing content */}
// //       <Animated.View style={[styles.bottomContainer, { top: sheetY }]}>
// //         <View style={styles.handleBar} {...panResponder.panHandlers} />

// //         <View style={styles.scrollableWrapper}>
// //           <ScrollView 
// //             style={styles.scrollableContent} 
// //             contentContainerStyle={styles.scrollableContentContainer}
// //             showsVerticalScrollIndicator={false} 
// //             bounces={true}
// //             nestedScrollEnabled={true}
// //             scrollEventThrottle={16}
// //           >
// //             {/* Your existing service grid and content... */}
// //             <View style={styles.servicesGrid}>
// //               <TouchableOpacity 
// //                 style={styles.serviceCard} 
// //                 onPress={() => router.push('/patient/screens/AppointementsScreen')}
// //                 activeOpacity={0.8}
// //               >
// //                 <LinearGradient
// //                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //                   style={styles.serviceCardGradient}
// //                 >
// //                   <View style={styles.serviceIconContainer}>
// //                     <Ionicons name="calendar-outline" size={28} color="white" />
// //                   </View>
// //                   <Text style={styles.serviceTitle}>Appointments</Text>
// //                   <Text style={styles.serviceSubtitle}>Book & manage</Text>
// //                 </LinearGradient>
// //               </TouchableOpacity>

// //               <TouchableOpacity 
// //                 style={styles.serviceCard}
// //                 onPress={() =>
// //                   router.push({
// //                     pathname: "/patient/screens/PrescriptionScreen",
// //                     params: { patientUid: patientId },
// //                   })
// //                 }
// //                 activeOpacity={0.8}
// //               >
// //                 <LinearGradient
// //                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //                   style={styles.serviceCardGradient}
// //                 >
// //                   <View style={styles.serviceIconContainer}>
// //                     <Ionicons name="document-text-outline" size={28} color="white" />
// //                   </View>
// //                   <Text style={styles.serviceTitle}>Prescriptions</Text>
// //                   <Text style={styles.serviceSubtitle}>View & download</Text>
// //                 </LinearGradient>
// //               </TouchableOpacity>

// //               <TouchableOpacity 
// //                 style={styles.serviceCard} 
// //                 onPress={() => router.push('/patient/screens/history')}
// //                 activeOpacity={0.8}
// //               >
// //                 <LinearGradient
// //                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //                   style={styles.serviceCardGradient}
// //                 >
// //                   <View style={styles.serviceIconContainer}>
// //                     <Ionicons name="time-outline" size={28} color="white" />
// //                   </View>
// //                   <Text style={styles.serviceTitle}>History</Text>
// //                   <Text style={styles.serviceSubtitle}>Medical records</Text>
// //                 </LinearGradient>
// //               </TouchableOpacity>

// //               {/* Row 2 */}
// //               <TouchableOpacity 
// //                 style={styles.serviceCard} 
// //                 onPress={routetoSearch}
// //                 activeOpacity={0.8}
// //               >
// //                 <LinearGradient
// //                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //                   style={styles.serviceCardGradient}
// //                 >
// //                   <View style={styles.serviceIconContainer}>
// //                     <Ionicons name="medical-outline" size={28} color="white" />
// //                   </View>
// //                   <Text style={styles.serviceTitle}>Pharmacy</Text>
// //                   <Text style={styles.serviceSubtitle}>Find medicines</Text>
// //                 </LinearGradient>
// //               </TouchableOpacity>

// //               <TouchableOpacity
// //                 style={styles.serviceCard}
// //                 onPress={() => router.push(`/patient/screens/Family?id=${accountId}`)}
// //                 activeOpacity={0.8}
// //               >
// //                 <LinearGradient
// //                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //                   style={styles.serviceCardGradient}
// //                 >
// //                   <View style={styles.serviceIconContainer}>
// //                     <Ionicons name="people-outline" size={28} color="white" />
// //                   </View>
// //                   <Text style={styles.serviceTitle}>Family</Text>
// //                   <Text style={styles.serviceSubtitle}>Manage profiles</Text>
// //                 </LinearGradient>
// //               </TouchableOpacity>

// //               <TouchableOpacity style={styles.serviceCard} activeOpacity={0.8}>
// //                 <LinearGradient
// //                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
// //                   style={styles.serviceCardGradient}
// //                 >
// //                   <View style={styles.serviceIconContainer}>
// //                     <Ionicons name="fitness-outline" size={28} color="white" />
// //                   </View>
// //                   <Text style={styles.serviceTitle}>Health Tips</Text>
// //                   <Text style={styles.serviceSubtitle}>Stay healthy</Text>
// //                 </LinearGradient>
// //               </TouchableOpacity>
// //             </View>

// //             {/* Emergency SOS Button */}
// //             <TouchableOpacity style={styles.emergencyButton} activeOpacity={0.8}>
// //               <LinearGradient 
// //                 colors={["#DC2626", "#EF4444"]} 
// //                 style={styles.emergencyGradient}
// //               >
// //                 <View style={styles.emergencyContent}>
// //                   <Ionicons name="medical" size={24} color="white" />
// //                   <Text style={styles.emergencyText}>Emergency SOS</Text>
// //                 </View>
// //               </LinearGradient>
// //             </TouchableOpacity>

// //             {/* Additional Services */}
// //             <View style={styles.additionalServices}>
// //               <Text style={styles.sectionTitle}>More Services</Text>
// //               <View style={styles.additionalGrid}>
// //                 <TouchableOpacity style={styles.additionalService} activeOpacity={0.8}>
// //                   <LinearGradient
// //                     colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
// //                     style={styles.additionalServiceGradient}
// //                   >
// //                     <Ionicons name="heart-outline" size={20} color="white" />
// //                     <Text style={styles.additionalServiceText}>Health Monitoring</Text>
// //                   </LinearGradient>
// //                 </TouchableOpacity>

// //                 <TouchableOpacity style={styles.additionalService} activeOpacity={0.8}>
// //                   <LinearGradient
// //                     colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
// //                     style={styles.additionalServiceGradient}
// //                   >
// //                     <Ionicons name="chatbubble-outline" size={20} color="white" />
// //                     <Text style={styles.additionalServiceText}>Telemedicine</Text>
// //                   </LinearGradient>
// //                 </TouchableOpacity>

// //                 <TouchableOpacity style={styles.additionalService} activeOpacity={0.8}>
// //                   <LinearGradient
// //                     colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
// //                     style={styles.additionalServiceGradient}
// //                   >
// //                     <Ionicons name="settings-outline" size={20} color="white" />
// //                     <Text style={styles.additionalServiceText}>Settings</Text>
// //                   </LinearGradient>
// //                 </TouchableOpacity>
// //               </View>
// //             </View>

// //             <View style={styles.bottomPadding} />
// //           </ScrollView>
// //         </View>
// //       </Animated.View>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { 
// //     flex: 1, 
// //   },
// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     paddingHorizontal: 20,
// //     paddingTop: 50,
// //     paddingBottom: 20,
// //   },
// //   headerLeft: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: 12,
// //   },
// //   headerCenter: {
// //     alignItems: "center",
// //     flex: 1,
// //   },
// //   headerRight: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: 12,
// //   },
// //   headerButton: {
// //     width: 40,
// //     height: 40,
// //   },
// //   headerButtonGradient: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     borderWidth: 1,
// //     borderColor: 'rgba(255, 255, 255, 0.2)',
// //   },
// //   headerTitle: {
// //     fontSize: 20,
// //     fontWeight: "700",
// //     color: "white",
// //     letterSpacing: 0.5,
// //   },
// //   headerSubtitle: {
// //     fontSize: 12,
// //     color: "rgba(255, 255, 255, 0.8)",
// //     fontWeight: "500",
// //     marginTop: 2,
// //   },
// //   languageButton: {
// //     height: 40,
// //   },
// //   languageButtonGradient: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: 12,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //     gap: 6,
// //     borderWidth: 1,
// //     borderColor: 'rgba(255, 255, 255, 0.2)',
// //   },
// //   languageText: {
// //     color: "white",
// //     fontSize: 12,
// //     fontWeight: "600",
// //   },
// //   chatContainer: { 
// //     position: 'absolute',
// //     left: 20,
// //     right: 20,
// //     top: 130,
// //     zIndex: 5,
// //   },
// //   chatList: {
// //     flex: 1,
// //   },
// //   chatContent: { 
// //     paddingVertical: 10,
// //     flexGrow: 1,
// //     justifyContent: 'flex-end'
// //   },
// //   messageContainer: { 
// //     marginVertical: 4 
// //   },
// //   messageBubble: { 
// //     padding: 16, 
// //     borderRadius: 20, 
// //     maxWidth: "85%",
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.15,
// //     shadowRadius: 8,
// //     elevation: 8,
// //   },
// //   userMessage: { 
// //     backgroundColor: "rgba(255,255,255,0.95)", 
// //     alignSelf: "flex-end", 
// //     borderBottomRightRadius: 6,
// //     borderWidth: 1,
// //     borderColor: 'rgba(255, 255, 255, 0.3)',
// //   },
// //   aiMessage: { 
// //     backgroundColor: "rgba(30, 58, 138, 0.9)", 
// //     alignSelf: "flex-start", 
// //     borderBottomLeftRadius: 6,
// //     borderColor: "rgba(255,255,255,0.2)",
// //     borderWidth: 1,
// //   },
// //   messageText: { 
// //     fontSize: 15,
// //     lineHeight: 22,
// //     fontWeight: "500",
// //   },
// //   userMessageText: { 
// //     color: "#1E3A8A" 
// //   },
// //   aiMessageText: { 
// //     color: "white" 
// //   },
  
// //   // Booking prompt styles
// //   bookingPromptContainer: {
// //     backgroundColor: "rgba(255,255,255,0.95)",
// //     borderRadius: 16,
// //     padding: 16,
// //     marginTop: 8,
// //     alignSelf: "flex-start",
// //     maxWidth: "85%",
// //     borderWidth: 1,
// //     borderColor: 'rgba(255, 255, 255, 0.3)',
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 4,
// //   },
// //   bookingPromptText: {
// //     fontSize: 14,
// //     color: "#1E3A8A",
// //     fontWeight: "600",
// //     marginBottom: 12,
// //     textAlign: "center",
// //   },
// //   bookingButtonsContainer: {
// //     flexDirection: "row",
// //     gap: 12,
// //     justifyContent: "center",
// //   },
// //   bookingYesButton: {
// //     backgroundColor: "#1E3A8A",
// //     paddingHorizontal: 24,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //     flex: 1,
// //     alignItems: "center",
// //   },
// //   bookingYesButtonText: {
// //     color: "white",
// //     fontWeight: "600",
// //     fontSize: 14,
// //   },
// //   bookingNoButton: {
// //     backgroundColor: "transparent",
// //     borderWidth: 1,
// //     borderColor: "#1E3A8A",
// //     paddingHorizontal: 24,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //     flex: 1,
// //     alignItems: "center",
// //   },
// //   bookingNoButtonText: {
// //     color: "#1E3A8A",
// //     fontWeight: "600",
// //     fontSize: 14,
// //   },

// //   // Severity prompt styles
// //   severityButtonsContainer: {
// //     gap: 8,
// //     marginTop: 8,
// //   },
// //   severityButton: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     paddingVertical: 12,
// //     paddingHorizontal: 16,
// //     borderRadius: 12,
// //     gap: 8,
// //   },
// //   severityButtonText: {
// //     color: "white",
// //     fontWeight: "600",
// //     fontSize: 14,
// //   },

// //   // Duration prompt styles
// //   durationButtonsContainer: {
// //     flexDirection: "row",
// //     flexWrap: "wrap",
// //     gap: 8,
// //     marginTop: 8,
// //   },
// //   durationButton: {
// //     backgroundColor: "#1E3A8A",
// //     paddingVertical: 10,
// //     paddingHorizontal: 14,
// //     borderRadius: 20,
// //     minWidth: "45%",
// //     alignItems: "center",
// //   },
// //   durationButtonText: {
// //     color: "white",
// //     fontWeight: "600",
// //     fontSize: 13,
// //     textAlign: "center",
// //   },

// //   // Modal styles
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: "rgba(0,0,0,0.5)",
// //     justifyContent: "flex-end",
// //   },
// //   modalContent: {
// //     backgroundColor: "white",
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     maxHeight: "80%",
// //     minHeight: "60%",
// //   },
// //   modalHeader: {
// //     backgroundColor: "#1E3A8A",
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     paddingHorizontal: 20,
// //     paddingVertical: 16,
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //   },
// //   modalTitle: {
// //     fontSize: 18,
// //     fontWeight: "700",
// //     color: "white",
// //   },

// //   // Doctors list styles
// //   loadingDoctors: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     paddingVertical: 40,
// //   },
// //   doctorsContainer: {
// //     flex: 1,
// //     padding: 20,
// //   },
// //   doctorCard: {
// //     backgroundColor: "#F8FAFC",
// //     borderRadius: 12,
// //     padding: 16,
// //     marginBottom: 12,
// //     borderWidth: 1,
// //     borderColor: "#E2E8F0",
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //   },
// //   doctorInfo: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     flex: 1,
// //   },
// //   doctorAvatar: {
// //     width: 50,
// //     height: 50,
// //     borderRadius: 25,
// //     backgroundColor: "#1E3A8A",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },
// //   doctorDetails: {
// //     marginLeft: 12,
// //     flex: 1,
// //   },
// //   doctorName: {
// //     fontSize: 16,
// //     fontWeight: "600",
// //     color: "#1E293B",
// //     marginBottom: 4,
// //   },
// //   doctorSpecialization: {
// //     fontSize: 14,
// //     color: "#64748B",
// //     marginBottom: 2,
// //   },
// //   doctorExperience: {
// //     fontSize: 12,
// //     color: "#94A3B8",
// //     marginBottom: 4,
// //   },
// //   ratingContainer: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },
// //   rating: {
// //     fontSize: 12,
// //     color: "#64748B",
// //     marginLeft: 4,
// //   },
// //   bookNowButton: {
// //     backgroundColor: "#1E3A8A",
// //     paddingHorizontal: 16,
// //     paddingVertical: 8,
// //     borderRadius: 6,
// //   },
// //   bookNowButtonText: {
// //     color: "white",
// //     fontWeight: "600",
// //     fontSize: 14,
// //   },

// //   // Booking form styles
// //   bookingFormContainer: {
// //     flex: 1,
// //     padding: 20,
// //   },
// //   selectedDoctorInfo: {
// //     backgroundColor: "#F0F4FF",
// //     padding: 16,
// //     borderRadius: 12,
// //     marginBottom: 20,
// //     alignItems: "center",
// //   },
// //   selectedDoctorTitle: {
// //     fontSize: 16,
// //     fontWeight: "600",
// //     color: "#1E3A8A",
// //     marginBottom: 4,
// //   },
// //   selectedDoctorSpec: {
// //     fontSize: 14,
// //     color: "#64748B",
// //   },
// //   formGroup: {
// //     marginBottom: 20,
// //   },
// //   formLabel: {
// //     fontSize: 14,
// //     fontWeight: "600",
// //     color: "#1E293B",
// //     marginBottom: 8,
// //   },
// //   formInput: {
// //     borderWidth: 1,
// //     borderColor: "#D1D5DB",
// //     borderRadius: 8,
// //     padding: 12,
// //     fontSize: 14,
// //     backgroundColor: "white",
// //     color: "#1E293B",
// //   },
// //   textArea: {
// //     height: 80,
// //     textAlignVertical: "top",
// //   },
// //   severityButtonActive: {
// //     backgroundColor: "#1E3A8A",
// //     borderColor: "#1E3A8A",
// //   },
// //   severityButtonTextActive: {
// //     color: "white",
// //   },
// //   submitButton: {
// //     backgroundColor: "#1E3A8A",
// //     paddingVertical: 14,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginTop: 20,
// //   },
// //   submitButtonText: {
// //     color: "white",
// //     fontSize: 16,
// //     fontWeight: "600",
// //   },
  
// //   loadingContainer: { 
// //     alignItems: "center", 
// //     paddingVertical: 12 
// //   },
// //   loadingText: { 
// //     color: "rgba(255,255,255,0.8)", 
// //     fontSize: 14, 
// //     fontWeight: "500",
// //   },
// //   micButtonContainer: {
// //     position: 'absolute',
// //     left: width / 2 - 32,
// //     zIndex: 15,
// //     alignItems: 'center',
// //   },
// //   micButton: {
// //     width: 64,
// //     height: 64,
// //   },
// //   micButtonGradient: {
// //     width: 64,
// //     height: 64,
// //     borderRadius: 32,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 8 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 12,
// //     elevation: 12,
// //     borderWidth: 2,
// //     borderColor: "rgba(255,255,255,0.3)",
// //   },
// //   micButtonRecording: {
// //     // This style is handled by the gradient colors in the component
// //   },
// //   inputWrapper: { 
// //     position: "absolute", 
// //     left: 20, 
// //     right: 20, 
// //     flexDirection: "row", 
// //     alignItems: "center", 
// //     gap: 12, 
// //     zIndex: 10 
// //   },
// //   textInputContainer: { 
// //     flex: 1, 
// //   },
// //   textInputGradient: {
// //     flexDirection: "row", 
// //     alignItems: "center", 
// //     borderRadius: 25, 
// //     paddingHorizontal: 20, 
// //     paddingVertical: 4,
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.2)",
// //   },
// //   textInput: { 
// //     flex: 1, 
// //     color: "white", 
// //     fontSize: 15, 
// //     paddingVertical: 12,
// //     fontWeight: "500",
// //   },
// //   sendButton: { 
// //     marginLeft: 8,
// //   },
// //   sendButtonGradient: {
// //     width: 36,
// //     height: 36,
// //     borderRadius: 18,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.2)",
// //   },
// //   speakerButton: { 
// //     width: 48, 
// //     height: 48, 
// //   },
// //   speakerButtonGradient: {
// //     width: 48, 
// //     height: 48, 
// //     borderRadius: 24, 
// //     alignItems: "center", 
// //     justifyContent: "center",
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.2)",
// //   },
// //   bottomContainer: { 
// //     position: "absolute", 
// //     left: 0, 
// //     right: 0, 
// //     height: height * 0.55,
// //     backgroundColor: "rgba(255,255,255,0.15)", 
// //     borderTopLeftRadius: 25, 
// //     borderTopRightRadius: 25, 
// //     paddingTop: 25,
// //     borderTopWidth: 1,
// //     borderTopColor: "rgba(255,255,255,0.2)",
// //   },
// //   handleBar: { 
// //     width: 60, 
// //     height: 5, 
// //     backgroundColor: "rgba(255,255,255,0.5)", 
// //     borderRadius: 3, 
// //     alignSelf: "center", 
// //     marginBottom: 20,
// //     paddingVertical: 15,
// //     marginTop: -10,
// //   },
// //   scrollableWrapper: {
// //     flex: 1,
// //   },
// //   scrollableContent: { 
// //     flex: 1,
// //   },
// //   scrollableContentContainer: {
// //     paddingHorizontal: 20,
// //     paddingBottom: 20,
// //   },
// //   servicesGrid: {
// //     flexDirection: "row",
// //     flexWrap: "wrap",
// //     justifyContent: "space-between",
// //     marginBottom: 24,
// //   },
// //   serviceCard: {
// //     width: (width - 60) / 3,
// //     marginBottom: 16,
// //   },
// //   serviceCardGradient: {
// //     borderRadius: 20,
// //     padding: 16,
// //     alignItems: "center",
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.2)",
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 5,
// //   },
// //   serviceIconContainer: {
// //     width: 48,
// //     height: 48,
// //     borderRadius: 24,
// //     backgroundColor: "rgba(255,255,255,0.2)",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     marginBottom: 12,
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.1)",
// //   },
// //   serviceTitle: {
// //     color: "white",
// //     fontSize: 14,
// //     fontWeight: "700",
// //     textAlign: "center",
// //     marginBottom: 4,
// //   },
// //   serviceSubtitle: {
// //     color: "rgba(255,255,255,0.8)",
// //     fontSize: 11,
// //     fontWeight: "500",
// //     textAlign: "center",
// //   },
// //   emergencyButton: {
// //     marginBottom: 24,
// //     borderRadius: 20,
// //     overflow: "hidden",
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 6 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 12,
// //     elevation: 8,
// //   },
// //   emergencyGradient: {
// //     paddingVertical: 16,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.2)",
// //   },
// //   emergencyContent: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: 12,
// //   },
// //   emergencyText: {
// //     color: "white",
// //     fontSize: 18,
// //     fontWeight: "700",
// //     letterSpacing: 0.5,
// //   },
// //   additionalServices: {
// //     marginBottom: 16,
// //   },
// //   sectionTitle: {
// //     color: "white",
// //     fontSize: 16,
// //     fontWeight: "700",
// //     marginBottom: 16,
// //     letterSpacing: 0.5,
// //   },
// //   additionalGrid: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //   },
// //   additionalService: {
// //     flex: 1,
// //     marginHorizontal: 4,
// //   },
// //   additionalServiceGradient: {
// //     borderRadius: 16,
// //     padding: 12,
// //     alignItems: "center",
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.1)",
// //   },
// //   additionalServiceText: {
// //     color: "white",
// //     fontSize: 12,
// //     fontWeight: "600",
// //     textAlign: "center",
// //     marginTop: 8,
// //   },
// //   bottomPadding: {
// //     height: 20,
// //   },
// // });  

// // Enhanced [id].tsx with appointment booking flow - FIXED TypeScript errors
// import React, { JSX, useState, useRef, useEffect } from "react";
// import { useLocalSearchParams, useRouter } from "expo-router";

// import {
//   Animated,
//   Dimensions,
//   PanResponder,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   FlatList,
//   Platform,
//   KeyboardAvoidingView,
//   Modal,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Alert, ActivityIndicator } from "react-native";
// import * as Speech from "expo-speech";
// import { Audio } from "expo-av";
// import { updatePatientLocation } from "../utils/patientHelper";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// const router = useRouter();

// const { width, height } = Dimensions.get("window");

// // Fixed interface with explicit boolean values
// interface Message {
//   id: string;
//   sender: "user" | "ai";
//   text: string;
//   showBookingPrompt: boolean;
//   showSeverityPrompt: boolean;
//   showDurationPrompt: boolean;
// }

// interface Doctor {
//   _id: string;
//   name: string;
//   specialization?: string;
//   available?: string;
//   rating?: number;
//   experience?: string;
// }

// interface BookingFormData {
//   symptomDuration: string;
//   symptomSeverity: "mild" | "moderate" | "severe";
//   additionalNotes: string;
// }

// interface CollectedSymptomData {
//   symptoms: string;
//   severity: "mild" | "moderate" | "severe" | null;
//   duration: string;
// }

// // Helper functions to create messages with all properties explicitly set
// const createUserMessage = (text: string): Message => ({
//   id: Date.now().toString(),
//   sender: "user",
//   text,
//   showBookingPrompt: false,
//   showSeverityPrompt: false,
//   showDurationPrompt: false,
// });

// const createAIMessage = (text: string): Message => ({
//   id: Date.now().toString() + "_ai",
//   sender: "ai",
//   text,
//   showBookingPrompt: false,
//   showSeverityPrompt: false,
//   showDurationPrompt: false,
// });

// const createBookingPromptMessage = (): Message => ({
//   id: Date.now().toString() + "_booking_prompt",
//   sender: "ai",
//   text: "",
//   showBookingPrompt: true,
//   showSeverityPrompt: false,
//   showDurationPrompt: false,
// });

// const createSeverityPromptMessage = (): Message => ({
//   id: Date.now().toString() + "_severity_prompt",
//   sender: "ai",
//   text: "Please select the severity of your symptoms:",
//   showBookingPrompt: false,
//   showSeverityPrompt: true,
//   showDurationPrompt: false,
// });

// const createDurationPromptMessage = (): Message => ({
//   id: Date.now().toString() + "_duration_prompt",
//   sender: "ai",
//   text: "How long have you been experiencing these symptoms?",
//   showBookingPrompt: false,
//   showSeverityPrompt: false,
//   showDurationPrompt: true,
// });

// const createConfirmationMessage = (text: string): Message => ({
//   id: Date.now().toString() + "_confirmation",
//   sender: "ai",
//   text,
//   showBookingPrompt: false,
//   showSeverityPrompt: false,
//   showDurationPrompt: false,
// });

// export default function PatientHome() {
//   const { id } = useLocalSearchParams();
//   const accountId: string = (id as string) || "";
//   const [locationLoading, setLocationLoading] = useState(false);
//   const [selectedFamily, setSelectedFamily] = useState<{ uid: string; name: string } | null>(null);
//   const [familyProfiles, setFamilyProfiles] = useState<any[]>([]);
//   const [showSwitcher, setShowSwitcher] = useState(false);
//   const [textInput, setTextInput] = useState("");
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);
//   const [speakerEnabled, setSpeakerEnabled] = useState(true);

//   // New states for enhanced appointment booking flow
//   const [showBookingPrompt, setShowBookingPrompt] = useState(false);
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [loadingDoctors, setLoadingDoctors] = useState(false);
//   const [showDoctorsList, setShowDoctorsList] = useState(false);
//   const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
//   const [showBookingForm, setShowBookingForm] = useState(false);
//   const [bookingData, setBookingData] = useState<BookingFormData>({
//     symptomDuration: "",
//     symptomSeverity: "mild",
//     additionalNotes: "",
//   });
  
//   // New states for enhanced symptom collection
//   const [collectedSymptomData, setCollectedSymptomData] = useState<CollectedSymptomData>({
//     symptoms: "",
//     severity: null,
//     duration: "",
//   });
//   const [bookingStep, setBookingStep] = useState<"initial" | "severity" | "duration" | "doctors">("initial");

//   const recordingRef = useRef<Audio.Recording | null>(null);
//   const flatListRef = useRef<FlatList>(null);

//   const [sheetY] = useState(new Animated.Value(height * 0.55));
//   const [currentY, setCurrentY] = useState(height * 0.55);
//   const [patientId, setpatientId] = useState<string | null>(null);
//   const [patientUid, setpatientUid] = useState<string | null>(null);

//   useEffect(() => {
//     const loadDoctor = async () => {
//       const id = await AsyncStorage.getItem("patientId");
//       const uid = await AsyncStorage.getItem("PatientUid");
//       setpatientId(id);
//       setpatientUid(uid);
//     };
//     loadDoctor();
//   }, []);

//   // Fetch doctors from backend
//   const fetchDoctors = async () => {
//     setLoadingDoctors(true);
//     try {
//       console.log("Fetching doctors from API...");
//       const response = await fetch("https://7300c4c894de.ngrok-free.app/api/doctors");
//       console.log("Doctors API response status:", response.status);
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch doctors: ${response.status} ${response.statusText}`);
//       }
      
//       const data = await response.json();
//       console.log("Doctors data received:", data);
      
//       if (Array.isArray(data) && data.length > 0) {
//         setDoctors(data);
//       } else {
//         console.warn("No doctors found or invalid data format");
//         Alert.alert("No Doctors Available", "There are no doctors available at the moment. Please try again later.");
//         setShowDoctorsList(false);
//       }
//     } catch (error) {
//       console.error("Error fetching doctors:", error);
//       Alert.alert("Error", "Failed to load doctors. Please check your connection and try again.");
//       setShowDoctorsList(false);
//     } finally {
//       setLoadingDoctors(false);
//     }
//   };

//   // Handle booking appointment with specific doctor - FIXED
//   const handleBookAppointment = async (doctor?: Doctor) => {
//     const doctorToBook = doctor || selectedDoctor;
    
//     if (!doctorToBook) {
//       Alert.alert("Error", "Please select a doctor");
//       return;
//     }

//     // Debug patient information
//     console.log("Patient ID:", patientId);
//     console.log("Patient UID:", patientUid);
//     console.log("Doctor to book:", doctorToBook);
    
//     if (!patientUid) {
//       Alert.alert("Error", "Patient information not found. Please log in again.");
//       return;
//     }

//     // Use collected symptom data instead of booking form data
//     if (!collectedSymptomData.symptoms.trim() || !collectedSymptomData.duration.trim() || !collectedSymptomData.severity) {
//       Alert.alert("Error", "Missing symptom information. Please start the booking process again.");
//       return;
//     }

//     try {
//       // Use the exact same payload format as your working appointments screen
//       const payload = {
//         uid: patientUid, // Use UID, not patientId
//         doctorId: doctorToBook._id,
//         symptomDuration: collectedSymptomData.duration,
//         symptomsDescription: collectedSymptomData.symptoms,
//         symptomSeverity: collectedSymptomData.severity,
//         // These fields might be needed - you can get them from AsyncStorage if available
//         patientName: "Patient Name", // You might want to fetch this
//         patientAge: "", // You might want to fetch this
//         patientGender: "", // You might want to fetch this
//       };

//       console.log("Booking appointment with payload:", payload);

//       const response = await fetch("https://7300c4c894de.ngrok-free.app/api/appointments", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       console.log("Response status:", response.status);

//       const responseData = await response.json();
//       console.log("Response data:", responseData);

//       if (response.ok) {
//         const confirmationMessage = createConfirmationMessage("Appointment request sent successfully. For further details, please check the Appointments section.");
        
//         setMessages(prev => [...prev, confirmationMessage]);
        
//         // Reset states
//         setShowBookingForm(false);
//         setShowDoctorsList(false);
//         setSelectedDoctor(null);
//         setCollectedSymptomData({
//           symptoms: "",
//           severity: null,
//           duration: "",
//         });
//         setBookingStep("initial");
        
//         setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//       } else {
//         throw new Error(`Server responded with status ${response.status}: ${responseData.message || responseData.error || 'Unknown error'}`);
//       }
//     } catch (error) {
//       console.error("Error booking appointment:", error);
      
//       let errorMessage = "Failed to book appointment. Please try again.";
//       if (error instanceof Error) {
//         if (error.message.includes('Network')) {
//           errorMessage = "Network error. Please check your connection.";
//         } else if (error.message.includes('400')) {
//           errorMessage = "Invalid booking data. Please check all fields.";
//         } else if (error.message.includes('404')) {
//           errorMessage = "Patient profile not found. Please complete your profile first.";
//         } else if (error.message.includes('500')) {
//           errorMessage = "Server error. Please try again later.";
//         } else {
//           errorMessage = error.message;
//         }
//       }
      
//       Alert.alert("Booking Error", errorMessage);
//     }
//   };

//   // Handle location
//   const handleSaveLocation = async () => {
//     setLocationLoading(true);
//     console.log("Patient UID:", patientUid);
//     if (patientUid === null) {
//       setLocationLoading(false);
//       Alert.alert("Error", "Patient UID is missing. Try logging in again.");
//       return;
//     }
//     const result = await updatePatientLocation(
//       patientUid,
//       "https://7300c4c894de.ngrok-free.app/api"
//     );
//     setLocationLoading(false);

//     if (result.success) {
//       Alert.alert("Location Saved Successfully", result.message);
//     } else {
//       Alert.alert("Error", result.message);
//     }
//   };

//   const switcherAnim = useRef(new Animated.Value(-width)).current;

//   const toggleSwitcher = () => {
//     if (showSwitcher) {
//       Animated.timing(switcherAnim, { toValue: -width, duration: 300, useNativeDriver: false }).start(() =>
//         setShowSwitcher(false)
//       );
//     } else {
//       setShowSwitcher(true);
//       Animated.timing(switcherAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
//     }
//   };

//   const selectProfile = async (profile: any) => {
//     setSelectedFamily(profile);
//     await AsyncStorage.setItem(`family-${accountId}`, JSON.stringify(profile));
//     toggleSwitcher();
//   };

//   useEffect(() => {
//     async function loadFamily() {
//       try {
//         const storedFamily = await AsyncStorage.getItem(`family-${accountId}`);
//         if (storedFamily) {
//           setSelectedFamily(JSON.parse(storedFamily));
//         }

//         if (accountId) {
//           const res = await fetch(`https://7300c4c894de.ngrok-free.app/api/patients/family/${accountId}`);
//           const data = await res.json();
//           setFamilyProfiles(data || []);
//         }
//       } catch (error) {
//         console.error("Failed to load family data:", error);
//       }
//     }

//     if (accountId) loadFamily();
//   }, [accountId]);

//   const panResponder = PanResponder.create({
//     onStartShouldSetPanResponder: (evt, gestureState) => {
//       const touchY = evt.nativeEvent.pageY;
//       const handleBarY = currentY + 15;
//       return Math.abs(touchY - handleBarY) < 30;
//     },
//     onMoveShouldSetPanResponder: (evt, gestureState) => {
//       const touchY = evt.nativeEvent.pageY;
//       const handleBarY = currentY + 15;
//       return Math.abs(touchY - handleBarY) < 30 && Math.abs(gestureState.dy) > 8;
//     },
//     onPanResponderGrant: () => {
//       sheetY.setOffset(currentY);
//       sheetY.setValue(0);
//     },
//     onPanResponderMove: (_, gestureState) => {
//       const minY = height * 0.55;
//       const maxY = height * 0.88;
//       const newY = Math.max(minY, Math.min(maxY, gestureState.dy + currentY));
//       sheetY.setValue(newY - currentY);
//     },
//     onPanResponderRelease: (_, gestureState) => {
//       sheetY.flattenOffset();
//       let finalY = currentY + gestureState.dy;
//       const velocity = gestureState.vy;
//       let targetY;
      
//       if (velocity > 0.8) targetY = height * 0.88;
//       else if (velocity < -0.8) targetY = height * 0.55;
//       else if (finalY < height * 0.715) targetY = height * 0.55;
//       else targetY = height * 0.88;
      
//       setCurrentY(targetY);
//       Animated.spring(sheetY, { 
//         toValue: targetY, 
//         useNativeDriver: false, 
//         tension: 80, 
//         friction: 12 
//       }).start();
//     },
//   });

//   const routetoSearch = () => {
//     router.push('/patient/screens/searchpharma')
//   }

//   const startRecording = async () => {
//     try {
//       await Audio.requestPermissionsAsync();
//       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
//       const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
//       recordingRef.current = recording;
//       setRecording(recording);
//     } catch (err) { console.error(err); }
//   };

//   const stopRecording = async () => {
//     try {
//       if (!recordingRef.current) return;
//       await recordingRef.current.stopAndUnloadAsync();
//       const uri = recordingRef.current.getURI();
//       setRecording(null);
//       if (!uri) return;

//       const response = await fetch(uri);
//       const blob = await response.blob();
//       const reader = new FileReader();
//       reader.onloadend = async () => {
//         const base64Audio = reader.result?.toString().split(",")[1];
//         if (!base64Audio) return;
//         try {
//           setLoading(true);
//           const res = await axios.post("https://7300c4c894de.ngrok-free.app/api/speech/transcribe", { audio: base64Audio });
//           const transcription = res.data.transcription;
//           if (transcription) handleSubmit(transcription);
//         } catch (err) { console.error(err); }
//         finally { setLoading(false); }
//       };
//       reader.readAsDataURL(blob);
//     } catch (err) { console.error(err); setRecording(null); setLoading(false); }
//   };

//   // FIXED handleSubmit function
//   const handleSubmit = async (text?: string) => {
//     const finalInput = text || textInput;
//     if (!finalInput.trim()) return;

//     const userMessage = createUserMessage(finalInput);
//     setMessages(prev => [...prev, userMessage]);
//     setTextInput("");
//     setLoading(true);

//     setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

//     try {
//       const res = await fetch("https://7300c4c894de.ngrok-free.app/diagnose", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ symptoms: finalInput }),
//       });
//       const data = await res.json();
//       const aiReply = data.answer || "Server error";
      
//       // Add AI response first
//       const aiMessage = createAIMessage(aiReply);
//       setMessages(prev => [...prev, aiMessage]);
      
//       // Enable speech if available
//       if (speakerEnabled && aiReply && aiReply !== "Server error") {
//         Speech.speak(aiReply);
//       }
      
//       // Add booking prompt as a separate message after a short delay
//       setTimeout(() => {
//         const bookingPromptMessage = createBookingPromptMessage();
//         setMessages(prev => [...prev, bookingPromptMessage]);
//         setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//       }, 1000);
      
//       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//     } catch (err) { 
//       console.error(err);
//       const errorMessage = createAIMessage("I'm having trouble connecting to the server. Please try again.");
//       setMessages(prev => [...prev, errorMessage]);
//     }
//     finally { setLoading(false); }
//   };

//   // FIXED handleBookingResponse function
//   const handleBookingResponse = (wantsToBook: boolean) => {
//     if (wantsToBook) {
//       // Store the initial symptoms description from the last user message
//       const lastUserMessage = messages.filter(msg => msg.sender === "user").pop();
//       if (lastUserMessage) {
//         setCollectedSymptomData(prev => ({
//           ...prev,
//           symptoms: lastUserMessage.text
//         }));
//       }
      
//       // Start the enhanced booking flow - ask for severity first
//       setBookingStep("severity");
//       const severityPromptMessage = createSeverityPromptMessage();
//       setMessages(prev => prev.map(msg => ({ 
//         ...msg, 
//         showBookingPrompt: false 
//       })).concat([severityPromptMessage]));
//       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//     } else {
//       // Remove booking prompts from messages
//       setMessages(prev => prev.map(msg => ({ 
//         ...msg, 
//         showBookingPrompt: false 
//       })));
//       setBookingStep("initial");
//     }
//   };

//   // FIXED handleSeverityResponse function
//   const handleSeverityResponse = (severity: "mild" | "moderate" | "severe") => {
//     setCollectedSymptomData(prev => ({ ...prev, severity }));
//     setBookingStep("duration");
    
//     // Add user's severity selection to chat
//     const userSeverityMessage = createUserMessage(`Severity: ${severity.charAt(0).toUpperCase() + severity.slice(1)}`);
    
//     // Ask for duration
//     const durationPromptMessage = createDurationPromptMessage();
    
//     setMessages(prev => prev.map(msg => ({ 
//       ...msg, 
//       showSeverityPrompt: false 
//     })).concat([userSeverityMessage, durationPromptMessage]));
    
//     setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//   };

//   // FIXED handleDurationResponse function
//   const handleDurationResponse = (duration: string) => {
//     setCollectedSymptomData(prev => ({ ...prev, duration }));
//     setBookingStep("doctors");
    
//     // Add user's duration to chat
//     const userDurationMessage = createUserMessage(`Duration: ${duration}`);
    
//     // Show processing message
//     const processingMessage = createAIMessage("Perfect! Let me find available doctors for you...");
    
//     setMessages(prev => prev.map(msg => ({ 
//       ...msg, 
//       showDurationPrompt: false 
//     })).concat([userDurationMessage, processingMessage]));
    
//     setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    
//     // Fetch doctors and show the list
//     fetchDoctors();
//     setTimeout(() => {
//       setShowDoctorsList(true);
//     }, 1000);
//   };

//   const toggleSpeaker = () => {
//     setSpeakerEnabled(!speakerEnabled);
//     if (!speakerEnabled) Speech.stop();
//   };

//   const renderItem = ({ item }: { item: Message }) => (
//     <View style={styles.messageContainer}>
//       {/* Only show message bubble if there's text */}
//       {item.text && (
//         <View style={[
//           styles.messageBubble,
//           item.sender === "user" ? styles.userMessage : styles.aiMessage
//         ]}>
//           <Text style={[
//             styles.messageText,
//             item.sender === "user" ? styles.userMessageText : styles.aiMessageText
//           ]}>
//             {item.text}
//           </Text>
//         </View>
//       )}
      
//       {/* Initial Booking Prompt */}
//       {item.showBookingPrompt && (
//         <View style={styles.bookingPromptContainer}>
//           <Text style={styles.bookingPromptText}>Do you want to book an appointment with a doctor?</Text>
//           <View style={styles.bookingButtonsContainer}>
//             <TouchableOpacity 
//               style={styles.bookingYesButton} 
//               onPress={() => handleBookingResponse(true)}
//             >
//               <Text style={styles.bookingYesButtonText}>Yes</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.bookingNoButton} 
//               onPress={() => handleBookingResponse(false)}
//             >
//               <Text style={styles.bookingNoButtonText}>No</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {/* Severity Prompt */}
//       {item.showSeverityPrompt && (
//         <View style={styles.bookingPromptContainer}>
//           <View style={styles.severityButtonsContainer}>
//             <TouchableOpacity 
//               style={[styles.severityButton, { backgroundColor: "#22C55E" }]} 
//               onPress={() => handleSeverityResponse("mild")}
//             >
//               <Ionicons name="happy-outline" size={20} color="white" />
//               <Text style={styles.severityButtonText}>Mild</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={[styles.severityButton, { backgroundColor: "#F59E0B" }]} 
//               onPress={() => handleSeverityResponse("moderate")}
//             >
//               <Ionicons name="alert-circle-outline" size={20} color="white" />
//               <Text style={styles.severityButtonText}>Moderate</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={[styles.severityButton, { backgroundColor: "#EF4444" }]} 
//               onPress={() => handleSeverityResponse("severe")}
//             >
//               <Ionicons name="warning-outline" size={20} color="white" />
//               <Text style={styles.severityButtonText}>Severe</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {/* Duration Prompt */}
//       {item.showDurationPrompt && (
//         <View style={styles.bookingPromptContainer}>
//           <View style={styles.durationButtonsContainer}>
//             <TouchableOpacity 
//               style={styles.durationButton} 
//               onPress={() => handleDurationResponse("Less than a day")}
//             >
//               <Text style={styles.durationButtonText}>Less than a day</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.durationButton} 
//               onPress={() => handleDurationResponse("2-3 days")}
//             >
//               <Text style={styles.durationButtonText}>2-3 days</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.durationButton} 
//               onPress={() => handleDurationResponse("1 week")}
//             >
//               <Text style={styles.durationButtonText}>1 week</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.durationButton} 
//               onPress={() => handleDurationResponse("2-4 weeks")}
//             >
//               <Text style={styles.durationButtonText}>2-4 weeks</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.durationButton} 
//               onPress={() => handleDurationResponse("1-3 months")}
//             >
//               <Text style={styles.durationButtonText}>1-3 months</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.durationButton} 
//               onPress={() => handleDurationResponse("More than 3 months")}
//             >
//               <Text style={styles.durationButtonText}>More than 3 months</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
//       {/* Background Gradient */}
//       <LinearGradient 
//         colors={["#1E3A8A", "#3B82F6", "#60A5FA"]} 
//         style={StyleSheet.absoluteFillObject} 
//       />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
//             <LinearGradient
//               colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
//               style={styles.headerButtonGradient}
//             >
//               <Ionicons name="person" size={22} color="white" />
//             </LinearGradient>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={styles.headerButton}
//             onPress={handleSaveLocation}
//             disabled={locationLoading}
//             activeOpacity={0.8}
//           >
//             <LinearGradient
//               colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
//               style={styles.headerButtonGradient}
//             >
//               {locationLoading ? (
//                 <ActivityIndicator size="small" color="white" />
//               ) : (
//                 <Ionicons name="location" size={22} color="white" />
//               )}
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.headerCenter}>
//           <Text style={styles.headerTitle}>MediConnect</Text>
//           <Text style={styles.headerSubtitle}>Your Health Assistant</Text>
//         </View>

//         <View style={styles.headerRight}>
//           <TouchableOpacity style={styles.languageButton} activeOpacity={0.8}>
//             <LinearGradient
//               colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
//               style={styles.languageButtonGradient}
//             >
//               <Text style={styles.languageText}>EN</Text>
//               <Ionicons name="language" size={14} color="white" />
//             </LinearGradient>
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
//             <LinearGradient
//               colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
//               style={styles.headerButtonGradient}
//             >
//               <Ionicons name="notifications" size={22} color="white" />
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Chat Area */}
//       <Animated.View style={[
//         styles.chatContainer,
//         {
//           maxHeight: Animated.subtract(sheetY, new Animated.Value(180)).interpolate({
//             inputRange: [height * 0.3, height * 0.88],
//             outputRange: [height * 0.15, height * 0.4],
//             extrapolate: 'clamp'
//           })
//         }
//       ]}>
//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           keyExtractor={item => item.id}
//           renderItem={renderItem}
//           contentContainerStyle={styles.chatContent}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//           style={styles.chatList}
//           removeClippedSubviews={true}
//           maxToRenderPerBatch={10}
//           windowSize={10}
//         />
//         {loading && (
//           <View style={styles.loadingContainer}>
//             <Text style={styles.loadingText}>AI is analyzing...</Text>
//           </View>
//         )}
//       </Animated.View>

//       {/* Mic Button */}
//       <Animated.View style={[
//         styles.micButtonContainer,
//         { 
//           top: Animated.subtract(sheetY, new Animated.Value(110))
//         }
//       ]}>
//         <TouchableOpacity
//           style={[
//             styles.micButton,
//             recording && styles.micButtonRecording
//           ]}
//           onPress={recording ? stopRecording : startRecording}
//           disabled={loading}
//           activeOpacity={0.8}
//         >
//           <LinearGradient
//             colors={recording 
//               ? ['rgba(220, 38, 38, 0.9)', 'rgba(239, 68, 68, 0.8)'] 
//               : ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']
//             }
//             style={styles.micButtonGradient}
//           >
//             <Ionicons 
//               name={recording ? "stop" : "mic"} 
//               size={28} 
//               color="white" 
//             />
//           </LinearGradient>
//         </TouchableOpacity>
//       </Animated.View>

//       {/* Text Input */}
//       <Animated.View style={[
//         styles.inputWrapper, 
//         { 
//           top: Animated.subtract(sheetY, new Animated.Value(50))
//         }
//       ]}>
//         <View style={styles.textInputContainer}>
//           <LinearGradient
//             colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
//             style={styles.textInputGradient}
//           >
//             <TextInput
//               style={styles.textInput}
//               placeholder="Describe your symptoms..."
//               placeholderTextColor="rgba(255,255,255,0.6)"
//               value={textInput}
//               onChangeText={setTextInput}
//               editable={!loading}
//               multiline={false}
//               onSubmitEditing={() => handleSubmit()}
//             />
//             <TouchableOpacity
//               style={styles.sendButton}
//               onPress={() => handleSubmit()}
//               disabled={!textInput.trim() || loading}
//             >
//               <LinearGradient
//                 colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']}
//                 style={styles.sendButtonGradient}
//               >
//                 <Ionicons name="arrow-forward" size={18} color="white" />
//               </LinearGradient>
//             </TouchableOpacity>
//           </LinearGradient>
//         </View>

//         <TouchableOpacity 
//           style={styles.speakerButton} 
//           onPress={toggleSpeaker}
//           activeOpacity={0.8}
//         >
//           <LinearGradient
//             colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
//             style={styles.speakerButtonGradient}
//           >
//             <Ionicons name={speakerEnabled ? "volume-high" : "volume-mute"} size={20} color="white" />
//           </LinearGradient>
//         </TouchableOpacity>
//       </Animated.View>

//       {/* Doctors List Modal */}
//       <Modal
//         visible={showDoctorsList}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setShowDoctorsList(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Available Doctors</Text>
//               <TouchableOpacity onPress={() => setShowDoctorsList(false)}>
//                 <Ionicons name="close" size={24} color="white" />
//               </TouchableOpacity>
//             </View>
            
//             {loadingDoctors ? (
//               <View style={styles.loadingDoctors}>
//                 <ActivityIndicator size="large" color="#1E3A8A" />
//                 <Text>Loading doctors...</Text>
//               </View>
//             ) : (
//               <ScrollView style={styles.doctorsContainer}>
//                 {doctors.map((doctor) => (
//                   <View key={doctor._id} style={styles.doctorCard}>
//                     <View style={styles.doctorInfo}>
//                       <View style={styles.doctorAvatar}>
//                         <Ionicons name="person" size={24} color="white" />
//                       </View>
//                       <View style={styles.doctorDetails}>
//                         <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
//                         <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
//                         {doctor.experience && (
//                           <Text style={styles.doctorExperience}>{doctor.experience} years experience</Text>
//                         )}
//                         {doctor.rating && (
//                           <View style={styles.ratingContainer}>
//                             <Ionicons name="star" size={16} color="#FCD34D" />
//                             <Text style={styles.rating}>{doctor.rating}</Text>
//                           </View>
//                         )}
//                       </View>
//                     </View>
//                     <TouchableOpacity
//                       style={styles.bookNowButton}
//                       onPress={() => {
//                         // Pass the doctor directly to avoid state timing issues
//                         setShowDoctorsList(false);
                        
//                         // Show confirmation with pre-filled data and pass the doctor directly
//                         Alert.alert(
//                           "Confirm Appointment",
//                           `Book appointment with Dr. ${doctor.name}?\n\nSymptoms: ${collectedSymptomData.symptoms}\nSeverity: ${collectedSymptomData.severity}\nDuration: ${collectedSymptomData.duration}`,
//                           [
//                             { text: "Cancel", style: "cancel" },
//                             { 
//                               text: "Book Now", 
//                               onPress: () => handleBookAppointment(doctor) // Pass doctor directly
//                             }
//                           ]
//                         );
//                       }}
//                     >
//                       <Text style={styles.bookNowButtonText}>Book Now</Text>
//                     </TouchableOpacity>
//                   </View>
//                 ))}
//               </ScrollView>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* Booking Form Modal */}
//       <Modal
//         visible={showBookingForm}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setShowBookingForm(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Book Appointment</Text>
//               <TouchableOpacity onPress={() => setShowBookingForm(false)}>
//                 <Ionicons name="close" size={24} color="white" />
//               </TouchableOpacity>
//             </View>
            
//             <ScrollView style={styles.bookingFormContainer}>
//               {selectedDoctor && (
//                 <View style={styles.selectedDoctorInfo}>
//                   <Text style={styles.selectedDoctorTitle}>Dr. {selectedDoctor.name}</Text>
//                   <Text style={styles.selectedDoctorSpec}>{selectedDoctor.specialization}</Text>
//                 </View>
//               )}
              
//               <View style={styles.formGroup}>
//                 <Text style={styles.formLabel}>Duration of symptoms</Text>
//                 <TextInput
//                   style={styles.formInput}
//                   placeholder="e.g., 3 days, 1 week"
//                   value={bookingData.symptomDuration}
//                   onChangeText={(text) => setBookingData(prev => ({ ...prev, symptomDuration: text }))}
//                 />
//               </View>
              
//               <View style={styles.formGroup}>
//                 <Text style={styles.formLabel}>Symptom severity</Text>
//                 <View style={styles.severityButtonsContainer}>
//                   {['mild', 'moderate', 'severe'].map((severity) => (
//                     <TouchableOpacity
//                       key={severity}
//                       style={[
//                         styles.severityButton,
//                         bookingData.symptomSeverity === severity && styles.severityButtonActive
//                       ]}
//                       onPress={() => setBookingData(prev => ({ 
//                         ...prev, 
//                         symptomSeverity: severity as "mild" | "moderate" | "severe" 
//                       }))}
//                     >
//                       <Text style={[
//                         styles.severityButtonText,
//                         bookingData.symptomSeverity === severity && styles.severityButtonTextActive
//                       ]}>
//                         {severity.charAt(0).toUpperCase() + severity.slice(1)}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>
              
//               <View style={styles.formGroup}>
//                 <Text style={styles.formLabel}>Additional notes</Text>
//                 <TextInput
//                   style={[styles.formInput, styles.textArea]}
//                   placeholder="Any additional information about your symptoms..."
//                   value={bookingData.additionalNotes}
//                   onChangeText={(text) => setBookingData(prev => ({ ...prev, additionalNotes: text }))}
//                   multiline
//                   numberOfLines={4}
//                 />
//               </View>
              
//               <TouchableOpacity style={styles.submitButton} onPress={handleBookAppointment}>
//                 <Text style={styles.submitButtonText}>Submit Booking Request</Text>
//               </TouchableOpacity>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       {/* Bottom Sheet - keeping your existing content */}
//       <Animated.View style={[styles.bottomContainer, { top: sheetY }]}>
//         <View style={styles.handleBar} {...panResponder.panHandlers} />

//         <View style={styles.scrollableWrapper}>
//           <ScrollView 
//             style={styles.scrollableContent} 
//             contentContainerStyle={styles.scrollableContentContainer}
//             showsVerticalScrollIndicator={false} 
//             bounces={true}
//             nestedScrollEnabled={true}
//             scrollEventThrottle={16}
//           >
//             {/* Your existing service grid and content... */}
//             <View style={styles.servicesGrid}>
//               <TouchableOpacity 
//                 style={styles.serviceCard} 
//                 onPress={() => router.push('/patient/screens/AppointementsScreen')}
//                 activeOpacity={0.8}
//               >
//                 <LinearGradient
//                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
//                   style={styles.serviceCardGradient}
//                 >
//                   <View style={styles.serviceIconContainer}>
//                     <Ionicons name="calendar-outline" size={28} color="white" />
//                   </View>
//                   <Text style={styles.serviceTitle}>Appointments</Text>
//                   <Text style={styles.serviceSubtitle}>Book & manage</Text>
//                 </LinearGradient>
//               </TouchableOpacity>

//               <TouchableOpacity 
//                 style={styles.serviceCard}
//                 onPress={() =>
//                   router.push({
//                     pathname: "/patient/screens/PrescriptionScreen",
//                     params: { patientUid: patientId },
//                   })
//                 }
//                 activeOpacity={0.8}
//               >
//                 <LinearGradient
//                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
//                   style={styles.serviceCardGradient}
//                 >
//                   <View style={styles.serviceIconContainer}>
//                     <Ionicons name="document-text-outline" size={28} color="white" />
//                   </View>
//                   <Text style={styles.serviceTitle}>Prescriptions</Text>
//                   <Text style={styles.serviceSubtitle}>View & download</Text>
//                 </LinearGradient>
//               </TouchableOpacity>

//               <TouchableOpacity 
//                 style={styles.serviceCard} 
//                 onPress={() => router.push('/patient/screens/history')}
//                 activeOpacity={0.8}
//               >
//                 <LinearGradient
//                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
//                   style={styles.serviceCardGradient}
//                 >
//                   <View style={styles.serviceIconContainer}>
//                     <Ionicons name="time-outline" size={28} color="white" />
//                   </View>
//                   <Text style={styles.serviceTitle}>History</Text>
//                   <Text style={styles.serviceSubtitle}>Medical records</Text>
//                 </LinearGradient>
//               </TouchableOpacity>

//               {/* Row 2 */}
//               <TouchableOpacity 
//                 style={styles.serviceCard} 
//                 onPress={routetoSearch}
//                 activeOpacity={0.8}
//               >
//                 <LinearGradient
//                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
//                   style={styles.serviceCardGradient}
//                 >
//                   <View style={styles.serviceIconContainer}>
//                     <Ionicons name="medical-outline" size={28} color="white" />
//                   </View>
//                   <Text style={styles.serviceTitle}>Pharmacy</Text>
//                   <Text style={styles.serviceSubtitle}>Find medicines</Text>
//                 </LinearGradient>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.serviceCard}
//                 onPress={() => router.push(`/patient/screens/Family?id=${accountId}`)}
//                 activeOpacity={0.8}
//               >
//                 <LinearGradient
//                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
//                   style={styles.serviceCardGradient}
//                 >
//                   <View style={styles.serviceIconContainer}>
//                     <Ionicons name="people-outline" size={28} color="white" />
//                   </View>
//                   <Text style={styles.serviceTitle}>Family</Text>
//                   <Text style={styles.serviceSubtitle}>Manage profiles</Text>
//                 </LinearGradient>
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.serviceCard} activeOpacity={0.8}>
//                 <LinearGradient
//                   colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
//                   style={styles.serviceCardGradient}
//                 >
//                   <View style={styles.serviceIconContainer}>
//                     <Ionicons name="fitness-outline" size={28} color="white" />
//                   </View>
//                   <Text style={styles.serviceTitle}>Health Tips</Text>
//                   <Text style={styles.serviceSubtitle}>Stay healthy</Text>
//                 </LinearGradient>
//               </TouchableOpacity>
//             </View>

//             {/* Emergency SOS Button */}
//             <TouchableOpacity style={styles.emergencyButton} activeOpacity={0.8}>
//               <LinearGradient 
//                 colors={["#DC2626", "#EF4444"]} 
//                 style={styles.emergencyGradient}
//               >
//                 <View style={styles.emergencyContent}>
//                   <Ionicons name="medical" size={24} color="white" />
//                   <Text style={styles.emergencyText}>Emergency SOS</Text>
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>

//             {/* Additional Services */}
//             <View style={styles.additionalServices}>
//               <Text style={styles.sectionTitle}>More Services</Text>
//               <View style={styles.additionalGrid}>
//                 <TouchableOpacity style={styles.additionalService} activeOpacity={0.8}>
//                   <LinearGradient
//                     colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
//                     style={styles.additionalServiceGradient}
//                   >
//                     <Ionicons name="heart-outline" size={20} color="white" />
//                     <Text style={styles.additionalServiceText}>Health Monitoring</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.additionalService} activeOpacity={0.8}>
//                   <LinearGradient
//                     colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
//                     style={styles.additionalServiceGradient}
//                   >
//                     <Ionicons name="chatbubble-outline" size={20} color="white" />
//                     <Text style={styles.additionalServiceText}>Telemedicine</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.additionalService} activeOpacity={0.8}>
//                   <LinearGradient
//                     colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
//                     style={styles.additionalServiceGradient}
//                   >
//                     <Ionicons name="settings-outline" size={20} color="white" />
//                     <Text style={styles.additionalServiceText}>Settings</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             <View style={styles.bottomPadding} />
//           </ScrollView>
//         </View>
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingTop: 50,
//     paddingBottom: 20,
//   },
//   headerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   headerCenter: {
//     alignItems: "center",
//     flex: 1,
//   },
//   headerRight: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   headerButton: {
//     width: 40,
//     height: 40,
//   },
//   headerButtonGradient: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "white",
//     letterSpacing: 0.5,
//   },
//   headerSubtitle: {
//     fontSize: 12,
//     color: "rgba(255, 255, 255, 0.8)",
//     fontWeight: "500",
//     marginTop: 2,
//   },
//   languageButton: {
//     height: 40,
//   },
//   languageButtonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 20,
//     gap: 6,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   languageText: {
//     color: "white",
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   chatContainer: { 
//     position: 'absolute',
//     left: 20,
//     right: 20,
//     top: 130,
//     zIndex: 5,
//   },
//   chatList: {
//     flex: 1,
//   },
//   chatContent: { 
//     paddingVertical: 10,
//     flexGrow: 1,
//     justifyContent: 'flex-end'
//   },
//   messageContainer: { 
//     marginVertical: 4 
//   },
//   messageBubble: { 
//     padding: 16, 
//     borderRadius: 20, 
//     maxWidth: "85%",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   userMessage: { 
//     backgroundColor: "rgba(255,255,255,0.95)", 
//     alignSelf: "flex-end", 
//     borderBottomRightRadius: 6,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   aiMessage: { 
//     backgroundColor: "rgba(30, 58, 138, 0.9)", 
//     alignSelf: "flex-start", 
//     borderBottomLeftRadius: 6,
//     borderColor: "rgba(255,255,255,0.2)",
//     borderWidth: 1,
//   },
//   messageText: { 
//     fontSize: 15,
//     lineHeight: 22,
//     fontWeight: "500",
//   },
//   userMessageText: { 
//     color: "#1E3A8A" 
//   },
//   aiMessageText: { 
//     color: "white" 
//   },
  
//   // Booking prompt styles
//   bookingPromptContainer: {
//     backgroundColor: "rgba(255,255,255,0.95)",
//     borderRadius: 16,
//     padding: 16,
//     marginTop: 8,
//     alignSelf: "flex-start",
//     maxWidth: "85%",
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   bookingPromptText: {
//     fontSize: 14,
//     color: "#1E3A8A",
//     fontWeight: "600",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   bookingButtonsContainer: {
//     flexDirection: "row",
//     gap: 12,
//     justifyContent: "center",
//   },
//   bookingYesButton: {
//     backgroundColor: "#1E3A8A",
//     paddingHorizontal: 24,
//     paddingVertical: 10,
//     borderRadius: 20,
//     flex: 1,
//     alignItems: "center",
//   },
//   bookingYesButtonText: {
//     color: "white",
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   bookingNoButton: {
//     backgroundColor: "transparent",
//     borderWidth: 1,
//     borderColor: "#1E3A8A",
//     paddingHorizontal: 24,
//     paddingVertical: 10,
//     borderRadius: 20,
//     flex: 1,
//     alignItems: "center",
//   },
//   bookingNoButtonText: {
//     color: "#1E3A8A",
//     fontWeight: "600",
//     fontSize: 14,
//   },

//   // Severity prompt styles
//   severityButtonsContainer: {
//     gap: 8,
//     marginTop: 8,
//   },
//   severityButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     gap: 8,
//   },
//   severityButtonText: {
//     color: "white",
//     fontWeight: "600",
//     fontSize: 14,
//   },

//   // Duration prompt styles
//   durationButtonsContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//     marginTop: 8,
//   },
//   durationButton: {
//     backgroundColor: "#1E3A8A",
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//     borderRadius: 20,
//     minWidth: "45%",
//     alignItems: "center",
//   },
//   durationButtonText: {
//     color: "white",
//     fontWeight: "600",
//     fontSize: 13,
//     textAlign: "center",
//   },

//   // Modal styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContent: {
//     backgroundColor: "white",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "80%",
//     minHeight: "60%",
//   },
//   modalHeader: {
//     backgroundColor: "#1E3A8A",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "white",
//   },

//   // Doctors list styles
//   loadingDoctors: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 40,
//   },
//   doctorsContainer: {
//     flex: 1,
//     padding: 20,
//   },
//   doctorCard: {
//     backgroundColor: "#F8FAFC",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   doctorInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   doctorAvatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: "#1E3A8A",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   doctorDetails: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   doctorName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1E293B",
//     marginBottom: 4,
//   },
//   doctorSpecialization: {
//     fontSize: 14,
//     color: "#64748B",
//     marginBottom: 2,
//   },
//   doctorExperience: {
//     fontSize: 12,
//     color: "#94A3B8",
//     marginBottom: 4,
//   },
//   ratingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   rating: {
//     fontSize: 12,
//     color: "#64748B",
//     marginLeft: 4,
//   },
//   bookNowButton: {
//     backgroundColor: "#1E3A8A",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 6,
//   },
//   bookNowButtonText: {
//     color: "white",
//     fontWeight: "600",
//     fontSize: 14,
//   },

//   // Booking form styles
//   bookingFormContainer: {
//     flex: 1,
//     padding: 20,
//   },
//   selectedDoctorInfo: {
//     backgroundColor: "#F0F4FF",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 20,
//     alignItems: "center",
//   },
//   selectedDoctorTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1E3A8A",
//     marginBottom: 4,
//   },
//   selectedDoctorSpec: {
//     fontSize: 14,
//     color: "#64748B",
//   },
//   formGroup: {
//     marginBottom: 20,
//   },
//   formLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#1E293B",
//     marginBottom: 8,
//   },
//   formInput: {
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 14,
//     backgroundColor: "white",
//     color: "#1E293B",
//   },
//   textArea: {
//     height: 80,
//     textAlignVertical: "top",
//   },
//   severityButtonActive: {
//     backgroundColor: "#1E3A8A",
//     borderColor: "#1E3A8A",
//   },
//   severityButtonTextActive: {
//     color: "white",
//   },
//   submitButton: {
//     backgroundColor: "#1E3A8A",
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   submitButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "600",
//   },
  
//   loadingContainer: { 
//     alignItems: "center", 
//     paddingVertical: 12 
//   },
//   loadingText: { 
//     color: "rgba(255,255,255,0.8)", 
//     fontSize: 14, 
//     fontWeight: "500",
//   },
//   micButtonContainer: {
//     position: 'absolute',
//     left: width / 2 - 32,
//     zIndex: 15,
//     alignItems: 'center',
//   },
//   micButton: {
//     width: 64,
//     height: 64,
//   },
//   micButtonGradient: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 12,
//     borderWidth: 2,
//     borderColor: "rgba(255,255,255,0.3)",
//   },
//   micButtonRecording: {
//     // This style is handled by the gradient colors in the component
//   },
//   inputWrapper: { 
//     position: "absolute", 
//     left: 20, 
//     right: 20, 
//     flexDirection: "row", 
//     alignItems: "center", 
//     gap: 12, 
//     zIndex: 10 
//   },
//   textInputContainer: { 
//     flex: 1, 
//   },
//   textInputGradient: {
//     flexDirection: "row", 
//     alignItems: "center", 
//     borderRadius: 25, 
//     paddingHorizontal: 20, 
//     paddingVertical: 4,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//   },
//   textInput: { 
//     flex: 1, 
//     color: "white", 
//     fontSize: 15, 
//     paddingVertical: 12,
//     fontWeight: "500",
//   },
//   sendButton: { 
//     marginLeft: 8,
//   },
//   sendButtonGradient: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//   },
//   speakerButton: { 
//     width: 48, 
//     height: 48, 
//   },
//   speakerButtonGradient: {
//     width: 48, 
//     height: 48, 
//     borderRadius: 24, 
//     alignItems: "center", 
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//   },
//   bottomContainer: { 
//     position: "absolute", 
//     left: 0, 
//     right: 0, 
//     height: height * 0.55,
//     backgroundColor: "rgba(255,255,255,0.15)", 
//     borderTopLeftRadius: 25, 
//     borderTopRightRadius: 25, 
//     paddingTop: 25,
//     borderTopWidth: 1,
//     borderTopColor: "rgba(255,255,255,0.2)",
//   },
//   handleBar: { 
//     width: 60, 
//     height: 5, 
//     backgroundColor: "rgba(255,255,255,0.5)", 
//     borderRadius: 3, 
//     alignSelf: "center", 
//     marginBottom: 20,
//     paddingVertical: 15,
//     marginTop: -10,
//   },
//   scrollableWrapper: {
//     flex: 1,
//   },
//   scrollableContent: { 
//     flex: 1,
//   },
//   scrollableContentContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   servicesGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     marginBottom: 24,
//   },
//   serviceCard: {
//     width: (width - 60) / 3,
//     marginBottom: 16,
//   },
//   serviceCardGradient: {
//     borderRadius: 20,
//     padding: 16,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   serviceIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   serviceTitle: {
//     color: "white",
//     fontSize: 14,
//     fontWeight: "700",
//     textAlign: "center",
//     marginBottom: 4,
//   },
//   serviceSubtitle: {
//     color: "rgba(255,255,255,0.8)",
//     fontSize: 11,
//     fontWeight: "500",
//     textAlign: "center",
//   },
//   emergencyButton: {
//     marginBottom: 24,
//     borderRadius: 20,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   emergencyGradient: {
//     paddingVertical: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//   },
//   emergencyContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   emergencyText: {
//     color: "white",
//     fontSize: 18,
//     fontWeight: "700",
//     letterSpacing: 0.5,
//   },
//   additionalServices: {
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "700",
//     marginBottom: 16,
//     letterSpacing: 0.5,
//   },
//   additionalGrid: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   additionalService: {
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   additionalServiceGradient: {
//     borderRadius: 16,
//     padding: 12,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   additionalServiceText: {
//     color: "white",
//     fontSize: 12,
//     fontWeight: "600",
//     textAlign: "center",
//     marginTop: 8,
//   },
//   bottomPadding: {
//     height: 20,
//   },
// });

// Enhanced [id].tsx with appointment booking flow and patient name fetching
// Enhanced [id].tsx with appointment booking flow and patient name fetching
import React, { JSX, useState, useRef, useEffect } from "react";
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
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Alert, ActivityIndicator } from "react-native";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { updatePatientLocation } from "../utils/patientHelper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BellIcon from "../components/BellIcon";
const router = useRouter();

const { width, height } = Dimensions.get("window");

// Fixed interface with explicit boolean values
interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  showBookingPrompt: boolean;
  showSeverityPrompt: boolean;
  showDurationPrompt: boolean;
}

interface Doctor {
  _id: string;
  name: string;
  specialization?: string;
  available?: string;
  rating?: number;
  experience?: string;
}

interface BookingFormData {
  symptomDuration: string;
  symptomSeverity: "mild" | "moderate" | "severe";
  additionalNotes: string;
}

interface CollectedSymptomData {
  symptoms: string;
  severity: "mild" | "moderate" | "severe" | null;
  duration: string;
}

interface PatientProfile {
  _id: string;
  uid: string;
  name: string;
  age?: number;
  gender?: string;
  email?: string;
  phone?: string;
}

// Helper functions to create messages with all properties explicitly set
const createUserMessage = (text: string): Message => ({
  id: Date.now().toString(),
  sender: "user",
  text,
  showBookingPrompt: false,
  showSeverityPrompt: false,
  showDurationPrompt: false,
});

const createAIMessage = (text: string): Message => ({
  id: Date.now().toString() + "_ai",
  sender: "ai",
  text,
  showBookingPrompt: false,
  showSeverityPrompt: false,
  showDurationPrompt: false,
});

const createBookingPromptMessage = (): Message => ({
  id: Date.now().toString() + "_booking_prompt",
  sender: "ai",
  text: "",
  showBookingPrompt: true,
  showSeverityPrompt: false,
  showDurationPrompt: false,
});

const createSeverityPromptMessage = (): Message => ({
  id: Date.now().toString() + "_severity_prompt",
  sender: "ai",
  text: "Please select the severity of your symptoms:",
  showBookingPrompt: false,
  showSeverityPrompt: true,
  showDurationPrompt: false,
});

const createDurationPromptMessage = (): Message => ({
  id: Date.now().toString() + "_duration_prompt",
  sender: "ai",
  text: "How long have you been experiencing these symptoms?",
  showBookingPrompt: false,
  showSeverityPrompt: false,
  showDurationPrompt: true,
});

const createConfirmationMessage = (text: string): Message => ({
  id: Date.now().toString() + "_confirmation",
  sender: "ai",
  text,
  showBookingPrompt: false,
  showSeverityPrompt: false,
  showDurationPrompt: false,
});

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

  // New states for enhanced appointment booking flow
  const [showBookingPrompt, setShowBookingPrompt] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [showDoctorsList, setShowDoctorsList] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    symptomDuration: "",
    symptomSeverity: "mild",
    additionalNotes: "",
  });
  
  // New states for enhanced symptom collection
  const [collectedSymptomData, setCollectedSymptomData] = useState<CollectedSymptomData>({
    symptoms: "",
    severity: null,
    duration: "",
  });
  const [bookingStep, setBookingStep] = useState<"initial" | "severity" | "duration" | "doctors">("initial");

  // Patient profile state
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const [sheetY] = useState(new Animated.Value(height * 0.55));
  const [currentY, setCurrentY] = useState(height * 0.55);
  const [patientId, setpatientId] = useState<string | null>(null);
  const [patientUid, setpatientUid] = useState<string | null>(null);

  useEffect(() => {
    const loadPatientData = async () => {
      const id = await AsyncStorage.getItem("patientId");
      const uid = await AsyncStorage.getItem("PatientUid");
      setpatientId(id);
      setpatientUid(uid);
      
      // Fetch patient profile when uid is available
      if (uid) {
        await fetchPatientProfile(uid);
      }
    };
    loadPatientData();
  }, []);

  // Function to fetch patient profile from backend with multiple API attempts
  const fetchPatientProfile = async (uid: string) => {
    setLoadingProfile(true);
    try {
      console.log("Fetching patient profile for UID:", uid);
      
      // Try multiple potential API endpoints
      const possibleEndpoints = [
        `https://7300c4c894de.ngrok-free.app/api/patients/${uid}`,
        `https://7300c4c894de.ngrok-free.app/api/patients/profile/${uid}`,
        `https://7300c4c894de.ngrok-free.app/api/patient/${uid}`,
        `https://7300c4c894de.ngrok-free.app/api/users/${uid}`,
        `https://7300c4c894de.ngrok-free.app/api/patients/details/${uid}`
      ];
      
      let profileData = null;
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log("Trying endpoint:", endpoint);
          const response = await fetch(endpoint);
          console.log(`Response status for ${endpoint}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log("Profile data received:", data);
            profileData = data;
            break; // Exit loop if successful
          }
        } catch (endpointError) {
          console.log(`Failed to fetch from ${endpoint}:`, endpointError);
          continue; // Try next endpoint
        }
      }
      
      if (profileData) {
        // Handle different possible data structures
        let patientName = "Patient";
        let patientAge = undefined;
        let patientGender = undefined;
        
        // Try different possible field names for patient data
        if (profileData.name) {
          patientName = profileData.name;
        } else if (profileData.patientName) {
          patientName = profileData.patientName;
        } else if (profileData.firstName) {
          patientName = profileData.lastName 
            ? `${profileData.firstName} ${profileData.lastName}` 
            : profileData.firstName;
        } else if (profileData.username) {
          patientName = profileData.username;
        }
        
        // Try different age field names
        if (profileData.age) {
          patientAge = profileData.age;
        } else if (profileData.patientAge) {
          patientAge = profileData.patientAge;
        }
        
        // Try different gender field names
        if (profileData.gender) {
          patientGender = profileData.gender;
        } else if (profileData.patientGender) {
          patientGender = profileData.patientGender;
        }
        
        setPatientProfile({
          _id: profileData._id || uid,
          uid: uid,
          name: patientName,
          age: patientAge,
          gender: patientGender,
          email: profileData.email,
          phone: profileData.phone || profileData.phoneNumber,
        });
        
        console.log("Patient profile set successfully:", patientName);
      } else {
        // If no API endpoint works, try to get name from AsyncStorage
        console.log("No API endpoint worked, trying AsyncStorage...");
        const storedName = await AsyncStorage.getItem("patientName");
        const storedAge = await AsyncStorage.getItem("patientAge");
        const storedGender = await AsyncStorage.getItem("patientGender");
        
        setPatientProfile({
          _id: uid,
          uid: uid,
          name: storedName || "Patient",
          age: storedAge ? parseInt(storedAge) : undefined,
          gender: storedGender || undefined,
        });
        
        console.log("Using stored patient data:", storedName || "Patient");
      }
    } catch (error) {
      console.error("Error in fetchPatientProfile:", error);
      
      // Final fallback - try AsyncStorage
      try {
        const storedName = await AsyncStorage.getItem("patientName");
        const storedAge = await AsyncStorage.getItem("patientAge");
        const storedGender = await AsyncStorage.getItem("patientGender");
        
        setPatientProfile({
          _id: uid,
          uid: uid,
          name: storedName || "Patient",
          age: storedAge ? parseInt(storedAge) : undefined,
          gender: storedGender || undefined,
        });
        
        console.log("Using fallback stored data:", storedName || "Patient");
      } catch (storageError) {
        console.error("AsyncStorage also failed:", storageError);
        // Ultimate fallback
        setPatientProfile({
          _id: uid,
          uid: uid,
          name: "Patient",
        });
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch doctors from backend
  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      console.log("Fetching doctors from API...");
      const response = await fetch("https://7300c4c894de.ngrok-free.app/api/doctors");
      console.log("Doctors API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch doctors: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Doctors data received:", data);
      
      if (Array.isArray(data) && data.length > 0) {
        setDoctors(data);
      } else {
        console.warn("No doctors found or invalid data format");
        Alert.alert("No Doctors Available", "There are no doctors available at the moment. Please try again later.");
        setShowDoctorsList(false);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      Alert.alert("Error", "Failed to load doctors. Please check your connection and try again.");
      setShowDoctorsList(false);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Handle booking appointment with specific doctor - FIXED with patient name
  const handleBookAppointment = async (doctor?: Doctor) => {
    const doctorToBook = doctor || selectedDoctor;
    
    if (!doctorToBook) {
      Alert.alert("Error", "Please select a doctor");
      return;
    }

    // Debug patient information
    console.log("Patient ID:", patientId);
    console.log("Patient UID:", patientUid);
    console.log("Patient Profile:", patientProfile);
    console.log("Doctor to book:", doctorToBook);
    
    if (!patientUid) {
      Alert.alert("Error", "Patient information not found. Please log in again.");
      return;
    }

    if (!patientProfile) {
      Alert.alert("Error", "Patient profile not loaded. Please try again.");
      return;
    }

    // Use collected symptom data instead of booking form data
    if (!collectedSymptomData.symptoms.trim() || !collectedSymptomData.duration.trim() || !collectedSymptomData.severity) {
      Alert.alert("Error", "Missing symptom information. Please start the booking process again.");
      return;
    }

    try {
      // Use the exact same payload format as your working appointments screen with patient name
      const payload = {
        uid: patientUid, // Use UID, not patientId
        doctorId: doctorToBook._id,
        symptomDuration: collectedSymptomData.duration,
        symptomsDescription: collectedSymptomData.symptoms,
        symptomSeverity: collectedSymptomData.severity,
        // Include patient details from fetched profile
        patientName: patientProfile.name || "Patient", // Use fetched name or fallback
        patientAge: patientProfile.age?.toString() || "", // Convert to string if exists
        patientGender: patientProfile.gender || "", // Use fetched gender or empty string
      };

      console.log("Booking appointment with payload:", payload);

      const response = await fetch("https://7300c4c894de.ngrok-free.app/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        const confirmationMessage = createConfirmationMessage(
          `Appointment request sent successfully for ${patientProfile.name}. For further details, please check the Appointments section.`
        );
        
        setMessages(prev => [...prev, confirmationMessage]);
        
        // Reset states
        setShowBookingForm(false);
        setShowDoctorsList(false);
        setSelectedDoctor(null);
        setCollectedSymptomData({
          symptoms: "",
          severity: null,
          duration: "",
        });
        setBookingStep("initial");
        
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      } else {
        throw new Error(`Server responded with status ${response.status}: ${responseData.message || responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      
      let errorMessage = "Failed to book appointment. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('Network')) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes('400')) {
          errorMessage = "Invalid booking data. Please check all fields.";
        } else if (error.message.includes('404')) {
          errorMessage = "Patient profile not found. Please complete your profile first.";
        } else if (error.message.includes('500')) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert("Booking Error", errorMessage);
    }
  };

  // Handle location
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
      const touchY = evt.nativeEvent.pageY;
      const handleBarY = currentY + 15;
      return Math.abs(touchY - handleBarY) < 30;
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

  const routetoSearch = () => {
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

  // FIXED handleSubmit function
  const handleSubmit = async (text?: string) => {
    const finalInput = text || textInput;
    if (!finalInput.trim()) return;

    const userMessage = createUserMessage(finalInput);
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
      
      // Add AI response first
      const aiMessage = createAIMessage(aiReply);
      setMessages(prev => [...prev, aiMessage]);
      
      // Enable speech if available
      if (speakerEnabled && aiReply && aiReply !== "Server error") {
        Speech.speak(aiReply);
      }
      
      // Add booking prompt as a separate message after a short delay
      setTimeout(() => {
        const bookingPromptMessage = createBookingPromptMessage();
        setMessages(prev => [...prev, bookingPromptMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }, 1000);
      
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) { 
      console.error(err);
      const errorMessage = createAIMessage("I'm having trouble connecting to the server. Please try again.");
      setMessages(prev => [...prev, errorMessage]);
    }
    finally { setLoading(false); }
  };

  // FIXED handleBookingResponse function
  const handleBookingResponse = (wantsToBook: boolean) => {
    if (wantsToBook) {
      // Store the initial symptoms description from the last user message
      const lastUserMessage = messages.filter(msg => msg.sender === "user").pop();
      if (lastUserMessage) {
        setCollectedSymptomData(prev => ({
          ...prev,
          symptoms: lastUserMessage.text
        }));
      }
      
      // Start the enhanced booking flow - ask for severity first
      setBookingStep("severity");
      const severityPromptMessage = createSeverityPromptMessage();
      setMessages(prev => prev.map(msg => ({ 
        ...msg, 
        showBookingPrompt: false 
      })).concat([severityPromptMessage]));
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } else {
      // Remove booking prompts from messages
      setMessages(prev => prev.map(msg => ({ 
        ...msg, 
        showBookingPrompt: false 
      })));
      setBookingStep("initial");
    }
  };

  // FIXED handleSeverityResponse function
  const handleSeverityResponse = (severity: "mild" | "moderate" | "severe") => {
    setCollectedSymptomData(prev => ({ ...prev, severity }));
    setBookingStep("duration");
    
    // Add user's severity selection to chat
    const userSeverityMessage = createUserMessage(`Severity: ${severity.charAt(0).toUpperCase() + severity.slice(1)}`);
    
    // Ask for duration
    const durationPromptMessage = createDurationPromptMessage();
    
    setMessages(prev => prev.map(msg => ({ 
      ...msg, 
      showSeverityPrompt: false 
    })).concat([userSeverityMessage, durationPromptMessage]));
    
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // FIXED handleDurationResponse function
  const handleDurationResponse = (duration: string) => {
    setCollectedSymptomData(prev => ({ ...prev, duration }));
    setBookingStep("doctors");
    
    // Add user's duration to chat
    const userDurationMessage = createUserMessage(`Duration: ${duration}`);
    
    // Show processing message
    const processingMessage = createAIMessage("Perfect! Let me find available doctors for you...");
    
    setMessages(prev => prev.map(msg => ({ 
      ...msg, 
      showDurationPrompt: false 
    })).concat([userDurationMessage, processingMessage]));
    
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    
    // Fetch doctors and show the list
    fetchDoctors();
    setTimeout(() => {
      setShowDoctorsList(true);
    }, 1000);
  };

  const toggleSpeaker = () => {
    setSpeakerEnabled(!speakerEnabled);
    if (!speakerEnabled) Speech.stop();
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      {/* Only show message bubble if there's text */}
      {item.text && (
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
      )}
      
      {/* Initial Booking Prompt */}
      {item.showBookingPrompt && (
        <View style={styles.bookingPromptContainer}>
          <Text style={styles.bookingPromptText}>Do you want to book an appointment with a doctor?</Text>
          <View style={styles.bookingButtonsContainer}>
            <TouchableOpacity 
              style={styles.bookingYesButton} 
              onPress={() => handleBookingResponse(true)}
            >
              <Text style={styles.bookingYesButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.bookingNoButton} 
              onPress={() => handleBookingResponse(false)}
            >
              <Text style={styles.bookingNoButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Severity Prompt */}
      {item.showSeverityPrompt && (
        <View style={styles.bookingPromptContainer}>
          <View style={styles.severityButtonsContainer}>
            <TouchableOpacity 
              style={[styles.severityButton, { backgroundColor: "#22C55E" }]} 
              onPress={() => handleSeverityResponse("mild")}
            >
              <Ionicons name="happy-outline" size={20} color="white" />
              <Text style={styles.severityButtonText}>Mild</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.severityButton, { backgroundColor: "#F59E0B" }]} 
              onPress={() => handleSeverityResponse("moderate")}
            >
              <Ionicons name="alert-circle-outline" size={20} color="white" />
              <Text style={styles.severityButtonText}>Moderate</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.severityButton, { backgroundColor: "#EF4444" }]} 
              onPress={() => handleSeverityResponse("severe")}
            >
              <Ionicons name="warning-outline" size={20} color="white" />
              <Text style={styles.severityButtonText}>Severe</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Duration Prompt */}
      {item.showDurationPrompt && (
        <View style={styles.bookingPromptContainer}>
          <View style={styles.durationButtonsContainer}>
            <TouchableOpacity 
              style={styles.durationButton} 
              onPress={() => handleDurationResponse("Less than a day")}
            >
              <Text style={styles.durationButtonText}>Less than a day</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.durationButton} 
              onPress={() => handleDurationResponse("2-3 days")}
            >
              <Text style={styles.durationButtonText}>2-3 days</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.durationButton} 
              onPress={() => handleDurationResponse("1 week")}
            >
              <Text style={styles.durationButtonText}>1 week</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.durationButton} 
              onPress={() => handleDurationResponse("2-4 weeks")}
            >
              <Text style={styles.durationButtonText}>2-4 weeks</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.durationButton} 
              onPress={() => handleDurationResponse("1-3 months")}
            >
              <Text style={styles.durationButtonText}>1-3 months</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.durationButton} 
              onPress={() => handleDurationResponse("More than 3 months")}
            >
              <Text style={styles.durationButtonText}>More than 3 months</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
          <Text style={styles.headerSubtitle}>
            {loadingProfile ? "Loading..." : patientProfile?.name ? `Welcome, ${patientProfile.name}` : "Your Health Assistant"}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.languageButton} activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
              style={styles.languageButtonGradient}
            >
              <Text style={styles.languageText}>EN</Text>
              <Ionicons name="language" size={14} color="white" />
            </LinearGradient>
          </TouchableOpacity>
         
              <BellIcon patientId={patientId} />
          
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

      {/* Doctors List Modal */}
      <Modal
        visible={showDoctorsList}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDoctorsList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Doctors</Text>
              <TouchableOpacity onPress={() => setShowDoctorsList(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            {loadingDoctors ? (
              <View style={styles.loadingDoctors}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text>Loading doctors...</Text>
              </View>
            ) : (
              <ScrollView style={styles.doctorsContainer}>
                {doctors.map((doctor) => (
                  <View key={doctor._id} style={styles.doctorCard}>
                    <View style={styles.doctorInfo}>
                      <View style={styles.doctorAvatar}>
                        <Ionicons name="person" size={24} color="white" />
                      </View>
                      <View style={styles.doctorDetails}>
                        <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
                        <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
                        {doctor.experience && (
                          <Text style={styles.doctorExperience}>{doctor.experience} years experience</Text>
                        )}
                        {doctor.rating && (
                          <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color="#FCD34D" />
                            <Text style={styles.rating}>{doctor.rating}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.bookNowButton}
                      onPress={() => {
                        // Pass the doctor directly to avoid state timing issues
                        setShowDoctorsList(false);
                        
                        // Show confirmation with pre-filled data and pass the doctor directly
                        Alert.alert(
                          "Confirm Appointment",
                          `Book appointment with Dr. ${doctor.name}?\n\nPatient: ${patientProfile?.name || 'Patient'}\nSymptoms: ${collectedSymptomData.symptoms}\nSeverity: ${collectedSymptomData.severity}\nDuration: ${collectedSymptomData.duration}`,
                          [
                            { text: "Cancel", style: "cancel" },
                            { 
                              text: "Book Now", 
                              onPress: () => handleBookAppointment(doctor) // Pass doctor directly
                            }
                          ]
                        );
                      }}
                    >
                      <Text style={styles.bookNowButtonText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Booking Form Modal */}
      <Modal
        visible={showBookingForm}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBookingForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Appointment</Text>
              <TouchableOpacity onPress={() => setShowBookingForm(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.bookingFormContainer}>
              {selectedDoctor && (
                <View style={styles.selectedDoctorInfo}>
                  <Text style={styles.selectedDoctorTitle}>Dr. {selectedDoctor.name}</Text>
                  <Text style={styles.selectedDoctorSpec}>{selectedDoctor.specialization}</Text>
                </View>
              )}
              
              {patientProfile && (
                <View style={styles.patientInfo}>
                  <Text style={styles.patientInfoTitle}>Patient Information</Text>
                  <Text style={styles.patientInfoText}>Name: {patientProfile.name}</Text>
                  {patientProfile.age && (
                    <Text style={styles.patientInfoText}>Age: {patientProfile.age}</Text>
                  )}
                  {patientProfile.gender && (
                    <Text style={styles.patientInfoText}>Gender: {patientProfile.gender}</Text>
                  )}
                </View>
              )}
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Duration of symptoms</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., 3 days, 1 week"
                  value={bookingData.symptomDuration}
                  onChangeText={(text) => setBookingData(prev => ({ ...prev, symptomDuration: text }))}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Symptom severity</Text>
                <View style={styles.severityButtonsContainer}>
                  {['mild', 'moderate', 'severe'].map((severity) => (
                    <TouchableOpacity
                      key={severity}
                      style={[
                        styles.severityButton,
                        bookingData.symptomSeverity === severity && styles.severityButtonActive
                      ]}
                      onPress={() => setBookingData(prev => ({ 
                        ...prev, 
                        symptomSeverity: severity as "mild" | "moderate" | "severe" 
                      }))}
                    >
                      <Text style={[
                        styles.severityButtonText,
                        bookingData.symptomSeverity === severity && styles.severityButtonTextActive
                      ]}>
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Additional notes</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Any additional information about your symptoms..."
                  value={bookingData.additionalNotes}
                  onChangeText={(text) => setBookingData(prev => ({ ...prev, additionalNotes: text }))}
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <TouchableOpacity style={styles.submitButton} onPress={() => handleBookAppointment()}>
                <Text style={styles.submitButtonText}>Submit Booking Request</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Sheet - keeping your existing content */}
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
            {/* Your existing service grid and content... */}
            <View style={styles.servicesGrid}>
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
  
  // Booking prompt styles
  bookingPromptContainer: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    alignSelf: "flex-start",
    maxWidth: "85%",
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  bookingPromptText: {
    fontSize: 14,
    color: "#1E3A8A",
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  bookingButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  bookingYesButton: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: "center",
  },
  bookingYesButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  bookingNoButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#1E3A8A",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: "center",
  },
  bookingNoButtonText: {
    color: "#1E3A8A",
    fontWeight: "600",
    fontSize: 14,
  },

  // Severity prompt styles
  severityButtonsContainer: {
    gap: 8,
    marginTop: 8,
  },
  severityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  severityButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  // Duration prompt styles
  durationButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  durationButton: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    minWidth: "45%",
    alignItems: "center",
  },
  durationButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    minHeight: "60%",
  },
  modalHeader: {
    backgroundColor: "#1E3A8A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },

  // Doctors list styles
  loadingDoctors: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  doctorsContainer: {
    flex: 1,
    padding: 20,
  },
  doctorCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
  },
  doctorDetails: {
    marginLeft: 12,
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  doctorExperience: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 4,
  },
  bookNowButton: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  bookNowButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  // Booking form styles
  bookingFormContainer: {
    flex: 1,
    padding: 20,
  },
  selectedDoctorInfo: {
    backgroundColor: "#F0F4FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  selectedDoctorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 4,
  },
  selectedDoctorSpec: {
    fontSize: 14,
    color: "#64748B",
  },
  patientInfo: {
    backgroundColor: "#F8FDF8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  patientInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 8,
  },
  patientInfoText: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "white",
    color: "#1E293B",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  severityButtonActive: {
    backgroundColor: "#1E3A8A",
    borderColor: "#1E3A8A",
  },
  severityButtonTextActive: {
    color: "white",
  },
  submitButton: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
    paddingVertical: 15,
    marginTop: -10,
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