import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { useTripContext } from '../context/TripContext';

const CreateTripScreen = () => {
    const navigation = useNavigation();
    const { addTrip } = useTripContext();

    const [tripName, setTripName] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');

    const handleCreateTrip = () => {
        if (!tripName || !destination || !budget) {
            Alert.alert('Missing Fields', 'Please fill all required fields');
            return;
        }

        const tripData = {
            name: tripName,
            destination,
            startDate,
            endDate,
            totalBudget: parseFloat(budget)
        };

        addTrip(tripData);
        navigation.navigate('TripSummary');
    };

    return (
        <ScreenWrapper>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Trip</Text>
                </View>

                <View style={styles.form}>
                    <CustomInput
                        label="Trip Name"
                        placeholder="e.g. Goa Getaway"
                        value={tripName}
                        onChangeText={setTripName}
                    />
                    <CustomInput
                        label="Destination"
                        placeholder="Enter destination"
                        value={destination}
                        onChangeText={setDestination}
                        icon="location-outline"
                    />

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <CustomInput
                                label="Start Date"
                                placeholder="DD/MM/YYYY"
                                value={startDate}
                                onChangeText={setStartDate}
                                icon="calendar-outline"
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <CustomInput
                                label="End Date"
                                placeholder="DD/MM/YYYY"
                                value={endDate}
                                onChangeText={setEndDate}
                                icon="calendar-outline"
                            />
                        </View>
                    </View>

                    <CustomInput
                        label="Total Budget"
                        placeholder="₹ 50,000"
                        value={budget}
                        onChangeText={setBudget}
                        keyboardType="numeric"
                        icon="wallet-outline"
                    />

                    <CustomButton title="Create Trip" onPress={handleCreateTrip} />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: 30,
        marginTop: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
    },
    form: {
        ...colors.glass,
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    }
});

export default CreateTripScreen;
