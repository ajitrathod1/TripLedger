import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedBackground from '../components/ThemedBackground';
import { StatusBar } from 'expo-status-bar';
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

    const balances = useMemo(() => {
        const bals = {};
        const members = currentTrip.members || [];
        members.forEach(m => bals[m] = 0);

        const expenses = currentTrip.expenses || [];

        expenses.forEach(expense => {
            const amount = expense.amount;
            const paidBy = expense.paidBy;
            const splitMembers = (expense.splitBetween && expense.splitBetween.length > 0) ? expense.splitBetween : members;

            // Ensure payer is in balances
            if (bals[paidBy] === undefined) bals[paidBy] = 0;
            bals[paidBy] += amount;

            // Prevent division by zero
            const count = splitMembers.length || 1;
            const splitAmount = amount / count;

            splitMembers.forEach(member => {
                // Ensure splitter is in balances
                if (bals[member] === undefined) bals[member] = 0;
                bals[member] -= splitAmount;
            });
        });

        return bals;
    }, [currentTrip.expenses, currentTrip.members]);

    const sortedMembers = useMemo(() => {
        return Object.keys(balances).sort((a, b) => balances[b] - balances[a]);
    }, [balances]);

    const settlements = useMemo(() => {
        let debtors = [];
        let creditors = [];

        // Separate into two lists
        Object.keys(balances).forEach(person => {
            const amount = balances[person];
            if (amount < -0.01) debtors.push({ name: person, amount });
            else if (amount > 0.01) creditors.push({ name: person, amount });
        });

        // Sort by magnitude to minimize transactions (simple heuristic)
        debtors.sort((a, b) => a.amount - b.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        let transactions = [];
        let indexDebtor = 0;
        let indexCreditor = 0;

        while (indexDebtor < debtors.length && indexCreditor < creditors.length) {
            let debtor = debtors[indexDebtor];
            let creditor = creditors[indexCreditor];

            // The amount to settle is the minimum of what debtor owes and creditor is owed
            let amount = Math.min(Math.abs(debtor.amount), creditor.amount);

            // Create transaction
            transactions.push({
                from: debtor.name,
                to: creditor.name,
                amount: amount
            });

            // Update remaining amounts
            debtor.amount += amount;
            creditor.amount -= amount;

            // Move indices if settled
            if (Math.abs(debtor.amount) < 0.01) indexDebtor++;
            if (creditor.amount < 0.01) indexCreditor++;
        }

        return transactions;
    }, [balances]);

    const handleShare = async () => {
        try {
            let message = `*Trip Summary: ${currentTrip.name}*\n`;
            message += `📍 ${currentTrip.destination}\n\n`;

            const totalCost = currentTrip.expenses.reduce((sum, e) => sum + e.amount, 0);
            const perPerson = totalCost / (currentTrip.members.length || 1);

            message += `💰 Total Cost: ₹${totalCost.toLocaleString()}\n`;
            message += `👥 Per Person: ₹${perPerson.toFixed(0)}\n\n`;

            message += `*Settlements (Who pays whom):*\n`;
            if (settlements.length > 0) {
                settlements.forEach(s => {
                    message += `➡️ ${s.from} pays ${s.to}: ₹${s.amount.toFixed(0)}\n`;
                });
            } else {
                message += `✅ All settled up!\n`;
            }

            message += `\n📅 Generated on: ${new Date().toLocaleDateString()}\n`;
            message += `Sent via TripKaHisab ✈️`;

            await Share.share({
                message: message,
            });
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    return (
        <ThemedBackground>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settle Up</Text>
                <TouchableOpacity onPress={handleShare} style={styles.backButton}>
                    <Ionicons name="share-social-outline" size={22} color="#fff" />
                </TouchableOpacity>
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
                                <View style={[styles.avatar, { borderColor: isOwed ? '#10B981' : '#EF4444' }]}>
                                    <Text style={[styles.avatarText, { color: isOwed ? '#10B981' : '#EF4444' }]}>
                                        {(currentTrip.memberDetails?.[member]?.name || member)[0].toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.memberName}>{currentTrip.memberDetails?.[member]?.name || member}</Text>
                            </View>
                            <View style={styles.balanceInfo}>
                                <Text style={[styles.balanceLabel, { color: isOwed ? '#10B981' : '#EF4444' }]}>
                                    {isOwed ? 'Gets back' : 'Owes'}
                                </Text>
                                <Text style={[styles.balanceAmount, { color: isOwed ? '#10B981' : '#EF4444' }]}>
                                    ₹{Math.abs(balance).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    );
                })}

                {/* Settlements List */}
                <Text style={styles.sectionTitle}>Who pays whom?</Text>
                {settlements.length > 0 ? (
                    settlements.map((item, index) => (
                        <View key={index} style={styles.transactionCard}>
                            <View style={styles.transactionRow}>
                                <View style={styles.payerContainer}>
                                    <View style={[styles.miniAvatar, { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#EF4444' }]}>
                                        <Text style={[styles.miniAvatarText, { color: '#EF4444' }]}>
                                            {(currentTrip.memberDetails?.[item.from]?.name || item.from)[0].toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={styles.transName}>{currentTrip.memberDetails?.[item.from]?.name || item.from}</Text>
                                </View>

                                <View style={styles.arrowContainer}>
                                    <Text style={styles.payText}>pays</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
                                    <Text style={styles.payAmount}>₹{item.amount.toFixed(0)}</Text>
                                </View>

                                <View style={styles.payeeContainer}>
                                    <View style={[styles.miniAvatar, { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10B981' }]}>
                                        <Text style={[styles.miniAvatarText, { color: '#10B981' }]}>
                                            {(currentTrip.memberDetails?.[item.to]?.name || item.to)[0].toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={styles.transName}>{currentTrip.memberDetails?.[item.to]?.name || item.to}</Text>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.settledContainer}>
                        <Ionicons name="checkmark-done-circle" size={80} color="#10B981" />
                        <Text style={styles.settledText}>Whatever happens here...</Text>
                        <Text style={styles.settledSubText}>is fully settled! 🎉 No debts remaining.</Text>
                    </View>
                )}

            </ScrollView>
        </ThemedBackground>
    );
};

const getStyles = (theme) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
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
        fontSize: 24,
        fontFamily: 'Outfit-Bold',
        color: '#F8FAFC',
    },
    summaryContainer: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)', // Glass
        borderRadius: 24,
        padding: 24,
        marginBottom: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 20,
    },
    totalLabel: {
        fontSize: 14,
        color: '#94A3B8',
        fontFamily: 'Outfit-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    totalAmount: {
        fontSize: 36,
        fontFamily: 'Outfit-Bold',
        color: '#F8FAFC',
        marginVertical: 10,
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 15,
    },
    avgRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    avgLabel: {
        fontSize: 16,
        color: '#94A3B8',
        fontFamily: 'Outfit-Medium',
    },
    avgAmount: {
        fontSize: 16,
        color: '#F8FAFC',
        fontFamily: 'Outfit-Bold',
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'Outfit-Bold',
        color: '#F8FAFC',
        marginHorizontal: 20,
        marginBottom: 15,
    },
    balanceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
    },
    avatarText: {
        fontSize: 16,
        fontFamily: 'Outfit-Bold',
    },
    memberName: {
        fontSize: 16,
        color: '#E2E8F0',
        fontFamily: 'Outfit-SemiBold',
    },
    balanceInfo: {
        alignItems: 'flex-end',
    },
    balanceLabel: {
        fontSize: 12,
        fontFamily: 'Outfit-Regular',
        marginBottom: 2,
    },
    balanceAmount: {
        fontSize: 16,
        fontFamily: 'Outfit-Bold',
    },
    transactionCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    transactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    payerContainer: {
        alignItems: 'center',
        width: '30%',
    },
    payeeContainer: {
        alignItems: 'center',
        width: '30%',
    },
    miniAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 4,
    },
    miniAvatarText: {
        fontSize: 12,
        fontFamily: 'Outfit-Bold',
    },
    transName: {
        fontSize: 12,
        color: '#E2E8F0',
        fontFamily: 'Outfit-Medium',
        textAlign: 'center',
    },
    arrowContainer: {
        alignItems: 'center',
        width: '40%',
    },
    payText: {
        fontSize: 10,
        color: '#94A3B8',
        fontFamily: 'Outfit-Regular',
        marginBottom: 2,
    },
    payAmount: {
        fontSize: 16,
        fontFamily: 'Outfit-Bold',
        color: '#F8FAFC',
        marginTop: 2,
    },
    settledContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    settledText: {
        fontSize: 18,
        fontFamily: 'Outfit-Bold',
        color: '#10B981',
        marginTop: 10,
    },
    settledSubText: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 5,
    }
});

export default SettleUpScreen;

