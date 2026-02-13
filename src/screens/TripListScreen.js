import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, Image, ScrollView, Dimensions, StatusBar, Alert, Animated } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';
import { useTripContext } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../components/CustomButton';
import ThemedBackground from '../components/ThemedBackground';

const { width } = Dimensions.get('window');

// Helper to get random travel image
const getTripImage = (id) => {
    const images = [
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1499856871940-a09627c6d7db?q=80&w=2020&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1504609773096-104ff100aaa4?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop',
    ];
    // Simple hash
    let hash = 0;
    if (id) {
        const str = id.toString();
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
    }
    const index = Math.abs(hash) % images.length;
    return images[index];
};

const TripListScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { trips, deleteTrip } = useTripContext();
    const { user } = useAuth();
    const styles = getStyles(theme);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleDelete = (trip) => {
        Alert.alert(
            "Delete Trip",
            `Are you sure you want to delete "${trip.name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteTrip(trip.id)
                }
            ]
        );
    };

    const renderTripCard = ({ item }) => {
        // Calculate Total Spent for this Trip
        const tripSpent = item.expenses?.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) || 0;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('TripSummary', { tripId: item.id })}
                onLongPress={() => handleDelete(item)}
                style={styles.tripCardContainer}
            >
                <ImageBackground
                    source={{ uri: getTripImage(item.id) }}
                    style={styles.tripCardImage}
                    imageStyle={{ borderRadius: 24 }}
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.cardGradient}
                    >
                        <View style={styles.cardContent}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <View style={styles.cardBadge}>
                                    <Text style={styles.cardBadgeText}>Active</Text>
                                </View>
                                {/* NEW: Expense Display on Card */}
                                <View style={styles.expenseBadge}>
                                    <Text style={styles.expenseBadgeText}>₹{tripSpent.toLocaleString()}</Text>
                                </View>
                            </View>

                            <Text style={styles.tripTitle}>{item.name}</Text>
                            <Text style={styles.tripDate}>
                                <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" /> {new Date(parseInt(item.id)).toLocaleDateString()}
                            </Text>

                            <View style={styles.membersRow}>
                                {item.members?.slice(0, 3).map((m, i) => (
                                    <View key={i} style={[styles.memberDot, { zIndex: 3 - i, marginLeft: i > 0 ? -10 : 0 }]}>
                                        <Text style={styles.memberInitial}>{m.charAt(0).toUpperCase()}</Text>
                                    </View>
                                ))}
                                {(item.members?.length > 3) && (
                                    <View style={[styles.memberDot, { zIndex: 0, marginLeft: -10, backgroundColor: theme.primary }]}>
                                        <Text style={styles.memberInitial}>+{item.members.length - 3}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </LinearGradient>
                </ImageBackground>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486744.png' }}
                style={{ width: 150, height: 150, opacity: 0.8, marginBottom: 20 }}
            />
            <Text style={styles.emptyTitle}>No Trips Yet</Text>
            <Text style={styles.emptySubtitle}>Time to plan your next escape!</Text>
            <CustomButton
                title="Create New Trip"
                onPress={() => navigation.navigate('CreateTrip')}
                style={{ width: 200, marginTop: 20 }}
            />
        </View>
    );

    return (
        <ThemedBackground>
            {/* Header */}
            <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                <View>
                    <Text style={styles.greeting}>Hello, {user?.displayName?.split(' ')[0] || 'Traveler'} 👋</Text>
                    <Text style={styles.subGreeting}>Where to next?</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <View style={styles.profileRing}>
                        <Image
                            source={{ uri: user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' }}
                            style={styles.profileImage}
                        />
                    </View>
                </TouchableOpacity>
            </Animated.View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Active Trips Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Adventures</Text>
                    {trips.length > 0 && <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>}
                </View>

                {trips.length === 0 ? renderEmptyState() : (
                    <FlatList
                        data={trips}
                        renderItem={renderTripCard}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                        snapToInterval={width * 0.75 + 20}
                        decelerationRate="fast"
                    />
                )}

                {/* Quick Insights (Reduced) */}
                {trips.length > 0 && (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Quick Insights</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                            {/* Analytics Shortcut */}
                            <TouchableOpacity style={styles.quickActionCard}>
                                <LinearGradient
                                    colors={['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.05)']}
                                    style={StyleSheet.absoluteFill}
                                />
                                <View style={styles.qaIcon}>
                                    <Ionicons name="pie-chart" size={24} color="#FBBF24" />
                                </View>
                                <View style={styles.qaContent}>
                                    <Text style={styles.qaLabel}>Total Spent</Text>
                                    <Text style={[styles.qaValue, { color: '#FBBF24' }]}>
                                        ₹{trips.reduce((acc, t) => acc + (t.expenses?.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0) || 0), 0).toLocaleString()}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* REMOVED 'Remaining' Card as requested */}

                            {/* Converter Shortcut */}
                            <TouchableOpacity style={styles.quickActionCard}>
                                <LinearGradient
                                    colors={['rgba(167, 139, 250, 0.2)', 'rgba(167, 139, 250, 0.05)']}
                                    style={StyleSheet.absoluteFill}
                                />
                                <View style={styles.qaIcon}>
                                    <Ionicons name="sync" size={24} color="#A78BFA" />
                                </View>
                                <View style={styles.qaContent}>
                                    <Text style={styles.qaLabel}>Converter</Text>
                                    <Text style={[styles.qaValue, { fontSize: 13, color: '#A78BFA' }]}>Check Rates</Text>
                                </View>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateTrip')}
                activeOpacity={0.8}
            >
                <View style={styles.fabGlass}>
                    <View style={styles.fabIconContainer}>
                        <Ionicons name="add" size={28} color="#fff" />
                    </View>
                    <Text style={styles.fabText}>New Trip</Text>
                </View>
            </TouchableOpacity>
        </ThemedBackground>
    );
};

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    bgContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    greeting: {
        fontSize: 24,
        fontFamily: 'Outfit-Bold',
        color: theme.text,
    },
    subGreeting: {
        fontSize: 16,
        color: theme.textSecondary,
        fontFamily: 'Outfit-Regular',
    },
    profileRing: {
        width: 50,
        height: 50,
        borderRadius: 25,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.5)',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 15,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'Outfit-Bold',
        color: theme.text,
    },
    seeAll: {
        color: '#38BDF8',
        fontFamily: 'Outfit-Medium',
    },
    tripCardContainer: {
        width: width * 0.75,
        height: 400,
        marginRight: 20,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    tripCardImage: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
        overflow: 'hidden',
    },
    cardGradient: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 20,
    },
    cardContent: {

    },
    cardBadge: {
        backgroundColor: 'rgba(56, 189, 248, 0.2)', // Cyan tint
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.4)',
    },
    cardBadgeText: {
        color: '#BAE6FD',
        fontSize: 12,
        fontFamily: 'Outfit-Bold',
    },
    // New Expense Badge
    expenseBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)', // Green tint
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.4)',
    },
    expenseBadgeText: {
        color: '#6EE7B7', // Light Green
        fontSize: 12,
        fontFamily: 'Outfit-Bold',
    },
    tripTitle: {
        fontSize: 28,
        fontFamily: 'Outfit-Bold',
        color: '#fff',
        marginBottom: 5,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowRadius: 10,
    },
    tripDate: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 15,
        fontFamily: 'Outfit-Medium',
    },
    membersRow: {
        flexDirection: 'row',
    },
    memberDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    memberInitial: {
        fontSize: 12,
        fontFamily: 'Outfit-Bold',
        color: '#000',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    emptyTitle: {
        fontSize: 22,
        color: theme.text,
        fontFamily: 'Outfit-Bold',
        marginTop: 10,
    },
    emptySubtitle: {
        color: theme.textSecondary,
        fontSize: 16,
        marginBottom: 20,
    },
    quickActionsRow: {
        flexDirection: 'row',
        paddingRight: 20,
    },
    quickActionCard: {
        width: 140, // Wider for text
        height: 110,
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 24,
        padding: 15,
        justifyContent: 'space-between',
        marginRight: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    qaIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)', // Fallback
    },
    qaContent: {
        marginTop: 10,
    },
    qaLabel: {
        fontSize: 11,
        color: theme.textSecondary,
        fontFamily: 'Outfit-Medium',
        textTransform: 'uppercase',
    },
    qaValue: {
        fontSize: 16,
        color: theme.text,
        fontFamily: 'Outfit-Bold',
        marginTop: 2,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        shadowColor: "#38BDF8",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
    },
    fabGlass: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingRight: 20,
        backgroundColor: theme.type === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
        borderRadius: 30,
    },
    fabIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#38BDF8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    fabText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Outfit-Bold',
    }
});

export default TripListScreen;
