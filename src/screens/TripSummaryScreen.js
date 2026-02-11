import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomButton from '../components/CustomButton';
import { colors } from '../constants/colors';
import { useTripContext } from '../context/TripContext';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const getCategoryColor = (category) => {
    switch (category) {
        case 'Travel': return '#4FC3F7';
        case 'Food': return '#81C784';
        case 'Stay': return '#FFB74D';
        case 'Activities': return '#BA68C8';
        case 'Shopping': return '#E57373';
        default: return '#AED581';
    }
};

const TripSummaryScreen = () => {
    const { currentTrip, loading, deleteTrip, deleteExpense } = useTripContext();
    const navigation = useNavigation();

    const handleDeleteTrip = () => {
        Alert.alert(
            "Delete Trip",
            "Are you sure you want to delete this trip? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: () => {
                        deleteTrip(currentTrip.id);
                        // Navigation or state update will happen automatically due to context logic
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

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!currentTrip) {
        return (
            <ScreenWrapper>
                <View style={[styles.header, { justifyContent: 'center' }]}>
                    <Text style={styles.headerTitle}>TripLedger</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Ionicons name="airplane-outline" size={80} color={colors.primary} style={{ marginBottom: 20 }} />
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 10 }}>No Trips Yet</Text>
                    <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 30 }}>
                        Start by creating your first trip to track expenses.
                    </Text>
                    <CustomButton title="Create New Trip" onPress={() => navigation.navigate('CreateTrip')} />
                </View>
            </ScreenWrapper>
        );
    }

    const expenses = currentTrip.expenses || [];
    const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
    const remaining = currentTrip.totalBudget - totalSpent;
    const progress = Math.min(totalSpent / (currentTrip.totalBudget || 1), 1);

    // Prepare Chart Data
    // Aggregates expenses by category for visualization
    const categories = ['Travel', 'Food', 'Stay', 'Activities', 'Shopping', 'Other'];
    const chartData = categories.map(cat => {
        const amount = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
        if (amount === 0) return null;
        return {
            name: cat,
            population: amount,
            color: getCategoryColor(cat),
            legendFontColor: colors.textSecondary,
            legendFontSize: 12
        };
    }).filter(item => item !== null);

    return (
        <ScreenWrapper style={{ paddingHorizontal: 0 }}>
            {/* Custom Header with Settle Up and Delete button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('CreateTrip')} style={{ marginRight: 10 }}>
                    <Ionicons name="add-circle-outline" size={32} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>{currentTrip.name}</Text>
                    <Text style={styles.headerSubtitle}>{currentTrip.destination}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => navigation.navigate('SettleUp')} style={{ marginRight: 15 }}>
                        <Ionicons name="people-circle-outline" size={32} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDeleteTrip}>
                        <Ionicons name="trash-outline" size={32} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Budget Overview */}
                <View style={styles.card}>
                    <View style={styles.budgetRow}>
                        <View>
                            <Text style={styles.label}>Total Spent</Text>
                            <Text style={styles.spentAmount}>₹{totalSpent.toLocaleString()}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.label}>Remaining</Text>
                            <Text style={[styles.remainingAmount, { color: remaining < 0 ? colors.error : colors.success }]}>
                                ₹{remaining.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: remaining < 0 ? colors.error : colors.primary }]} />
                    </View>
                    <Text style={styles.budgetLimit}>Total Budget: ₹{currentTrip.totalBudget.toLocaleString()}</Text>
                </View>

                {/* Chart */}
                {chartData.length > 0 ? (
                    <View style={styles.chartContainer}>
                        <PieChart
                            data={chartData}
                            width={screenWidth - 40}
                            height={220}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            }}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            paddingLeft={"15"}
                            center={[10, 0]}
                            absolute
                        />
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text>No expenses yet.</Text>
                    </View>
                )}

                {/* Recent Expenses List */}
                <Text style={styles.sectionTitle}>Recent Expenses</Text>
                {currentTrip.expenses.length === 0 ? (
                    <Text style={{ color: colors.gray, fontStyle: 'italic' }}>No expenses recorded. Click + to add one.</Text>
                ) : (
                    currentTrip.expenses.map((expense) => (
                        <TouchableOpacity
                            key={expense.id}
                            style={styles.expenseItem}
                            onLongPress={() => handleDeleteExpense(expense.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconBox, { backgroundColor: getCategoryColor(expense.category) + '33' }]}>
                                <Ionicons name={"pricetag"} size={20} color={getCategoryColor(expense.category)} />
                            </View>
                            <View style={styles.expenseDetails}>
                                <Text style={styles.expenseTitle}>{expense.title}</Text>
                                <Text style={styles.expenseSub}>{expense.paidBy} • {expense.category}</Text>
                            </View>
                            <Text style={styles.expenseAmount}>₹{expense.amount.toLocaleString()}</Text>
                        </TouchableOpacity>
                    ))
                )}

            </ScrollView>

            {/* FAB to Add Expense */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddExpense')}
            >
                <Ionicons name="add" size={30} color={colors.white} />
                <Text style={styles.fabText}>Add Expense</Text>
            </TouchableOpacity>

        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
        ...colors.glass,
        padding: 20,
        marginTop: 20,
    },
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    label: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    spentAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    remainingAmount: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: colors.lightGray,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    budgetLimit: {
        fontSize: 12,
        color: colors.gray,
        textAlign: 'right',
    },
    chartContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: colors.text,
    },
    expenseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        ...colors.glass,
        padding: 15,
        marginBottom: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    expenseDetails: {
        flex: 1,
    },
    expenseTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    expenseSub: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        ...colors.shadowConfig,
    },
    fabText: {
        color: colors.white,
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    }
});

export default TripSummaryScreen;
