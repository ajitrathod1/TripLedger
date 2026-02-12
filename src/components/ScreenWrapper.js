import React from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

const ScreenWrapper = ({ children, style, contentContainerStyle }) => {
    const { theme } = useTheme();
    return (
        <LinearGradient
            colors={[theme.gradientStart, theme.gradientEnd]}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }} // Vertical subtle gradient
        >
            <StatusBar barStyle={theme.statusBar} translucent backgroundColor="transparent" />

            {/* Optional light pattern could go here, but keeping it clean for now */}

            <SafeAreaView style={[styles.safeArea, style]}>
                <View style={[styles.content, contentContainerStyle]}>
                    {children}
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
});

export default ScreenWrapper;
