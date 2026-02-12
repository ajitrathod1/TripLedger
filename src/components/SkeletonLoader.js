import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';

const SkeletonLoader = ({ width = '100%', height = 20, style }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

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
                { width, height, opacity },
                style
            ]}
        />
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#E0E0E0',
        borderRadius: 8,
    },
});

export default SkeletonLoader;
