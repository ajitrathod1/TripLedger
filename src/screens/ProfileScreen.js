import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedBackground from '../components/ThemedBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { theme, toggleTheme, isDark } = useTheme();
    const { user, logout } = useAuth(); // Use Cloud Auth
    const insets = useSafeAreaInsets();
    const styles = getStyles(theme, insets);

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    const handleLogout = async () => {
        try {
            await logout();
            Alert.alert("Logged Out", "See you soon!");
        } catch (e) {
            Alert.alert("Error", e.message);
        }
    };

    const handleClearData = () => {
        Alert.alert(
            "Clear All Data",
            "Are you sure? This will delete all your local trips permanently (if not synced).",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete Everything",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.clear();
                        Alert.alert("Data Cleared", "Please restart the app.");
                    }
                }
            ]
        );
    };

    return (
        <ThemedBackground>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('TripList')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile & Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* User Profile Card */}
                <View style={styles.glassCard}>
                    <View style={styles.avatarContainer}>
                        {user ? (
                            <Image
                                source={{ uri: user.photoURL || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Ionicons name="person-circle" size={80} color="#94A3B8" />
                        )}
                    </View>

                    {user ? (
                        <>
                            <Text style={styles.userName}>{user.displayName || "TripLedger User"}</Text>
                            <Text style={styles.userEmail}>{user.email}</Text>
                            <TouchableOpacity style={styles.editBtn}>
                                <Text style={styles.editBtnText}>Edit Profile</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.userName}>Guest User</Text>
                            <Text style={styles.userEmail}>Sign in to sync your trips</Text>
                            <TouchableOpacity style={styles.msgBtn} onPress={handleLogin}>
                                <Text style={styles.msgBtnText}>Sign In / Register</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Settings Section */}
                <Text style={styles.sectionTitle}>Preferences</Text>
                <View style={styles.settingsGlassCard}>
                    {/* Notifications (Mock) */}
                    <View style={styles.settingRow}>
                        <View style={[styles.settingIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                            <Ionicons name="notifications" size={22} color="#8B5CF6" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.settingLabel}>Notifications</Text>
                            <Text style={styles.settingSubLabel}>Updates & Reminders</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#334155', true: '#8B5CF6' }}
                            thumbColor="#fff"
                            value={true}
                            onValueChange={() => { }}
                        />
                    </View>
                </View>

                {/* App Info & Danger Zone */}
                <Text style={styles.sectionTitle}>App Data</Text>
                <View style={styles.settingsGlassCard}>
                    <TouchableOpacity style={styles.settingRow} onPress={handleClearData}>
                        <View style={[styles.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                            <Ionicons name="trash-bin" size={22} color="#EF4444" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.settingLabel, { color: '#EF4444' }]}>Clear All Data</Text>
                            <Text style={styles.settingSubLabel}>Irrevocable action</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.settingRow}>
                        <View style={[styles.settingIcon, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                            <Ionicons name="information-circle" size={22} color="#38BDF8" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.settingLabel}>About TripKaHisab</Text>
                            <Text style={styles.settingSubLabel}>Version 1.0.0</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                </View>

                {user && (
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>
        </ThemedBackground >
    );
};

const getStyles = (theme, insets) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: (insets?.top || 20) + 10,
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Outfit-Bold',
        color: '#F8FAFC',
    },
    glassCard: {
        alignItems: 'center',
        padding: 30,
        marginHorizontal: 20,
        marginBottom: 30,
        borderRadius: 24,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#38BDF8',
        overflow: 'hidden'
    },
    avatarImage: {
        width: '100%',
        height: '100%'
    },
    userName: {
        fontSize: 24,
        fontFamily: 'Outfit-Bold',
        color: theme.text,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: theme.textSecondary,
        fontFamily: 'Outfit-Regular',
        marginBottom: 20,
    },
    msgBtn: {
        backgroundColor: '#38BDF8',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        shadowColor: "#38BDF8",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    msgBtnText: {
        color: '#fff',
        fontFamily: 'Outfit-Bold',
        fontSize: 16,
    },
    editBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    editBtnText: {
        color: '#F8FAFC',
        fontFamily: 'Outfit-Medium',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Outfit-Bold',
        color: theme.text,
        marginLeft: 20,
        marginBottom: 10,
    },
    settingsGlassCard: {
        marginHorizontal: 20,
        marginBottom: 30,
        borderRadius: 20,
        padding: 5,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingLabel: {
        fontSize: 16,
        color: '#F8FAFC',
        fontFamily: 'Outfit-Medium',
        marginBottom: 2,
    },
    settingSubLabel: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: 'Outfit-Regular',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginLeft: 70, // Align with text start
    },
    logoutButton: {
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EF4444',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        marginBottom: 100
    },
    logoutText: {
        color: '#EF4444',
        fontFamily: 'Outfit-Bold',
        fontSize: 16,
    }
});

export default ProfileScreen;
