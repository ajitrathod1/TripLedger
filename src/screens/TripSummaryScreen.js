import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, Alert, Animated, ImageBackground, Platform } from 'react-native';
// Removed unused imports
import SkeletonLoader from '../components/SkeletonLoader';
import { useTripContext } from '../context/TripContext';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import ThemedBackground from '../components/ThemedBackground';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const screenWidth = Dimensions.get('window').width;

const getCategoryColor = (category) => {
    switch (category) {
        case 'Food': return '#4CAF50';
        case 'Travel': return '#2196F3';
        case 'Stay': return '#FF9800';
        case 'Activities': return '#9C27B0';
        case 'Shopping': return '#E91E63';
        default: return '#607D8B';
    }
};

const categoryIcons = {
    'Food': 'restaurant',
    'Travel': 'car',
    'Stay': 'bed',
    'Activities': 'ticket',
    'Shopping': 'cart',
    'Other': 'receipt',
};

const TripSummaryScreen = () => {
    const { currentTrip, loading, deleteTrip, deleteExpense } = useTripContext();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = getStyles(theme, insets);

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    // Toggle for View All
    const [showAllExpenses, setShowAllExpenses] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleDeleteTrip = () => {
        Alert.alert(
            "Delete Trip",
            "Are you sure you want to delete this trip? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: () => {
                        deleteTrip(currentTrip.id);
                    }
                }
            ]
        );
    };

    const handleDeleteExpense = (expenseId) => {
        Alert.alert(
            "Delete Expense",
            "Are you sure you want to delete this expense?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteExpense(expenseId) }
            ]
        );
    };

    const getTripImage = (id) => {
        const seed = id || 'travel';
        return `https://picsum.photos/seed/${seed}/800/600`;
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={{ padding: 20 }}>
                    <SkeletonLoader height={200} style={{ borderRadius: 20, marginBottom: 20 }} />
                    <SkeletonLoader height={150} style={{ borderRadius: 20, marginBottom: 20 }} />
                    <SkeletonLoader height={100} style={{ borderRadius: 20, marginBottom: 10 }} />
                    <SkeletonLoader height={100} style={{ borderRadius: 20, marginBottom: 10 }} />
                </View>
            </ScreenWrapper>
        );
    }

    if (!currentTrip) {
        return (
            <ScreenWrapper>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    const expenses = currentTrip.expenses || [];
    const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
    const remaining = currentTrip.totalBudget - totalSpent;
    const progress = Math.min(totalSpent / (currentTrip.totalBudget || 1), 1);

    // Chart Data logic...
    const categories = ['Food', 'Travel', 'Stay', 'Activities', 'Shopping', 'Other'];
    const chartData = categories.map(cat => {
        const amount = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
        if (amount === 0) return null;
        return {
            name: cat,
            population: amount,
            color: getCategoryColor(cat),
            legendFontColor: 'transparent',
            legendFontSize: 0
        };
    }).filter(item => item !== null);

    return (
        <ThemedBackground>

            <Animated.ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Header Image */}
                <ImageBackground
                    source={{ uri: getTripImage(currentTrip.id) }}
                    style={styles.headerImage}
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.3)', 'transparent']}
                        style={styles.headerGradient}
                    />
                    <LinearGradient
                        colors={['transparent', '#0F172A']}
                        style={[styles.headerGradient, { top: undefined, height: 100, bottom: -2 }]}
                    />

                    {/* Header Controls */}
                    <View style={styles.headerControls}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.glassBtn}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity onPress={() => navigation.navigate('SettleUp')} style={styles.glassBtn}>
                                <Ionicons name="filter-outline" size={22} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDeleteTrip} style={[styles.glassBtn, { backgroundColor: 'rgba(239, 68, 68, 0.8)' }]}>
                                <Ionicons name="trash-outline" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.tripNameLarge}>{currentTrip.name}</Text>
                        <View style={styles.locationTag}>
                            <Ionicons name="location" size={14} color="#fff" />
                            <Text style={styles.locationText}>{currentTrip.destination}</Text>
                        </View>
                    </View>
                </ImageBackground>

                {/* Content Body */}
                <View style={styles.contentBody}>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                        {/* Budget Analysis Card */}
                        <View style={styles.glassCard}>
                            {/* Top Row: Budget vs Spent vs Remaining */}
                            <View style={styles.budgetRow}>
                                <View>
                                    <Text style={styles.label}>Total Budget</Text>
                                    <Text style={styles.valuePrimary}>₹{currentTrip.totalBudget.toLocaleString()}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.label}>Remaining</Text>
                                    <Text style={[styles.valueRight, { color: remaining < 0 ? '#EF4444' : '#10B981' }]}>
                                        ₹{remaining.toLocaleString()}
                                    </Text>
                                </View>
                            </View>

                            {/* Progress Bar */}
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: remaining < 0 ? '#EF4444' : '#10B981' }]} />
                            </View>
                            <Text style={styles.progressText}>
                                You've spent <Text style={{ fontFamily: 'Outfit-Bold', color: '#E2E8F0' }}>{Math.round(progress * 100)}%</Text> of your budget
                            </Text>
                        </View>

                        {/* Expense Visuals (Donut) */}
                        <View style={[styles.glassCard, styles.chartSection]}>
                            <View style={styles.pieWrapper}>
                                <PieChart
                                    data={chartData.length > 0 ? chartData : [{ population: 1, color: 'rgba(255,255,255,0.1)' }]}
                                    width={screenWidth * 0.5}
                                    height={160}
                                    chartConfig={{ color: () => `rgba(255,255,255,0.5)` }}
                                    accessor="population"
                                    backgroundColor="transparent"
                                    paddingLeft="40"
                                    center={[0, 0]}
                                    absolute
                                    hasLegend={false}
                                />
                                <View style={styles.donutCenter}>
                                    <Text style={styles.totalLabel}>Spent</Text>
                                    <Text style={styles.totalValue}>₹{totalSpent.toLocaleString()}</Text>
                                </View>
                            </View>

                            {/* Custom Legend */}
                            <View style={styles.legendContainer}>
                                {chartData.map((item, index) => (
                                    <View key={index} style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                        <View>
                                            <Text style={styles.legendName}>{item.name}</Text>
                                            <Text style={styles.legendAmount}>₹{item.population.toLocaleString()}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Recent Transactions Header */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {showAllExpenses ? 'All Transactions' : 'Recent Transactions'}
                            </Text>
                            {expenses.length > 3 && (
                                <TouchableOpacity onPress={() => setShowAllExpenses(!showAllExpenses)}>
                                    <Text style={styles.viewAll}>
                                        {showAllExpenses ? 'Show Less' : 'View All'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {/* Floating Action Button */}
                        <View style={styles.fabContainer}>
                            <TouchableOpacity
                                style={styles.fabButton}
                                onPress={() => navigation.navigate('AddExpense')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="add" size={24} color="#fff" />
                                <Text style={styles.fabText}>Add Expense</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Expense List */}
                        {expenses.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="receipt-outline" size={48} color="#64748B" />
                                <Text style={styles.emptyText}>No expenses added yet.</Text>
                            </View>
                        ) : (
                            // Show all or just top 3
                            (showAllExpenses ? expenses : expenses.slice(0, 3)).sort((a, b) => new Date(b.date) - new Date(a.date)).map((expense, index) => {
                                const inputRange = [-1, 0, (index * 70), (index + 2) * 70];
                                const scale = scrollY.interpolate({
                                    inputRange,
                                    outputRange: [1, 1, 1, 0.95],
                                    extrapolate: 'clamp'
                                });
                                const opacity = scrollY.interpolate({
                                    inputRange,
                                    outputRange: [1, 1, 1, 0.8],
                                    extrapolate: 'clamp'
                                });

                                return (
                                    <Animated.View
                                        key={expense.id}
                                        style={{ transform: [{ scale }], opacity }}
                                    >
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('AddExpense', { expenseToEdit: expense })}
                                            onLongPress={() => handleDeleteExpense(expense.id)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.glassCardRow}>
                                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                                                    <Ionicons name={categoryIcons[expense.category]} size={20} color="#38BDF8" />
                                                </View>
                                                <View style={styles.expenseInfo}>
                                                    <Text style={styles.expenseTitle}>{expense.title}</Text>
                                                    <Text style={styles.expenseCategory}>
                                                        {new Date(expense.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • {expense.category} • {currentTrip.memberDetails?.[expense.paidBy]?.name || expense.paidBy}
                                                    </Text>
                                                </View>
                                                <Text style={styles.expenseAmount}>- ₹{expense.amount.toLocaleString()}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })
                        )}
                    </Animated.View>
                </View>
            </Animated.ScrollView>



        </ThemedBackground>
    );
};

const getStyles = (theme, insets) => StyleSheet.create({
    headerImage: {
        width: '100%',
        height: 280,
    },
    headerGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    headerControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: (insets?.top || 20) + 10, // Standardized Header Height
    },
    glassBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerTitleContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
    },
    tripNameLarge: {
        fontSize: 32,
        fontFamily: 'Outfit-Bold',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        marginBottom: 8,
    },
    locationTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    locationText: {
        color: '#fff',
        marginLeft: 6,
        fontFamily: 'Outfit-Medium',
        fontSize: 14,
    },
    contentBody: {
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: '#0F172A',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 100,
        minHeight: 500,
    },
    glassCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
    },
    glassCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
    },
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    label: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: 'Outfit-Regular',
        marginBottom: 4,
    },
    valuePrimary: {
        fontSize: 22,
        fontFamily: 'Outfit-Bold',
        color: '#F8FAFC',
    },
    valueRight: {
        fontSize: 22,
        fontFamily: 'Outfit-Bold',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: 'rgba(15, 23, 42, 0.5)', // Darker track
        borderRadius: 4,
        marginBottom: 10,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'right',
        fontFamily: 'Outfit-Regular',
    },
    chartSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    pieWrapper: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        width: screenWidth * 0.4,
    },
    donutCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalLabel: {
        fontSize: 10,
        color: '#94A3B8',
        fontFamily: 'Outfit-Regular',
    },
    totalValue: {
        fontSize: 14,
        fontFamily: 'Outfit-Bold',
        color: '#F8FAFC',
    },
    legendContainer: {
        marginLeft: 15,
        flex: 1,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 10,
        marginTop: 2,
    },
    legendName: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: 'Outfit-Regular',
    },
    legendAmount: {
        fontSize: 14,
        fontFamily: 'Outfit-Bold',
        color: '#F8FAFC',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Outfit-Bold',
        color: '#F8FAFC',
    },
    viewAll: {
        fontSize: 14,
        color: '#38BDF8',
        fontFamily: 'Outfit-Medium',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    expenseInfo: {
        flex: 1,
    },
    expenseTitle: {
        fontSize: 16,
        fontFamily: 'Outfit-Bold',
        color: '#F8FAFC',
        marginBottom: 4,
    },
    expenseCategory: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: 'Outfit-Regular',
    },
    expenseAmount: {
        fontSize: 16,
        fontFamily: 'Outfit-Bold',
        color: '#F87171', // Red
    },
    emptyState: {
        alignItems: 'center',
        padding: 30,
        opacity: 0.6,
    },
    emptyText: {
        marginTop: 10,
        fontFamily: 'Outfit-Regular',
        fontSize: 14,
        color: '#94A3B8',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        elevation: 20,
    },
    fabButton: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 32,
        backgroundColor: '#38BDF8',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    fabText: {
        color: '#fff',
        fontFamily: 'Outfit-Bold',
        fontSize: 16,
        marginLeft: 8,
    }
});

export default TripSummaryScreen;
