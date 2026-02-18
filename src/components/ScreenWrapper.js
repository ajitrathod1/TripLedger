import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const ScreenWrapper = ({ children, style, contentContainerStyle }) => {
    const { theme } = useTheme();
    return (
        <LinearGradient
            colors={[theme.gradientStart, theme.gradientEnd]}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }} // Vertical subtle gradient
        >
            <StatusBar
                barStyle={theme.type === 'dark' ? 'light-content' : 'dark-content'}
                translucent
                backgroundColor="transparent"
            />

            <SafeAreaView style={[styles.safeArea, style]} edges={['top', 'left', 'right']}>
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
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
});

export default ScreenWrapper;
