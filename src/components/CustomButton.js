import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';

const CustomButton = ({ title, onPress, loading = false, style, textStyle }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[styles.button, style]}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color={colors.white} />
            ) : (
                <Text style={[styles.text, textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        ...colors.shadowConfig,
        marginTop: 20
    },
    text: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    }
});

export default CustomButton;
