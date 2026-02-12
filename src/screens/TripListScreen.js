import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import SkeletonLoader from '../components/SkeletonLoader';
import { colors } from '../constants/colors';
import { useTripContext } from '../context/TripContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const TripListScreen = () => {
    const { trips, setCurrentTrip, loading } = useTripContext();
    const navigation = useNavigation();

    // Stats Calculation
    const totalBudget = trips.reduce((sum, t) => sum + (t.totalBudget || 0), 0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleTripPress = (trip) => {
        setCurrentTrip(trip);
        navigation.navigate('TripSummary');
    };

    if (loading) {
        return (
            <ScreenWrapper contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 40 }}>
                <SkeletonLoader width={150} height={32} style={{ marginBottom: 8 }} />
                <SkeletonLoader width={200} height={16} style={{ marginBottom: 30 }} />
                <SkeletonLoader height={160} style={{ borderRadius: 24, marginBottom: 20 }} />
                <SkeletonLoader height={160} style={{ borderRadius: 24, marginBottom: 20 }} />
            </ScreenWrapper>
        );
    }

    const renderTripItem = ({ item }) => {
        const budget = item.totalBudget || 0;
        const members = item.members?.length || 1;
        const duration = '3 Days'; // Mock

        // Conditional Rendering
        if (item.coverImage) {
            // IMAGE CARD STYLE
            return (
                <TouchableOpacity
                    style={styles.imageCard}
                    onPress={() => handleTripPress(item)}
                    activeOpacity={0.9}
                >
                    <Image source={{ uri: item.coverImage }} style={styles.cardImage} resizeMode="cover" />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.cardGradient}
                    />
                    <View style={styles.imageCardContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View>
                                <Text style={styles.imageCardDest}>{item.destination}</Text>
                                <Text style={styles.imageCardTitle}>{item.name}</Text>
                            </View>
                            <View style={[styles.statusChip, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Text style={[styles.statusText, { color: '#fff' }]}>Active</Text>
                            </View>
                        </View>

                        <View style={styles.imageCardFooter}>
                            <View>
                                <Text style={styles.imageBudgetLabel}>Total Budget</Text>
                                <Text style={styles.imageBudgetDisplay}>₹{budget.toLocaleString()}</Text>
                            </View>
                            <Ionicons name="arrow-forward-circle" size={32} color="#fff" />
                        </View>
                    </View>
                </TouchableOpacity>
            );
        } else {
            // CLASSIC WHITE CARD STYLE
            return (
                <TouchableOpacity
                    style={styles.detailedCard}
                    onPress={() => handleTripPress(item)}
                    activeOpacity={0.9}
                >
                    <View style={styles.cardBgContainer}>
                        <Ionicons name="map" size={120} color="rgba(0,0,0,0.03)" style={styles.bgIcon} />
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View>
                                    <Text style={styles.cardDest}>{item.destination}</Text>
                                    <Text style={styles.cardTitle}>{item.name}</Text>
                                </View>
                                <View style={styles.statusChip}>
                                    <Text style={styles.statusText}>Active</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.statsRow}>
                            <View style={styles.statChip}>
                                <Ionicons name="time-outline" size={14} color={colors.primary} />
                                <Text style={styles.statText}>{duration}</Text>
                            </View>
                            <View style={styles.statChip}>
                                <Ionicons name="people-outline" size={14} color={colors.primary} />
                                <Text style={styles.statText}>{members} Travelers</Text>
                            </View>
                        </View>
                        <View style={styles.cardFooter}>
                            <View>
                                <Text style={styles.budgetLabel}>Total Budget</Text>
                                <Text style={styles.budgetDisplay}>₹{budget.toLocaleString()}</Text>
                            </View>
                            <View style={styles.arrowBtn}>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
    };

    return (
        <ScreenWrapper contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 0 }}>
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Header Section */}
                <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                    <View>
                        <Text style={styles.appName}>TripLedger</Text>
                        <Text style={styles.appTagline}>Travel Smart, Spend Wisely ✈️</Text>
                    </View>
                    <View style={styles.avatar}>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' }}
                            style={{ width: 40, height: 40 }}
                        />
                        <View style={styles.notificationDot} />
                    </View>
                </Animated.View>



                {/* Trip List */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Adventures</Text>
                </View>

                <View style={styles.listContainer}>
                    {trips.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="paper-plane-outline" size={80} color="#E0E0E0" />
                            <Text style={styles.emptyText}>No trips planned yet.</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('CreateTrip')} style={styles.createButton}>
                                <Text style={styles.createButtonText}>Start a new Adventure</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        trips.map((trip) => (
                            <Animated.View key={trip.id} style={{ opacity: fadeAnim, marginVertical: 10 }}>
                                {renderTripItem({ item: trip })}
                            </Animated.View>
                        ))
                    )}
                </View>

            </ScrollView>

            {/* Floating Create Button */}
            <View style={styles.fabMain}>
                <TouchableOpacity
                    style={styles.fabButton}
                    onPress={() => navigation.navigate('CreateTrip')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={32} color={colors.white} />
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    appName: { fontSize: 28, fontFamily: 'Outfit-Bold', color: colors.primary, letterSpacing: 0.5 },
    appTagline: { fontSize: 14, color: '#888', fontFamily: 'Outfit-Medium', marginTop: 2 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    notificationDot: { position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF5252', borderWidth: 2, borderColor: '#fff' },
    statsContainer: { paddingHorizontal: 20, marginBottom: 20 },
    totalBudgetPill: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#bae6fd' },
    totalBudgetText: { marginLeft: 10, color: '#0284c7', fontFamily: 'Outfit-Medium', fontSize: 14 },
    sectionHeader: { paddingHorizontal: 20, marginBottom: 10 },
    sectionTitle: { fontSize: 20, fontFamily: 'Outfit-Bold', color: '#333' },
    listContainer: { paddingHorizontal: 20 },

    // Classic Card Styles
    detailedCard: { backgroundColor: '#fff', borderRadius: 24, marginBottom: 10, overflow: 'hidden', minHeight: 150, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 3, borderWidth: 1, borderColor: '#F8F9FA' },
    cardBgContainer: { ...StyleSheet.absoluteFillObject, opacity: 0.6, zIndex: -1 },
    bgIcon: { position: 'absolute', bottom: -20, right: -20 },
    cardContent: { padding: 20 },
    cardHeader: { marginBottom: 15 },
    cardDest: { fontSize: 12, color: colors.primary, fontFamily: 'Outfit-Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    cardTitle: { fontSize: 22, fontFamily: 'Outfit-Bold', color: '#333' },
    statusChip: { backgroundColor: '#E0F2F1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { color: colors.primary, fontSize: 10, fontFamily: 'Outfit-Bold' },
    statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    statChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9F8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 10 },
    statText: { color: colors.primary, fontSize: 12, marginLeft: 6, fontFamily: 'Outfit-Medium' },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 15 },
    budgetLabel: { fontSize: 10, color: '#999', fontFamily: 'Outfit-Regular' },
    budgetDisplay: { fontSize: 18, fontFamily: 'Outfit-Bold', color: '#333' },
    arrowBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },

    // Image Card Styles
    imageCard: { height: 200, borderRadius: 24, marginBottom: 20, overflow: 'hidden', backgroundColor: '#000', shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 5 },
    cardImage: { width: '100%', height: '100%' },
    cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
    imageCardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
    imageCardDest: { color: '#FFD700', fontSize: 12, fontFamily: 'Outfit-Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    imageCardTitle: { fontSize: 24, fontFamily: 'Outfit-Bold', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    imageCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
    imageBudgetLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'Outfit-Regular' },
    imageBudgetDisplay: { color: '#fff', fontSize: 20, fontFamily: 'Outfit-Bold' },

    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { marginTop: 20, color: '#999', fontSize: 16, fontFamily: 'Outfit-Medium' },
    createButton: { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 30, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    createButtonText: { color: '#fff', fontFamily: 'Outfit-Bold' },
    fabMain: { position: 'absolute', bottom: 30, right: 0, left: 0, alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    fabButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8, borderWidth: 4, borderColor: 'rgba(255,255,255,0.4)' }
});

export default TripListScreen;
