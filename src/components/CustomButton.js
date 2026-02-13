import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated, Vibration, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Reusable Button Component with loading state, haptics, and scale animation
 */
const CustomButton = ({ title, onPress, loading = false, disabled = false, style, textStyle }) => {
    const { theme } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
        // Light vibration feedback
        if (Platform.OS === 'android') {
            Vibration.vibrate(10);
        }
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.button,
                    {
                        backgroundColor: theme.primary,
                        shadowColor: theme.shadowConfig?.shadowColor || '#000'
                    },
                    style,
                    (disabled || loading) && { opacity: 0.6 }
                ]}
                disabled={loading || disabled}
            >
                {loading ? (
                    <ActivityIndicator color={theme.white} />
                ) : (
                    <Text style={[styles.text, { color: theme.white }, textStyle]}>{title}</Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginTop: 20
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Outfit-Bold',
    }
});

export default CustomButton;
