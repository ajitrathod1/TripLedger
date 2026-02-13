import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import GlassView from '../components/GlassView';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedBackground from '../components/ThemedBackground';
import { StatusBar } from 'expo-status-bar';

const SignupScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { signup } = useAuth();
    const styles = getStyles(theme);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await signup(email, password);
            // After signup, redirect to Home/TripList
            // We can also ask for display name later
            navigation.reset({
                index: 0,
                routes: [{ name: 'TripList' }],
            });
        } catch (error) {
            Alert.alert('Signup Failed', error.message);
            setLoading(false);
        }
    };

    return (
        <ThemedBackground>

            <View style={styles.container}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
                </TouchableOpacity>

                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Join TripLedger</Text>
                    <Text style={styles.subtitle}>Start tracking your trips together</Text>
                </View>

                <View style={styles.glassForm}>
                    <CustomInput
                        label="Email"
                        placeholder="john@example.com"
                        value={email}
                        onChangeText={setEmail}
                        icon="mail-outline"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        inputContainerStyle={styles.transparentInput}
                        style={{ color: '#fff' }}
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        labelStyle={{ color: '#94A3B8' }}
                        iconColor="#94A3B8"
                    />
                    <CustomInput
                        label="Password"
                        placeholder="••••••"
                        value={password}
                        onChangeText={setPassword}
                        icon="lock-closed-outline"
                        secureTextEntry
                        inputContainerStyle={styles.transparentInput}
                        style={{ color: '#fff' }}
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        labelStyle={{ color: '#94A3B8' }}
                        iconColor="#94A3B8"
                    />

                    <CustomButton
                        title={loading ? "Creating Account..." : "Sign Up"}
                        onPress={handleSignup}
                        style={styles.signupButton}
                        disabled={loading}
                        textStyle={{ color: '#fff', fontSize: 18 }}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ThemedBackground>
    );
};

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    orb: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        blurRadius: 50, // Note: blurRadius fits Image, not View mostly, but for layout purposes here ok. 
        // Actually View doesn't support blurRadius. We can simulate or assume the gradient handles it.
        // Ideally we use an Image or SVG, but let's stick to View for simplicity, maybe just opacity.
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerContainer: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontFamily: 'Outfit-Bold',
        color: '#F8FAFC',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94A3B8',
        fontFamily: 'Outfit-Regular',
    },
    glassForm: {
        padding: 30,
        borderRadius: 24,
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    transparentInput: {
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
    },
    signupButton: {
        marginTop: 20,
        backgroundColor: '#38BDF8',
        shadowColor: "#38BDF8",
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    footerText: {
        color: '#94A3B8',
        fontFamily: 'Outfit-Regular',
        fontSize: 14,
    },
    linkText: {
        color: '#38BDF8',
        fontFamily: 'Outfit-Bold',
        fontSize: 14,
    }
});

export default SignupScreen;
