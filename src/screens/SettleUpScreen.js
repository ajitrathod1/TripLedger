import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { useTripContext } from '../context/TripContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';

const SettleUpScreen = () => {
    const navigation = useNavigation();
    const { currentTrip } = useTripContext();

    if (!currentTrip) return null;

    // Calculation Logic
    const members = currentTrip.members || [];
    const expenses = currentTrip.expenses || [];
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const sharePerPerson = members.length > 0 ? totalSpent / members.length : 0;

    const balances = {};
    members.forEach(m => balances[m] = 0);

    expenses.forEach(e => {
        balances[e.paidBy] += e.amount; // They paid this much
    });

    members.forEach(m => {
        balances[m] -= sharePerPerson; // They should have paid this much
    });

    // Generate Transactions
    // Greedy algorithm to minimize number of transactions
    // 1. Separate people into debtors (owes money) and creditors (owed money)
    const debtors = [];
    const creditors = [];

    members.forEach(m => {
        if (balances[m] < -1) debtors.push({ name: m, amount: -balances[m] });
        else if (balances[m] > 1) creditors.push({ name: m, amount: balances[m] });
    });

    const transactions = [];
    let i = 0;
    let j = 0;

    // 2. Match debtors with creditors until everything is settled
    while (i < debtors.length && j < creditors.length) {
        const debt = debtors[i];
        const credit = creditors[j];
        const amount = Math.min(debt.amount, credit.amount);

        if (amount > 0) {
            transactions.push({
                from: debt.name,
                to: credit.name,
                amount: amount
            });
        }

        debt.amount -= amount;
        credit.amount -= amount;

        if (debt.amount < 1) i++;
        if (credit.amount < 1) j++;
    }

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Settle Up</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryLabel}>Total Expense</Text>
                        <Text style={styles.summaryValue}>₹{totalSpent.toLocaleString()}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryLabel}>Per Person</Text>
                        <Text style={styles.summaryValue}>₹{Math.round(sharePerPerson).toLocaleString()}</Text>
                    </View>
                </View>

                {/* Balance List (Who Owes What) */}
                <Text style={styles.sectionTitle}>Balances</Text>
                {transactions.length === 0 ? (
                    <Text style={styles.settledText}>Everyone is settled up!</Text>
                ) : (
                    transactions.map((t, index) => (
                        <View key={index} style={styles.transactionCard}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>{t.from.charAt(0)}</Text>
                            </View>
                            <View style={styles.transactionDetails}>
                                <Text style={styles.transactionText}>
                                    <Text style={styles.bold}>{t.from}</Text> owes <Text style={styles.bold}>{t.to}</Text>
                                </Text>
                            </View>
                            <Text style={styles.transactionAmount}>₹{Math.round(t.amount).toLocaleString()}</Text>
                        </View>
                    ))
                )}

                {/* Individual Cards */}
                <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Member Breakdown</Text>
                {members.map(member => {
                    const bal = balances[member];
                    const isOwed = bal > 0;
                    if (Math.abs(bal) < 1) return null; // Settled

                    return (
                        <View key={member} style={styles.memberRow}>
                            <View style={styles.rowLeft}>
                                <Ionicons name="person-circle" size={40} color={colors.gray} />
                                <Text style={styles.memberName}>{member}</Text>
                            </View>
                            <Text style={[
                                styles.memberBalance,
                                { color: isOwed ? colors.success : colors.error }
                            ]}>
                                {isOwed ? 'Gets back' : 'Owes'} ₹{Math.abs(Math.round(bal)).toLocaleString()}
                            </Text>
                        </View>
                    );
                })}

                <CustomButton title="Mark as Settled (Demo)" onPress={() => navigation.goBack()} style={{ marginTop: 40 }} />

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        marginRight: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text
    },
    summaryContainer: {
        flexDirection: 'row',
        ...colors.glass,
        padding: 20,
        marginBottom: 30,
    },
    summaryBox: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginBottom: 4,
    },
    summaryValue: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: colors.text,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        ...colors.glass,
        padding: 16,
        marginBottom: 12,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.lightGray,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontWeight: 'bold',
        color: colors.primary,
        fontSize: 18,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionText: {
        fontSize: 16,
        color: colors.text,
    },
    bold: {
        fontWeight: 'bold',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.error,
    },
    memberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberName: {
        fontSize: 16,
        marginLeft: 10,
        color: colors.text,
    },
    memberBalance: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    settledText: {
        textAlign: 'center',
        color: colors.success,
        fontSize: 16,
        marginVertical: 20,
    }
});

export default SettleUpScreen;
