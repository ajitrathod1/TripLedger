import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const CustomInput = ({ label, value, onChangeText, placeholder, icon, keyboardType = 'default', multiline = false }) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                {icon && <Ionicons name={icon} size={20} color={colors.textSecondary} style={styles.icon} />}
                <TextInput
                    style={[styles.input, multiline && styles.multiline]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.gray}
                    keyboardType={keyboardType}
                    multiline={multiline}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        ...colors.glass,
        paddingHorizontal: 12,
        height: 52,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        height: '100%',
    },
    multiline: {
        height: 100,
        textAlignVertical: 'top',
        paddingVertical: 12,
    },
});

export default CustomInput;
