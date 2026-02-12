import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { useTripContext } from '../context/TripContext';
import { Ionicons } from '@expo/vector-icons';

const CreateTripScreen = () => {
    const navigation = useNavigation();
    const { addTrip } = useTripContext();

    const [tripName, setTripName] = useState('');
    const [destination, setDestination] = useState('');
    const [budget, setBudget] = useState('');
    const [coverImage, setCoverImage] = useState(null); // Default no image

    // Member State
    const [memberCount, setMemberCount] = useState('');
    const [members, setMembers] = useState([]);

    const handleMemberCountChange = (text) => {
        setMemberCount(text);
        const count = parseInt(text);
        if (!isNaN(count) && count > 0) {
            const newMembers = Array(count).fill('');
            // Preserve existing names if reducing/increasing count
            members.forEach((name, i) => {
                if (i < count) newMembers[i] = name;
            });
            setMembers(newMembers);
        } else {
            setMembers([]);
        }
    };

    const handleMemberNameChange = (text, index) => {
        const updatedMembers = [...members];
        updatedMembers[index] = text;
        setMembers(updatedMembers);
    };

    const handleCreateTrip = () => {
        if (!tripName || !destination || !budget) {
            Alert.alert('Missing Fields', 'Please fill all required trip details');
            return;
        }

        if (members.length === 0 || members.some(m => !m.trim())) {
            Alert.alert('Members Missing', 'Please enter names for all travelers.');
            return;
        }

        const tripData = {
            name: tripName,
            destination,
            totalBudget: parseFloat(budget),
            members: members,
            coverImage: coverImage // Save selected image (or null)
        };

        addTrip(tripData);
        navigation.navigate('TripSummary');
    };

    const PRESET_COVERS = [
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500', // Nature
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500', // City
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', // Beach
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500', // Mountains
        'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500', // Party
    ];

    return (
        <ScreenWrapper>
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color={colors.text} />
                    </TouchableOpacity>
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

                    {/* Member Count Input */}
                    <CustomInput
                        label="Number of Travelers"
                        placeholder="Enter count (e.g. 4)"
                        value={memberCount}
                        onChangeText={handleMemberCountChange}
                        keyboardType="numeric"
                        icon="people-outline"
                    />

                    {/* Dynamic Member Name Inputs */}
                    {members.length > 0 && (
                        <View style={styles.membersSection}>
                            <Text style={styles.sectionTitle}>Who is going?</Text>
                            {members.map((member, index) => (
                                <CustomInput
                                    key={index}
                                    label={`Traveler ${index + 1}`}
                                    placeholder={`Name of person ${index + 1}`}
                                    value={member}
                                    onChangeText={(text) => handleMemberNameChange(text, index)}
                                    icon="person-outline"
                                />
                            ))}
                        </View>
                    )}

                    <CustomInput
                        label="Total Budget"
                        placeholder="₹ 50,000"
                        value={budget}
                        onChangeText={setBudget}
                        keyboardType="numeric"
                        icon="wallet-outline"
                    />

                    {/* Cover Image Selection */}
                    <View style={styles.coverSection}>
                        <Text style={styles.sectionTitle}>Trip Cover Photo (Optional)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
                            {PRESET_COVERS.map((img, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => setCoverImage(img)}
                                    style={[styles.coverOption, coverImage === img && styles.selectedCover]}
                                >
                                    <Image source={{ uri: img }} style={styles.coverThumb} />
                                    {coverImage === img && (
                                        <View style={styles.checkIcon}>
                                            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                            {/* No Image Option */}
                            <TouchableOpacity
                                onPress={() => setCoverImage(null)}
                                style={[styles.coverOption, !coverImage && styles.selectedCover, styles.noImageOption]}
                            >
                                <Ionicons name="image-outline" size={24} color="#666" />
                                <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>None</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    <CustomButton title="Create Trip" onPress={handleCreateTrip} />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    backButton: {
        zIndex: 10,
        padding: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        flex: 1,
        marginRight: 30, // Balance back button
    },
    form: {
        ...colors.glass,
        padding: 20,
        marginBottom: 40,
    },
    membersSection: {
        marginVertical: 10,
        backgroundColor: 'rgba(0,0,0,0.04)',
        padding: 15,
        borderRadius: 12,
    },
    sectionTitle: {
        color: colors.textSecondary,
        marginBottom: 10,
        fontSize: 14,
        fontWeight: 'bold',
    },
    coverSection: {
        marginTop: 10,
        marginBottom: 30,
    },
    coverOption: {
        width: 100,
        height: 70,
        borderRadius: 12,
        marginRight: 10,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        backgroundColor: '#eee',
    },
    selectedCover: {
        borderColor: colors.primary,
        borderWidth: 3,
    },
    coverThumb: {
        width: '100%',
        height: '100%',
    },
    noImageOption: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
    },
    checkIcon: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 2,
    }
});

export default CreateTripScreen;
