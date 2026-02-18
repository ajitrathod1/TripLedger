import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const GlassView = ({ children, style, intensity = 50, ...props }) => {
    const { theme } = useTheme();
    const isDark = theme.type === 'dark';

    // Extract borderRadius from style if possible to apply to inner layers, 
    // though overflow: hidden on container usually handles it.
    const flatStyle = StyleSheet.flatten(style) || {};
    const borderRadius = flatStyle.borderRadius || 24;

    // We override backgroundColor to be transparent so the blur shows through
    const containerStyle = [
        styles.container,
        style,
        { backgroundColor: 'transparent', overflow: 'hidden' },
        // Add a subtle border if not present in style
        !flatStyle.borderWidth && { borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)' }
    ];

    return (
        <View style={containerStyle} {...props}>
            {/* 1. Blur Layer */}
            <BlurView
                intensity={intensity}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
                experimentalBlurMethod='dimezisBlurView' // Try enabling this for better Android support if available in this version, or standard
            />

            {/* 2. Gradient Overlay for the "Sheen" */}
            <LinearGradient
                colors={isDark ?
                    ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] :
                    ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.4)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* 3. Content */}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // Default shadow for that "floating" glass look
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    }
});

export default GlassView;
