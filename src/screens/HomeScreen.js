import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedBackground from '../components/ThemedBackground';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

const cardsData = [
    { id: '1', title: "Visual Insights", subtitle: "Chart your journey", icon: "pie-chart", color: "#A78BFA", bg: "rgba(167, 139, 250, 0.2)" },
    { id: '2', title: "Live Travel Cost", subtitle: "Real-time tracking", icon: "speedometer", color: "#34D399", bg: "rgba(52, 211, 153, 0.2)" },
    { id: '3', title: "Split & Share", subtitle: "Divide bills instantly", icon: "people", color: "#FBBF24", bg: "rgba(251, 191, 36, 0.2)" },
    { id: '4', title: "Smart Budgeting", subtitle: "Plan like a pro", icon: "wallet", color: "#60A5FA", bg: "rgba(96, 165, 250, 0.2)" },
];

const FeatureCard = ({ item, index, activeIndex, total, isVisible }) => {
    // Determine position in stack
    let position = (index - activeIndex + total) % total;

    // Standard Stack Animations (Spring)
    const anim = useRef(new Animated.Value(position)).current;

    // Side Entry Animation (Independent)
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Initial Load Animation
    const loadAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Initial Staggered Rise
        Animated.timing(loadAnim, {
            toValue: 1,
            duration: 600,
            delay: index * 150,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
        }).start();
    }, []);

    // Trigger Slide In when becoming active
    useEffect(() => {
        if (index === activeIndex) {
            // Start from side (Left or Right)
            const startPos = index % 2 === 0 ? -width * 0.8 : width * 0.8;
            slideAnim.setValue(startPos);

            // Animate to Center (Snappy & Smooth)
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 7,  // Lower friction = bouncier/faster feel
                tension: 60,  // Higher tension = faster
                useNativeDriver: true,
            }).start();
        } else {
            // Return to center if somehow displaced
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 7,
                tension: 60,
                useNativeDriver: true
            }).start();
        }
    }, [activeIndex]);

    useEffect(() => {
        // Stack shuffle animation (Moving back/forward in Z space)
        Animated.spring(anim, {
            toValue: position,
            friction: 8,
            tension: 50,
            useNativeDriver: true,
        }).start();
    }, [activeIndex]);

    // Stack Transforms
    const scale = anim.interpolate({
        inputRange: [0, 1, 2, 3],
        outputRange: [1, 0.9, 0.82, 0.74],
    });

    const translateY = anim.interpolate({
        inputRange: [0, 1, 2, 3],
        outputRange: [0, 25, 45, 60],
    });

    const rotate = anim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['0deg', index % 2 === 0 ? '2deg' : '-2deg', index % 2 === 0 ? '-1deg' : '1deg']
    });

    // Opacity
    const opacity = anim.interpolate({
        inputRange: [0, 1, 2, 3],
        outputRange: [1, 0.7, 0.4, 0],
    });

    const zIndex = total - position;

    if (!isVisible) return null;

    return (
        <Animated.View
            style={[
                styles.cardContainer,
                {
                    zIndex,
                    opacity, // Stack opacity
                    transform: [
                        { translateY },
                        { translateX: slideAnim }, // Side Entry
                        { scale },
                        { rotate },
                        { scale: loadAnim }
                    ]
                }
            ]}
        >
            <View style={styles.glassCard}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']}
                    style={StyleSheet.absoluteFill}
                />

                {/* Large Centered Icon as Symbol */}
                <View style={[styles.iconRing, { borderColor: item.color, backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={56} color={item.color} />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>

                {/* Decorative glow bar */}
                <View style={[styles.glowBar, { backgroundColor: item.color }]} />
            </View>
        </Animated.View>
    );
};

const HomeScreen = () => {
    const navigation = useNavigation();
    const [activeIndex, setActiveIndex] = useState(0);
    const [maxVisible, setMaxVisible] = useState(0);
    const btnAnim = useRef(new Animated.Value(0)).current;

    // Sound Effect Integration
    async function playSound() {
        try {
            // Must have 'assets/sounds/swoosh.mp3'
            const { sound } = await Audio.Sound.createAsync(
                require('../../assets/sounds/swoosh.mp3'),
                { shouldPlay: true }
            );

            // Unload after playing to prevent memory leaks
            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.didJustFinish) {
                    await sound.unloadAsync();
                }
            });
        } catch (e) {
            // Sound file missing - silent fail
            // console.log("Sound Error (Make sure assets/sounds/swoosh.mp3 exists):", e);
        }
    }

    useEffect(() => {
        // Initial Sound
        playSound();

        // Faster Interval for "Fast" feel
        const interval = setInterval(() => {
            setActiveIndex((prev) => {
                const next = (prev + 1) % cardsData.length;
                setMaxVisible(m => Math.max(m, next));
                return next;
            });
            // PLAY SOUND ON EVERY SHUFFLE
            playSound();
        }, 2000);

        // CTA Fade In
        Animated.timing(btnAnim, { toValue: 1, duration: 800, delay: 1500, useNativeDriver: true }).start();

        return () => clearInterval(interval);
    }, []);

    return (
        <ThemedBackground>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome to</Text>
                    <Text style={styles.brand}>TripLedger</Text>
                </View>

                {/* Cards Deck */}
                <View style={styles.deckWrapper}>
                    {cardsData.map((item, index) => (
                        <FeatureCard
                            key={item.id}
                            item={item}
                            index={index}
                            activeIndex={activeIndex}
                            total={cardsData.length}
                            isVisible={index <= maxVisible || maxVisible >= cardsData.length - 1}
                        />
                    ))}
                </View>

                {/* CTA */}
                <Animated.View style={[styles.bottomBar, { opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>
                    <TouchableOpacity onPress={() => navigation.replace('TripList')} activeOpacity={0.8}>
                        <View style={styles.glassBtn}>
                            <LinearGradient
                                colors={['rgba(56, 189, 248, 0.2)', 'rgba(56, 189, 248, 0.05)']}
                                style={StyleSheet.absoluteFill}
                            />
                            <Text style={styles.btnText}>Start My Journey</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </ThemedBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 60,
    },
    header: {
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        color: '#94A3B8',
        fontFamily: 'Outfit-Regular',
        marginBottom: 5,
    },
    brand: {
        fontSize: 32,
        color: '#F8FAFC',
        fontFamily: 'Outfit-Bold',
        letterSpacing: 1,
        textShadowColor: 'rgba(56, 189, 248, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    deckWrapper: {
        width: width,
        height: CARD_HEIGHT + 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContainer: {
        position: 'absolute',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        alignItems: 'center',
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 8,
    },
    glassCard: {
        flex: 1,
        width: '100%',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        padding: 24,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.85)',
    },
    iconRing: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        marginTop: 20,
    },
    textContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    cardTitle: {
        fontSize: 24,
        fontFamily: 'Outfit-Bold',
        color: '#F1F5F9', // White-ish
        textAlign: 'center',
        marginBottom: 8,
    },
    cardSubtitle: {
        fontSize: 14,
        fontFamily: 'Outfit-Regular',
        color: '#94A3B8', // Gray
        textAlign: 'center',
    },
    glowBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
    },
    bottomBar: {
        width: '100%',
        alignItems: 'center',
    },
    glassBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Outfit-Bold',
        marginRight: 10,
    },
    orb: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    }
});

export default HomeScreen;
