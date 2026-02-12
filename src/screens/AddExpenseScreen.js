import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useTripContext } from '../context/TripContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const AddExpenseScreen = () => {
    const { addExpense, currentTrip } = useTripContext();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [paidBy, setPaidBy] = useState(currentTrip?.members[0] || '');
    const [splitBetween, setSplitBetween] = useState(currentTrip?.members || []);

    const categories = [
        { name: 'Food', icon: 'restaurant' },
        { name: 'Travel', icon: 'car' },
        { name: 'Stay', icon: 'bed' },
        { name: 'Activities', icon: 'ticket' },
        { name: 'Shopping', icon: 'cart' },
        { name: 'Other', icon: 'receipt' },
    ];

    const handleAddExpense = () => {
        if (!amount || !paidBy) {
            Alert.alert('Missing Fields', 'Please fill in the amount and who paid.');
            return;
        }

        const expense = {
            id: Date.now().toString(),
            title: title.trim() || 'General Expense',
            amount: parseFloat(amount),
            category,
            paidBy,
            splitBetween,
            date: new Date().toISOString(),
        };

        addExpense(currentTrip.id, expense);
        navigation.goBack();
    };

    const toggleSplitMember = (member) => {
        if (splitBetween.includes(member)) {
            if (splitBetween.length > 1) {
                setSplitBetween(splitBetween.filter(m => m !== member));
            } else {
                Alert.alert('Error', 'At least one person must split the expense.');
            }
        } else {
            setSplitBetween([...splitBetween, member]);
        }
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="close" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Expense</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* Amount Input */}
                    <View style={styles.amountContainer}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <CustomInput
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0"
                            keyboardType="numeric"
                            style={styles.amountInput} // Need to pass style prop to input if supported or modify CustomInput
                        // CustomInput might need update to accept style override properly for this big font
                        />
                    </View>

                    {/* Temporarily using a direct heavy input for amount to match design intention if CustomInput is limited, 
                        BUT assuming CustomInput is flexible based on previous usage. 
                        Let's just use CustomInput normally for now but style the container.
                     */}

                    <View style={styles.formSection}>
                        <CustomInput
                            label="Description (Optional)"
                            placeholder="What was this for?"
                            value={title}
                            onChangeText={setTitle}
                            icon="create-outline"
                        />

                        <CustomInput
                            label="Amount"
                            placeholder="0.00"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            icon="cash-outline"
                        />

                        {/* Category Selection */}
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.categoryContainer}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.name}
                                    style={[styles.categoryChip, category === cat.name && styles.selectedCategory]}
                                    onPress={() => setCategory(cat.name)}
                                >
                                    <Ionicons
                                        name={cat.icon}
                                        size={18}
                                        color={category === cat.name ? '#fff' : theme.textSecondary}
                                    />
                                    <Text style={[styles.categoryText, category === cat.name && { color: '#fff' }]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Paid By */}
                        <Text style={styles.label}>Paid By</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {currentTrip?.members.map((member) => (
                                <TouchableOpacity
                                    key={member}
                                    style={[styles.memberChip, paidBy === member && styles.selectedMember]}
                                    onPress={() => setPaidBy(member)}
                                >
                                    <Ionicons
                                        name="person-circle"
                                        size={20}
                                        color={paidBy === member ? '#fff' : theme.textSecondary}
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text style={[styles.memberText, paidBy === member && { color: '#fff' }]}>
                                        {member}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Split By */}
                        <Text style={styles.label}>Split Between</Text>
                        <View style={styles.splitList}>
                            <TouchableOpacity
                                style={[styles.splitOption, splitBetween.length === currentTrip?.members.length && styles.selectedSplit]}
                                onPress={() => setSplitBetween(currentTrip?.members)}
                            >
                                <Text style={[styles.splitText, splitBetween.length === currentTrip?.members.length && { color: '#fff' }]}>
                                    Everyone
                                </Text>
                            </TouchableOpacity>
                            {currentTrip?.members.map((member) => (
                                <TouchableOpacity
                                    key={member}
                                    style={[styles.splitOption, splitBetween.includes(member) && !((splitBetween.length === currentTrip?.members.length)) && styles.selectedSplit]}
                                    onPress={() => toggleSplitMember(member)}
                                >
                                    <Text style={[styles.splitText, splitBetween.includes(member) && !((splitBetween.length === currentTrip?.members.length)) && { color: '#fff' }]}>
                                        {member}
                                    </Text>
                                    {splitBetween.includes(member) && (
                                        <Ionicons name="checkmark" size={16} color="#fff" style={{ marginLeft: 4 }} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <CustomButton
                            title="Add Expense"
                            onPress={handleAddExpense}
                            style={{ marginVertical: 20 }}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        fontSize: 20,
        fontFamily: 'Outfit-Bold',
        color: theme.text,
    },
    amountContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    currencySymbol: {
        fontSize: 24,
        color: theme.textSecondary,
        marginBottom: 5,
        fontFamily: 'Outfit-Bold',
    },
    amountInput: {
        fontSize: 40,
        color: theme.text,
        fontFamily: 'Outfit-Bold',
        textAlign: 'center',
    },
    formSection: {
        backgroundColor: theme.surface,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
        borderWidth: 1,
        borderColor: theme.border,
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: theme.textSecondary,
        fontFamily: 'Outfit-Medium',
        marginBottom: 12,
        marginTop: 10,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 15,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surfaceHighlight,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
    },
    selectedCategory: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
    },
    categoryText: {
        fontSize: 14,
        color: theme.textSecondary,
        marginLeft: 6,
        fontFamily: 'Outfit-Medium',
    },
    horizontalScroll: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    memberChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surfaceHighlight,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: theme.border,
    },
    selectedMember: {
        backgroundColor: theme.secondary,
        borderColor: theme.secondary,
    },
    memberText: {
        fontSize: 14,
        color: theme.text,
        fontFamily: 'Outfit-Medium',
    },
    splitList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    splitOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surfaceHighlight,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
    },
    selectedSplit: {
        backgroundColor: theme.success,
        borderColor: theme.success,
    },
    splitText: {
        fontSize: 13,
        color: theme.text,
        fontFamily: 'Outfit-Regular',
    }
});

export default AddExpenseScreen;
