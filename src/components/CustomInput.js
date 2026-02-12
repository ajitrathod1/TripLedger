import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const CustomInput = ({ label, value, onChangeText, placeholder, icon, keyboardType = 'default', multiline = false }) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                {icon && <Ionicons name={icon} size={20} color={theme.textSecondary} style={styles.icon} />}
                <TextInput
                    style={[styles.input, multiline && styles.multiline]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.textSecondary + '70'} // 70% opacity
                    keyboardType={keyboardType}
                    multiline={multiline}
                />
            </View>
        </View>
    );
};

const getStyles = (theme) => StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: theme.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
        fontFamily: 'Outfit-Medium',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surfaceHighlight, // Slightly lighter/different than card surface
        paddingHorizontal: 12,
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
    },
    icon: {
        marginRight: 10,
        color: theme.textSecondary,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.text,
        fontFamily: 'Outfit-Regular',
        height: '100%',
    },
    multiline: {
        height: 100,
        textAlignVertical: 'top',
        paddingVertical: 12,
    },
});

export default CustomInput;
