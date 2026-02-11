import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { useTripContext } from '../context/TripContext';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
    { id: 'Travel', icon: 'airplane' },
    { id: 'Food', icon: 'fast-food' },
    { id: 'Stay', icon: 'bed' },
    { id: 'Activities', icon: 'camera' },
    { id: 'Shopping', icon: 'cart' },
    { id: 'Other', icon: 'options' }
];

const AddExpenseScreen = () => {
    const navigation = useNavigation();
    const { addExpense, currentTrip } = useTripContext();

    if (!currentTrip) return null;

    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
    const [paidBy, setPaidBy] = useState(currentTrip?.members[0] || 'You');

    const handleAddExpense = () => {
        if (!amount) {
            Alert.alert('Enter Amount', 'Please enter a valid amount');
            return;
        }

        addExpense({
            title: note || selectedCategory,
            amount: parseFloat(amount),
            category: selectedCategory,
            paidBy,
        });

        navigation.goBack();
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Add Expense</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.amountContainer}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                        style={styles.amountInput}
                        placeholder="0"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholderTextColor={colors.gray}
                        autoFocus
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Category</Text>
                    <View style={styles.chipsContainer}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.chip,
                                    selectedCategory === cat.id && styles.activeChip
                                ]}
                                onPress={() => setSelectedCategory(cat.id)}
                            >
                                <Ionicons
                                    name={cat.icon}
                                    size={18}
                                    color={selectedCategory === cat.id ? colors.white : colors.text}
                                />
                                <Text style={[
                                    styles.chipText,
                                    selectedCategory === cat.id && styles.activeChipText
                                ]}>{cat.id}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Paid By</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {currentTrip?.members.map((member) => (
                            <TouchableOpacity
                                key={member}
                                style={[
                                    styles.memberChip,
                                    paidBy === member && styles.activeMemberChip
                                ]}
                                onPress={() => setPaidBy(member)}
                            >
                                <Ionicons name="person-circle-outline" size={20} color={paidBy === member ? colors.white : colors.primary} />
                                <Text style={[
                                    styles.memberText,
                                    paidBy === member && styles.activeMemberText
                                ]}>{member}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <CustomInput
                    label="Description (Optional)"
                    placeholder="Dinner at Fisherman's Wharf"
                    value={note}
                    onChangeText={setNote}
                    multiline
                />

                <CustomButton title="Add Expense" onPress={handleAddExpense} />
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
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 30,
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        marginRight: 8,
    },
    amountInput: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.text,
        minWidth: 100,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 12,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activeChip: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        marginLeft: 6,
        color: colors.text,
        fontSize: 14,
    },
    activeChipText: {
        color: colors.white,
    },
    memberChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    activeMemberChip: {
        backgroundColor: colors.primary,
    },
    memberText: {
        marginLeft: 6,
        color: colors.primary,
        fontWeight: '600',
    },
    activeMemberText: {
        color: colors.white,
    }
});

export default AddExpenseScreen;
