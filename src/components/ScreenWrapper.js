import React from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';

const ScreenWrapper = ({ children, style }) => {
    return (
        <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <SafeAreaView style={[styles.safeArea, style]}>
                <View style={styles.content}>
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
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    }
});

export default ScreenWrapper;
