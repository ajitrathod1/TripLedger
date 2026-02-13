import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, ImageBackground, Dimensions, LayoutAnimation, Platform, UIManager } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { useTripContext } from '../context/TripContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedBackground from '../components/ThemedBackground';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CreateTripScreen = ({ route }) => {
    const navigation = useNavigation();
    const { addTrip, updateTrip } = useTripContext();
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const [tripToEdit, setTripToEdit] = useState(null);

    const [tripName, setTripName] = useState('');
    const [destination, setDestination] = useState('');
    const [budget, setBudget] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [members, setMembers] = useState(['']); // Start with one empty member slot

    const PRESET_COVERS = [
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop', // Nature
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop', // Beach
        'https://images.unsplash.com/photo-1499856871940-a09627c6d7db?q=80&w=2020&auto=format&fit=crop', // Historic/City
        'https://images.unsplash.com/photo-1504609773096-104ff100aaa4?q=80&w=2070&auto=format&fit=crop', // Adventure
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop', // Luxury
    ];

    useEffect(() => {
        if (route.params && route.params.tripToEdit) {
            const t = route.params.tripToEdit;
            setTripToEdit(t);
            setTripName(t.name);
            setDestination(t.destination);
            setBudget(t.totalBudget ? t.totalBudget.toString() : '');
            setCoverImage(t.coverImage);
            setMembers(t.members && t.members.length > 0 ? t.members : ['']);
        } else {
            resetForm();
        }
    }, [route.params]);

    const resetForm = () => {
        setTripToEdit(null);
        setTripName('');
        setDestination('');
        setBudget('');
        setCoverImage(PRESET_COVERS[0]); // Default to first image
        setMembers(['']);
    };

    const handleAddMember = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMembers([...members, '']);
    };

    const handleRemoveMember = (index) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newMembers = [...members];
        newMembers.splice(index, 1);
        setMembers(newMembers);
    };

    const handleMemberNameChange = (text, index) => {
        const newMembers = [...members];
        newMembers[index] = text;
        setMembers(newMembers);
    };

    const handleCreateTrip = () => {
        if (!tripName || !destination || !budget) {
            Alert.alert('Missing Fields', 'Please fill all required trip details');
            return;
        }

        const validMembers = members.filter(m => m.trim() !== '');
        if (validMembers.length === 0) {
            Alert.alert('Members Missing', 'Please add at least one traveler.');
            return;
        }

        const tripData = {
            name: tripName,
            destination,
            totalBudget: parseFloat(budget),
            members: validMembers,
            coverImage: coverImage || PRESET_COVERS[0]
        };

        if (tripToEdit) {
            updateTrip(tripToEdit.id, tripData);
            Alert.alert("Success", "Trip updated successfully!");
        } else {
            addTrip(tripData);
        }
        navigation.goBack();
    };

    return (
        <ThemedBackground>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <View style={styles.backButtonGlass}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.screenTitle}>{tripToEdit ? 'Edit Trip' : 'Plan a New Trip'}</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Main Glass Form */}
                <View style={styles.glassForm}>
                    <LinearGradient
                        colors={['rgba(30, 41, 59, 0.7)', 'rgba(30, 41, 59, 0.4)']}
                        style={StyleSheet.absoluteFill}
                    />

                    {/* Cover Image Selector */}
                    <Text style={styles.label}>Choose a Vibe</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coverScroll}>
                        {PRESET_COVERS.map((img, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => setCoverImage(img)}
                                activeOpacity={0.8}
                                style={[styles.coverOption, coverImage === img && styles.selectedCover]}
                            >
                                <Image source={{ uri: img }} style={styles.coverImage} />
                                {coverImage === img && (
                                    <View style={styles.checkIcon}>
                                        <Ionicons name="checkmark-circle" size={24} color="#38BDF8" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Input Fields */}
                    <CustomInput
                        label="Trip Name"
                        placeholder="e.g. Summer in Goa"
                        value={tripName}
                        onChangeText={setTripName}
                        inputContainerStyle={styles.transparentInput}
                        style={{ color: '#fff' }}
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        labelStyle={{ color: '#94A3B8' }}
                    />
                    <CustomInput
                        label="Destination"
                        placeholder="Where are you going?"
                        value={destination}
                        onChangeText={setDestination}
                        icon="location-outline"
                        inputContainerStyle={styles.transparentInput}
                        style={{ color: '#fff' }}
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        labelStyle={{ color: '#94A3B8' }}
                    />
                    <CustomInput
                        label="Total Budget"
                        placeholder="₹ 50,000"
                        value={budget}
                        onChangeText={setBudget}
                        keyboardType="numeric"
                        icon="wallet-outline"
                        inputContainerStyle={styles.transparentInput}
                        style={{ color: '#fff' }}
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        labelStyle={{ color: '#94A3B8' }}
                    />

                    {/* Dynamic Members Section */}
                    <View style={styles.membersHeader}>
                        <Text style={styles.label}>Who's Coming?</Text>
                        <TouchableOpacity onPress={handleAddMember} style={styles.addMemberBtn}>
                            <Ionicons name="add" size={16} color="#fff" />
                            <Text style={styles.addMemberText}>Add</Text>
                        </TouchableOpacity>
                    </View>

                    {members.map((member, index) => (
                        <View key={index} style={styles.memberRow}>
                            <View style={{ flex: 1 }}>
                                <CustomInput
                                    placeholder={`Traveler ${index + 1} Name`}
                                    value={member}
                                    onChangeText={(text) => handleMemberNameChange(text, index)}
                                    icon="person-outline"
                                    inputContainerStyle={styles.transparentInput}
                                    style={{ color: '#fff' }}
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                />
                            </View>
                            {index > 0 && (
                                <TouchableOpacity onPress={() => handleRemoveMember(index)} style={styles.removeMemberBtn}>
                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <CustomButton
                        title={tripToEdit ? "Update Trip" : "Let's Go!"}
                        onPress={handleCreateTrip}
                        style={styles.createButton}
                        textStyle={{ color: '#fff', fontSize: 18 }}
                    />

                </View>
            </ScrollView>
        </ThemedBackground>
    );
};

const getStyles = (theme) => StyleSheet.create({
    orb: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        marginBottom: 20,
    },
    backButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    backButtonGlass: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    screenTitle: {
        fontSize: 24,
        fontFamily: 'Outfit-Bold',
        color: '#F8FAFC',
    },
    glassForm: {
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(15, 23, 42, 0.5)', // Fallback
    },
    label: {
        color: '#94A3B8',
        fontSize: 14,
        fontFamily: 'Outfit-Bold',
        marginBottom: 12,
        marginTop: 5,
    },
    coverScroll: {
        marginBottom: 20,
    },
    coverOption: {
        width: 100,
        height: 70,
        borderRadius: 12,
        marginRight: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    selectedCover: {
        borderColor: '#38BDF8',
        borderWidth: 3,
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    checkIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    transparentInput: {
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
    },
    membersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    addMemberBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#38BDF8',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    addMemberText: {
        fontSize: 12,
        fontFamily: 'Outfit-Bold',
        color: '#fff',
        marginLeft: 4,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    removeMemberBtn: {
        marginLeft: 10,
        width: 40,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    createButton: {
        marginTop: 30,
        backgroundColor: '#38BDF8',
        shadowColor: "#38BDF8",
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 5,
    }
});

export default CreateTripScreen;
