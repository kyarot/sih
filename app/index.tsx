import React, { useState, useEffect, useRef } from "react";
import { Stack } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import  { useTranslation } from "../components/TranslateProvider"; // ✅ integrated
import TranslateButton from "@/components/TranslateButton";
const { width, height } = Dimensions.get("window");

// Enhanced Typing Animation Component
const TypingText = ({ text, style, delay = 0 }: { text: string; style: any; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const cursorAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Cursor blinking animation
    const blink = () => {
      Animated.sequence([
        Animated.timing(cursorAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => blink());
    };
    blink();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      } else {
        setShowCursor(false);
      }
    }, delay + currentIndex * 30);

    return () => clearTimeout(timer);
  }, [currentIndex, text, delay]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
      <Text style={style}>{displayedText}</Text>
      {showCursor && (
        <Animated.Text style={[style, { opacity: cursorAnimation, marginLeft: 2 }]}>|</Animated.Text>
      )}
    </View>
  );
};

// Floating particles animation
const FloatingParticle = ({ delay = 0 }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(Math.random() * width)).current;

  useEffect(() => {
    const animate = () => {
      Animated.parallel([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 8000 + Math.random() * 4000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: Math.random() * width,
          duration: 6000 + Math.random() * 4000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        animValue.setValue(0);
        translateX.setValue(Math.random() * width);
        animate();
      });
    };

    setTimeout(animate, delay);
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [height + 50, -50],
              }),
            },
            { translateX },
            {
              scale: animValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 0],
              }),
            },
          ],
          opacity: animValue.interpolate({
            inputRange: [0, 0.2, 0.8, 1],
            outputRange: [0, 1, 1, 0],
          }),
        },
      ]}
    />
  );
};

// Pulsing logo component
const PulsingLogo = ({ scale }: { scale: Animated.Value }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = () => {
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
      ]).start(() => pulse());
    };

    const rotate = () => {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      }).start(() => rotate());
    };

    pulse();
    rotate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.logoContainer,
        {
          transform: [
            { scale: Animated.multiply(scale, pulseAnim) },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "360deg"],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.1)"]}
        style={styles.logoCircle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.logoInner}>
          <FontAwesome name="user-md" size={32} color="#FFFFFF" />
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Enhanced Feature Card
const FeatureCard = ({
  iconLibrary,
  iconName,
  title,
  delay = 0,
}: {
  iconLibrary: "MaterialIcons" | "Ionicons" | "FontAwesome";
  iconName: string;
  title: string;
  delay?: number;
}) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(animValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, []);

  const renderIcon = () => {
    const iconProps = { size: 24, color: "#FFFFFF" };
    switch (iconLibrary) {
      case "MaterialIcons":
        return <MaterialIcons name={iconName as any} {...iconProps} />;
      case "Ionicons":
        return <Ionicons name={iconName as any} {...iconProps} />;
      case "FontAwesome":
        return <FontAwesome name={iconName as any} {...iconProps} />;
      default:
        return <MaterialIcons name="help" {...iconProps} />;
    }
  };

  return (
    <TouchableOpacity
      style={styles.featureCard}
      activeOpacity={0.8}
      onPress={() => {
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }}
    >
      <Animated.View
        style={[
          {
            transform: [
              { scale: scaleValue },
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
            opacity: animValue,
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.05)"]}
          style={styles.featureIconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {renderIcon()}
        </LinearGradient>
        <Text style={styles.featureText}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Animated Button Component
const AnimatedButton = ({
  title,
  subtitle,
  onPress,
  isPrimary = true,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  isPrimary?: boolean;
  delay?: number;
}) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.9)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(animValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Shimmer effect for primary button
      if (isPrimary) {
        const shimmer = () => {
          shimmerAnim.setValue(0);
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }).start(() => {
            setTimeout(shimmer, 3000);
          });
        };
        setTimeout(shimmer, 2000);
      }
    }, delay);
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[styles.animatedButtonContainer, styles.shadowEffect]}
    >
      <Animated.View
        style={[
          {
            transform: [
              { scale: scaleValue },
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
            opacity: animValue,
          },
        ]}
      >
        {isPrimary ? (
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFC", "#FFFFFF"]}
            style={styles.primaryButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View
              style={[
                styles.shimmerOverlay,
                {
                  transform: [
                    {
                      translateX: shimmerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-width, width],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Text style={styles.primaryButtonText}>{title}</Text>
            <Text style={styles.primaryButtonSubtext}>{subtitle}</Text>
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.05)"]}
            style={styles.secondaryButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.secondaryButtonText}>{title}</Text>
            <Text style={styles.secondaryButtonSubtext}>{subtitle}</Text>
          </LinearGradient>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation(); // ✅ hook

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Start animations with staggered timing
    Animated.sequence([
      // Logo animation
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      // Fade in and slide up for main content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={["#1E40AF", "#3B82F6", "#60A5FA", "#93C5FD"]}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Floating Particles Background */}
      {Array.from({ length: 15 }, (_, i) => (
        <FloatingParticle key={i} delay={i * 500} />
      ))}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Stack.Screen options={{ headerShown: false }} />

          {/* Top-right translate button */}
          <View style={styles.topRight}>
            <TranslateButton />
          </View>

          {/* Header Section */}
          <View style={styles.headerSection}>
            <PulsingLogo scale={logoScaleAnim} />

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <TypingText text={t("MediConnect")} style={styles.title} delay={800} />
              <View style={styles.subtitleContainer}>
                <Animated.View
                  style={[
                    styles.subtitleLine,
                    {
                      scaleX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ]}
                />
                <Text style={styles.subtitle}>{t("Your Health, Our Priority")}</Text>
                <Animated.View
                  style={[
                    styles.subtitleLine,
                    {
                      scaleX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.description}>
                {t("Connect with healthcare professionals from the comfort of your home")}
              </Text>
            </Animated.View>
          </View>

          {/* Action Buttons Section */}
          <View style={styles.actionsSection}>
            <AnimatedButton
              title={t("Get Started")}
              subtitle={t("Login or Create Account")}
              onPress={() => router.push("/auth")}
              isPrimary={true}
              delay={1200}
            />

            <AnimatedButton
              title={t("Quick Access")}
              subtitle={t("For existing patients")}
              onPress={() => router.push("/auth")}
              isPrimary={false}
              delay={1400}
            />
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <FeatureCard
              iconLibrary="Ionicons"
              iconName="videocam"
              title={t("Video Consultations")}
              delay={1600}
            />
            <FeatureCard
              iconLibrary="Ionicons"
              iconName="flash"
              title={t("Instant Appointments")}
              delay={1800}
            />
            <FeatureCard
              iconLibrary="Ionicons"
              iconName="shield-checkmark"
              title={t("Secure & Private")}
              delay={2000}
            />
          </View>

          {/* Additional Info Section */}
          <Animated.View
            style={[
              styles.infoSection,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel}>{t("Available")}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>500+</Text>
                <Text style={styles.statLabel}>{t("Doctors")}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>100k+</Text>
                <Text style={styles.statLabel}>{t("Patients")}</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({

  gradientContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: height,
  },
  topRight: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 60,
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 1,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  subtitleLine: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    flex: 1,
    marginHorizontal: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: "400",
  },
  actionsSection: {
    paddingHorizontal: 8,
    gap: 20,
    marginBottom: 40,
  },
  animatedButtonContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  primaryButtonGradient: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  secondaryButtonGradient: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 100,
    transform: [{ skewX: "-45deg" }],
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E40AF",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  primaryButtonSubtext: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  secondaryButtonSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  shadowEffect: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  featuresSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    marginBottom: 40,
  },
  featureCard: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  featureText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 2,
  },
  infoSection: {
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 16,
  },
});