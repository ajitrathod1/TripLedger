import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';

const ThemedBackground = ({ children, style }) => {
    const { theme, themeType } = useTheme();

    return (
        <View style={[styles.container, style]}>
            <StatusBar style={theme.statusBarStyle} translucent backgroundColor="transparent" />
            <LinearGradient
                colors={[theme.gradientStart, theme.gradientEnd, theme.background]}
                style={StyleSheet.absoluteFill}
            />
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ThemedBackground;
