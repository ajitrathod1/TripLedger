import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useTripContext } from '../context/TripContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ThemedBackground from '../components/ThemedBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AddExpenseScreen = () => {
    const { addExpense, editExpense, currentTrip } = useTripContext();
    const navigation = useNavigation();
    const route = useRoute();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = getStyles(theme, insets);

    const expenseToEdit = route.params?.expenseToEdit;

    const [title, setTitle] = useState(expenseToEdit?.title || '');
    const [amount, setAmount] = useState(expenseToEdit?.amount?.toString() || '');
    const [category, setCategory] = useState(expenseToEdit?.category || 'Food');
    const [paidBy, setPaidBy] = useState(expenseToEdit?.paidBy || (currentTrip?.members[0] || ''));
    const [splitBetween, setSplitBetween] = useState(expenseToEdit?.splitBetween || (currentTrip?.members || []));
    const [isSaving, setIsSaving] = useState(false);

    const categories = [
        { name: 'Food', icon: 'restaurant' },
        { name: 'Travel', icon: 'car' },
        { name: 'Stay', icon: 'bed' },
        { name: 'Activities', icon: 'ticket' },
        { name: 'Shopping', icon: 'cart' },
        { name: 'Other', icon: 'receipt' },
    ];

    const handleSaveExpense = async () => {
        const parsedAmount = parseFloat(amount);
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
            return;
        }

        if (!paidBy) {
            Alert.alert('Missing Fields', 'Please select who paid for this expense.');
            return;
        }

        if (splitBetween.length === 0) {
            Alert.alert('Invalid Split', 'At least one person must accept the split.');
            return;
        }

        setIsSaving(true);
        try {
            const expenseData = {
                title: title.trim() || 'General Expense',
                amount: parsedAmount,
                category,
                paidBy,
                splitBetween,
                date: expenseToEdit?.date || new Date().toISOString(),
            };

            if (expenseToEdit) {
                await editExpense(expenseToEdit.id, expenseData);
            } else {
                await addExpense({ ...expenseData, id: Date.now().toString() });
            }

            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to save expense. Please try again.');
        } finally {
            setIsSaving(false);
        }
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
        <ThemedBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{expenseToEdit ? 'Edit Expense' : 'Add Expense'}</Text>
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
                            style={styles.amountInput}
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            inputContainerStyle={{ borderWidth: 0, backgroundColor: 'transparent' }}
                        />
                    </View>

                    <View style={styles.formSection}>
                        <CustomInput
                            label="Description (Optional)"
                            placeholder="What was this for?"
                            value={title}
                            onChangeText={setTitle}
                            icon="create-outline"
                            inputContainerStyle={styles.glassInput}
                            style={{ color: '#fff' }}
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            labelStyle={{ color: '#94A3B8' }}
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
                                        color={category === cat.name ? '#fff' : '#94A3B8'}
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
                                        color={paidBy === member ? '#fff' : '#94A3B8'}
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text style={[styles.memberText, paidBy === member && { color: '#fff' }]}>
                                        {currentTrip?.memberDetails?.[member]?.name || member}
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
                                        {currentTrip?.memberDetails?.[member]?.name || member}
                                    </Text>
                                    {splitBetween.includes(member) && (
                                        <Ionicons name="checkmark" size={16} color="#fff" style={{ marginLeft: 4 }} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <CustomButton
                            title={expenseToEdit ? 'Save Changes' : 'Add Expense'}
                            onPress={handleSaveExpense}
                            loading={isSaving}
                            style={styles.saveBtn}
                            textStyle={{ color: '#fff', fontSize: 18 }}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedBackground>
    );
};

const getStyles = (theme, insets) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: (insets?.top || 20) + 10, // Dynamic safe area
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
        fontSize: 20,
        fontFamily: 'Outfit-Bold',
        color: '#F8FAFC',
    },
    amountContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        flexDirection: 'row',
    },
    currencySymbol: {
        fontSize: 40,
        color: '#94A3B8',
        marginRight: 5,
        fontFamily: 'Outfit-Bold',
    },
    amountInput: {
        fontSize: 48,
        color: '#fff',
        fontFamily: 'Outfit-Bold',
        textAlign: 'center',
        minWidth: 100,
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
        minHeight: 500,
    },
    glassInput: {
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
    },
    label: {
        fontSize: 14,
        color: '#94A3B8',
        fontFamily: 'Outfit-Bold',
        marginBottom: 12,
        marginTop: 15,
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
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    selectedCategory: {
        backgroundColor: '#38BDF8',
        borderColor: '#38BDF8',
    },
    categoryText: {
        fontSize: 14,
        color: '#94A3B8',
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
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    selectedMember: {
        backgroundColor: '#8B5CF6', // Purple
        borderColor: '#8B5CF6',
    },
    memberText: {
        fontSize: 14,
        color: '#E2E8F0',
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
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    selectedSplit: {
        backgroundColor: '#10B981', // Emerald
        borderColor: '#10B981',
    },
    splitText: {
        fontSize: 13,
        color: '#E2E8F0',
        fontFamily: 'Outfit-Regular',
    },
    saveBtn: {
        marginVertical: 30,
        backgroundColor: '#38BDF8',
        shadowColor: "#38BDF8",
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 5,
    }
});

export default AddExpenseScreen;
