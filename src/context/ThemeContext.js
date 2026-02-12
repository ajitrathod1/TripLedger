import React, { createContext, useState, useContext, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { themes } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [themeType, setThemeType] = useState('dark');
    const [theme, setTheme] = useState(themes.dark);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('themeType');
            if (savedTheme) {
                setThemeType(savedTheme);
                setTheme(themes[savedTheme]);
            }
        } catch (error) {
            console.log('Error loading theme:', error);
        }
    };

    const toggleTheme = async () => {
        const newType = themeType === 'dark' ? 'light' : 'dark';
        setThemeType(newType);
        setTheme(themes[newType]);
        try {
            await AsyncStorage.setItem('themeType', newType);
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, themeType, toggleTheme }}>
            <StatusBar
                barStyle={theme.statusBar}
                backgroundColor="transparent"
                translucent
            />
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
