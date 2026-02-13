import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedBackground from '../components/ThemedBackground';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { login, googleLogin } = useAuth();

    // Theme Colors
    const inputBg = 'rgba(30, 41, 59, 0.7)'; // Dark Slate
    const inputBorder = 'rgba(148, 163, 184, 0.2)'; // Slate-400

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Info', 'Please enter both email and password.');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            // Navigation handled by auth listener usually, but explicit here
            navigation.reset({
                index: 0,
                routes: [{ name: 'TripList' }],
            });
        } catch (error) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* Back Button - Standardized Position */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
                    </TouchableOpacity>

                    {/* Header Text */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.heroTitle}>Welcome{"\n"}Back!</Text>
                        <Text style={styles.heroSubtitle}>Your next adventure awaits.</Text>
                    </View>

                    {/* Form Container */}
                    <View style={styles.formContainer}>
                        {/* Glass Effect Layer */}
                        <LinearGradient
                            colors={['rgba(30, 41, 59, 0.7)', 'rgba(30, 41, 59, 0.4)']}
                            style={StyleSheet.absoluteFill}
                        />

                        <CustomInput
                            label="Email Address"
                            placeholder="hello@traveler.com"
                            value={email}
                            onChangeText={setEmail}
                            icon="mail-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            inputContainerStyle={{ backgroundColor: inputBg, borderColor: inputBorder }}
                            style={{ color: '#F1F5F9' }}
                            placeholderTextColor="#64748B"
                            labelStyle={{ color: '#CBD5E1' }}
                            iconColor="#94A3B8"
                        />
                        <CustomInput
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            icon="lock-closed-outline"
                            secureTextEntry
                            inputContainerStyle={{ backgroundColor: inputBg, borderColor: inputBorder }}
                            style={{ color: '#F1F5F9' }}
                            placeholderTextColor="#64748B"
                            labelStyle={{ color: '#CBD5E1' }}
                            iconColor="#94A3B8"
                        />

                        <CustomButton
                            title={"Sign In"}
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.signInBtn}
                            textStyle={{ color: '#fff', fontSize: 16 }}
                        />

                        <View style={styles.dividerContainer}>
                            <View style={styles.line} />
                            <Text style={styles.orText}>OR</Text>
                            <View style={styles.line} />
                        </View>

                        {/* Placeholder for Google Login visual as functionality is mocked/handled */}
                        <TouchableOpacity style={styles.googleBtn} onPress={() => Alert.alert("Coming Soon")}>
                            <Ionicons name="logo-google" size={20} color="#fff" />
                            <Text style={styles.googleBtnText}>Continue with Google</Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>New here? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.linkText}>Create Account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    orb: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    headerContainer: {
        marginBottom: 40,
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
    },
    heroTitle: {
        fontSize: 40,
        fontFamily: 'Outfit-Bold',
        color: '#F8FAFC',
        lineHeight: 48,
    },
    heroSubtitle: {
        fontSize: 18,
        color: '#94A3B8',
        fontFamily: 'Outfit-Regular',
        marginTop: 10,
    },
    formContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(30, 41, 59, 0.3)', // Fallback
    },
    signInBtn: {
        marginTop: 20,
        backgroundColor: '#38BDF8', // Cyan-400
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: "#38BDF8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 25,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
    },
    orText: {
        marginHorizontal: 10,
        color: '#64748B',
        fontFamily: 'Outfit-Medium',
        fontSize: 12,
    },
    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
        gap: 10,
    },
    googleBtnText: {
        fontSize: 14,
        fontFamily: 'Outfit-Medium',
        color: '#E2E8F0',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    footerText: {
        color: '#94A3B8',
        fontFamily: 'Outfit-Regular',
        fontSize: 14,
    },
    linkText: {
        color: '#38BDF8', // Cyan-400
        fontFamily: 'Outfit-Bold',
        fontSize: 14,
    }
});

export default LoginScreen;
