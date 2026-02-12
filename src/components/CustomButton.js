import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Reusable Button Component with loading state
 */
const CustomButton = ({ title, onPress, loading = false, disabled = false, style, textStyle }) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[
                styles.button,
                {
                    backgroundColor: theme.primary,
                    shadowColor: theme.shadowConfig?.shadowColor || '#000'
                },
                style,
                (disabled || loading) && { opacity: 0.6 } // Visual feedback for disabled state
            ]}
            disabled={loading || disabled}
        >
            {loading ? (
                <ActivityIndicator color={theme.white} />
            ) : (
                <Text style={[styles.text, { color: theme.white }, textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
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
