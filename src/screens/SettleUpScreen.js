import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTripContext } from '../context/TripContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import { useTheme } from '../context/ThemeContext';

const SettleUpScreen = () => {
    const navigation = useNavigation();
    const { currentTrip } = useTripContext();
    const { theme } = useTheme();
    const styles = getStyles(theme);

    if (!currentTrip) return null;

    const calculateBalances = () => {
        const balances = {};
        const members = currentTrip.members || [];
        members.forEach(m => balances[m] = 0);

        const expenses = currentTrip.expenses || [];

        expenses.forEach(expense => {
            const amount = expense.amount;
            const paidBy = expense.paidBy;
            const splitMembers = expense.splitBetween || members;
            const splitAmount = amount / splitMembers.length;

            if (balances[paidBy] !== undefined) {
                balances[paidBy] += amount;
            }

            splitMembers.forEach(member => {
                if (balances[member] !== undefined) {
                    balances[member] -= splitAmount;
                }
            });
        });

        return balances;
    };

    const balances = calculateBalances();
    const sortedMembers = Object.keys(balances).sort((a, b) => balances[b] - balances[a]);

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settle Up</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Summary Card */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.totalLabel}>Total Trip Cost</Text>
                    <Text style={styles.totalAmount}>
                        ₹{currentTrip.expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                    </Text>
                    <View style={styles.divider} />
                    <View style={styles.avgRow}>
                        <Text style={styles.avgLabel}>Per Person</Text>
                        <Text style={styles.avgAmount}>
                            ₹{(currentTrip.expenses.reduce((sum, e) => sum + e.amount, 0) / (currentTrip.members.length || 1)).toFixed(0)}
                        </Text>
                    </View>
                </View>

                {/* Balances List */}
                <Text style={styles.sectionTitle}>Balances</Text>
                {sortedMembers.map((member) => {
                    const balance = balances[member];
                    const isOwed = balance >= 0;

                    return (
                        <View key={member} style={styles.balanceCard}>
                            <View style={styles.memberInfo}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{member[0].toUpperCase()}</Text>
                                </View>
                                <Text style={styles.memberName}>{member}</Text>
                            </View>
                            <View style={styles.balanceInfo}>
                                <Text style={[styles.balanceLabel, { color: isOwed ? theme.success : theme.error }]}>
                                    {isOwed ? 'Gets back' : 'Owes'}
                                </Text>
                                <Text style={[styles.balanceAmount, { color: isOwed ? theme.success : theme.error }]}>
                                    ₹{Math.abs(balance).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    );
                })}

                {/* Simplified Settlements Suggestion (Mock for now or simple logic) */}
                <Text style={styles.sectionTitle}>Who pays whom?</Text>
                <View style={styles.transactionCard}>
                    <Text style={{ color: theme.textSecondary, fontStyle: 'italic', textAlign: 'center' }}>
                        Settlement optimization coming soon!
                    </Text>
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
};

const getStyles = (theme) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Outfit-Bold',
        color: theme.text,
    },
    summaryContainer: {
        backgroundColor: theme.surface,
        borderRadius: 24,
        padding: 24,
        marginBottom: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
    },
    totalLabel: {
        fontSize: 14,
        color: theme.textSecondary,
        fontFamily: 'Outfit-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    totalAmount: {
        fontSize: 36,
        fontFamily: 'Outfit-Bold',
        color: theme.text,
        marginVertical: 10,
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: theme.border,
        marginVertical: 15,
    },
    avgRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    avgLabel: {
        fontSize: 16,
        color: theme.textSecondary,
        fontFamily: 'Outfit-Medium',
    },
    avgAmount: {
        fontSize: 16,
        color: theme.text,
        fontFamily: 'Outfit-Bold',
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'Outfit-Bold',
        color: theme.text,
        marginHorizontal: 20,
        marginBottom: 15,
    },
    balanceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.surfaceHighlight,
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.primary + '20', // 20% opacity 
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: theme.primary,
    },
    avatarText: {
        fontSize: 16,
        fontFamily: 'Outfit-Bold',
        color: theme.primary,
    },
    memberName: {
        fontSize: 16,
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
