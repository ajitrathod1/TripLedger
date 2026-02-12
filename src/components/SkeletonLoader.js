import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SkeletonLoader = ({ width = '100%', height = 20, style }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;
    const { theme } = useTheme();

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                { width, height, opacity, backgroundColor: theme.surfaceHighlight || theme.border },
                style
            ]}
        />
    );
};

const styles = StyleSheet.create({
    skeleton: {
        borderRadius: 8,
    },
});

export default SkeletonLoader;
