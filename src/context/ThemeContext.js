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
        // Always use dark theme
        setThemeType('dark');
        setTheme(themes.dark);
    };

    // Removed toggleTheme - app is now permanently dark mode

    return (
        <ThemeContext.Provider value={{ theme, themeType, toggleTheme: () => { }, isDark: true }}>
            {/* StatusBar is handled in ScreenWrapper to prevent duplication */}
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
