import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
    const navigation = useNavigation();
    const isMounted = useRef(true);
    const { theme } = useTheme();
    const styles = getStyles(theme);

    // Travel Evolution Animation State
    const [travelState, setTravelState] = React.useState(0);
    const moveAnim = useRef(new Animated.Value(0)).current;
    const fadeIconAnim = useRef(new Animated.Value(1)).current;

    // Introduction Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    const modes = [
        { icon: 'walk', color: theme.success, size: 28, label: 'Start' },
        { icon: 'bike', color: theme.warning, size: 32, label: 'Explore' },
        { icon: 'car-side', color: theme.info, size: 36, label: 'Drive' },
        { icon: 'train-variant', color: theme.secondary, size: 36, label: 'Journey' },
        { icon: 'airplane-takeoff', color: theme.error, size: 40, label: 'Fly' },
    ];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        ]).start();

        runEvolutionStep(0);

        const timer = setTimeout(() => {
            if (isMounted.current) {
                navigation.replace('TripList');
            }
        }, 6500);

        return () => {
            isMounted.current = false;
            clearTimeout(timer);
        };
    }, []);

    const runEvolutionStep = (step) => {
        if (!isMounted.current || step >= modes.length) return;

        setTravelState(step);
        fadeIconAnim.setValue(0);

        // 1. Fade In Icon
        Animated.timing(fadeIconAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
        }).start();

        // 2. Move Forward
        const segmentWidth = (width - 60) / modes.length;
        const startX = (segmentWidth * step) - (width / 2) + 30;
        const endX = (segmentWidth * (step + 1)) - (width / 2) + 30;

        if (step === 4) {
            Animated.parallel([
                Animated.timing(moveAnim, {
                    toValue: width / 2 + 80,
                    duration: 1200,
                    easing: Easing.in(Easing.exp),
                    useNativeDriver: true
                }),
            ]).start();
        } else {
            Animated.timing(moveAnim, {
                toValue: endX,
                duration: 700,
                easing: Easing.linear,
                useNativeDriver: true
            }).start(() => {
                if (!isMounted.current) return;
                Animated.timing(fadeIconAnim, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true
                }).start(() => {
                    if (isMounted.current) runEvolutionStep(step + 1);
                });
            });
        }
    };

    const translateY = moveAnim.interpolate({
        inputRange: [(width / 2) - 100, width / 2 + 50],
        outputRange: [0, -250],
        extrapolate: 'clamp'
    });

    const currentMode = modes[travelState] || modes[4];

    return (
        <ScreenWrapper contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 0 }}>
            {/* Top Graphics */}
            <View style={styles.topGraphics}>
                <Svg width={width} height={height * 0.45} viewBox={`0 0 ${width} ${height * 0.45}`} style={styles.svg}>
                    <Defs>
                        <SvgLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={theme.primary} stopOpacity="0.1" />
                            <Stop offset="1" stopColor="transparent" stopOpacity="0" />
                        </SvgLinearGradient>
                    </Defs>
                    <Path
                        d={`M0 0 L${width} 0 L${width} 150 Q${width / 2} 280 0 150 Z`}
                        fill={theme.gradientStart}
                        opacity="0.5"
                    />
                    <Path
                        d={`M${width} 0 L${width} 120 Q${width / 2} 240 0 90 L0 0 Z`}
                        fill={theme.primary}
                        opacity="0.08"
                    />
                </Svg>
            </View>

            <View style={styles.contentContainer}>
                {/* Logo */}
                <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="location" size={48} color={theme.white} />
                    </View>
                    <View style={styles.headphoneIcon}>
                        <Ionicons name="headset" size={24} color={theme.primary} />
                    </View>
                </Animated.View>

                {/* Text */}
                <Animated.View style={[styles.textContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.welcomeText}>Welcome to</Text>
                    <Text style={styles.brandName}>TravelLedger</Text>
                    <Text style={styles.tagline}>From Steps to Flights</Text>
                </Animated.View>

                {/* Evolution Animation */}
                <View style={styles.evolutionContainer}>
                    <View style={styles.pathLine} />

                    <Animated.View style={{
                        transform: [
                            { translateX: moveAnim },
                            { translateY: travelState === 4 ? translateY : 0 },
                            { scale: fadeIconAnim }
                        ],
                        opacity: fadeIconAnim,
                        alignItems: 'center'
                    }}>
                        {/* Bubble Container for Icon */}
                        <View style={styles.iconBubble}>
                            <MaterialCommunityIcons
                                name={currentMode.icon}
                                size={currentMode.size}
                                color={currentMode.color}
                            />
                        </View>
                        <Text style={styles.modeLabel}>{currentMode.label}</Text>
                    </Animated.View>
                </View>

                {/* Status Text */}
                <Animated.View style={{ opacity: fadeAnim, marginTop: 40 }}>
                    <Text style={{ fontFamily: 'Outfit-Medium', color: theme.primary, fontSize: 16 }}>
                        {travelState === 4 ? "Taking off..." : "Planning journey..."}
                    </Text>
                </Animated.View>
            </View>
        </ScreenWrapper>
    );
};

const getStyles = (theme) => StyleSheet.create({
    topGraphics: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    svg: {
        width: width,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    headphoneIcon: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: theme.white,
        borderRadius: 20,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    welcomeText: {
        fontSize: 20,
        color: theme.textSecondary,
        marginBottom: 5,
        fontFamily: 'Outfit-Regular',
        letterSpacing: 1,
    },
    brandName: {
        fontSize: 36,
        fontFamily: 'Outfit-Bold',
        color: theme.text,
        marginBottom: 5,
    },
    tagline: {
        fontSize: 16,
        color: theme.textSecondary,
        fontFamily: 'Outfit-Medium',
    },
    evolutionContainer: {
        width: '100%',
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    pathLine: {
        position: 'absolute',
        width: '80%',
        height: 4,
        backgroundColor: theme.border,
        borderRadius: 2,
        top: '50%',
        marginTop: -2,
    },
    iconBubble: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.shadowConfig?.shadowColor || '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.border,
    },
    modeLabel: {
        fontSize: 12,
        color: theme.textSecondary,
        fontFamily: 'Outfit-Bold',
        backgroundColor: theme.surfaceHighlight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        overflow: 'hidden',
    }
});

export default HomeScreen;
