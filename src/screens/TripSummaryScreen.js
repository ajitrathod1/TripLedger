import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, Alert, Animated, ImageBackground } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomButton from '../components/CustomButton';
import SkeletonLoader from '../components/SkeletonLoader';
import { colors } from '../constants/colors';
import { useTripContext } from '../context/TripContext';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

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

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

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
                    <ActivityIndicator size="large" color={colors.primary} />
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
        <ScreenWrapper contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 0 }}>

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Header Image */}
                <ImageBackground
                    source={{ uri: getTripImage(currentTrip.id) }}
                    style={styles.headerImage}
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(255,255,255,1)']}
                        style={styles.headerGradient}
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
                            <TouchableOpacity onPress={handleDeleteTrip} style={[styles.glassBtn, { backgroundColor: 'rgba(229, 57, 53, 0.8)' }]}>
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
                        <View style={styles.budgetCard}>
                            {/* Top Row: Budget vs Spent vs Remaining */}
                            <View style={styles.budgetRow}>
                                <View>
                                    <Text style={styles.label}>Total Budget</Text>
                                    <Text style={styles.valuePrimary}>₹{currentTrip.totalBudget.toLocaleString()}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.label}>Remaining</Text>
                                    <Text style={[styles.valueRight, { color: remaining < 0 ? '#E53935' : '#2A9D8F' }]}>
                                        ₹{remaining.toLocaleString()}
                                    </Text>
                                </View>
                            </View>

                            {/* Progress Bar */}
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: remaining < 0 ? '#E53935' : '#2A9D8F' }]} />
                            </View>
                            <Text style={styles.progressText}>
                                You've spent <Text style={{ fontFamily: 'Outfit-Bold' }}>{Math.round(progress * 100)}%</Text> of your budget
                            </Text>
                        </View>

                        {/* Expense Visuals (Donut) */}
                        <View style={styles.chartSection}>
                            <View style={styles.pieWrapper}>
                                <PieChart
                                    data={chartData.length > 0 ? chartData : [{ population: 1, color: '#F0F0F0' }]}
                                    width={screenWidth * 0.5}
                                    height={160}
                                    chartConfig={{ color: () => `rgba(0,0,0,0.5)` }}
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
                            <Text style={styles.sectionTitle}>Recent Transactions</Text>
                            <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
                        </View>

                        {/* Expense List */}
                        {expenses.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="receipt-outline" size={48} color="#ddd" />
                                <Text style={styles.emptyText}>No expenses added yet.</Text>
                            </View>
                        ) : (
                            expenses.map((expense, index) => (
                                <TouchableOpacity key={expense.id} style={styles.expenseCard} onLongPress={() => handleDeleteExpense(expense.id)}>
                                    <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(expense.category) + '15' }]}>
                                        <Ionicons name={categoryIcons[expense.category]} size={20} color={getCategoryColor(expense.category)} />
                                    </View>
                                    <View style={styles.expenseInfo}>
                                        <Text style={styles.expenseTitle}>{expense.title}</Text>
                                        <Text style={styles.expenseCategory}>{expense.category} • {expense.paidBy}</Text>
                                    </View>
                                    <Text style={styles.expenseAmount}>- ₹{expense.amount.toLocaleString()}</Text>
                                </TouchableOpacity>
                            ))
                        )}

                    </Animated.View>
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <View style={styles.fabContainer}>
                <TouchableOpacity
                    style={styles.fabButton}
                    onPress={() => navigation.navigate('AddExpense')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={32} color="#fff" />
                </TouchableOpacity>
            </View>

        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
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
        paddingTop: 50,
    },
    glassBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
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
        textShadowColor: 'rgba(0,0,0,0.3)',
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
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 100,
        minHeight: 500,
    },
    budgetCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    label: {
        fontSize: 12,
        color: '#909090',
        fontFamily: 'Outfit-Regular',
        marginBottom: 4,
    },
    valuePrimary: {
        fontSize: 22,
        fontFamily: 'Outfit-Bold',
        color: '#264653',
    },
    valueRight: {
        fontSize: 22,
        fontFamily: 'Outfit-Bold',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#F1F3F5',
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
        color: '#909090',
        textAlign: 'right',
        fontFamily: 'Outfit-Regular',
    },
    chartSection: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 25,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
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
        color: '#909090',
        fontFamily: 'Outfit-Regular',
    },
    totalValue: {
        fontSize: 14,
        fontFamily: 'Outfit-Bold',
        color: '#333',
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
        color: '#909090',
        fontFamily: 'Outfit-Regular',
    },
    legendAmount: {
        fontSize: 14,
        fontFamily: 'Outfit-Bold',
        color: '#333',
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
        color: '#333',
    },
    viewAll: {
        fontSize: 14,
        color: '#2A9D8F',
        fontFamily: 'Outfit-Medium',
    },
    expenseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#F9F9F9',
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
        color: '#333',
        marginBottom: 4,
    },
    expenseCategory: {
        fontSize: 12,
        color: '#909090',
        fontFamily: 'Outfit-Regular',
    },
    expenseAmount: {
        fontSize: 16,
        fontFamily: 'Outfit-Bold',
        color: '#E53935',
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
        color: '#909090',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    fabButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#264653',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#264653",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
    }
});

export default TripSummaryScreen;
