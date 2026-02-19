/**
 * Utility functions for TripLedger app
 */

// ==================== DATE UTILITIES ====================

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };

    return d.toLocaleDateString('en-IN', options);
};

/**
 * Format date to short format (DD MMM)
 */
export const formatDateShort = (date) => {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    const options = {
        month: 'short',
        day: 'numeric'
    };

    return d.toLocaleDateString('en-IN', options);
};

/**
 * Get relative time (e.g., "2 days ago")
 */
export const getRelativeTime = (date) => {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return formatDate(d);
};

// ==================== CURRENCY UTILITIES ====================

/**
 * Format number as Indian currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Format number with Indian numbering system (lakhs, crores)
 */
export const formatIndianNumber = (num) => {
    if (!num) return '0';

    const x = num.toString();
    const lastThree = x.substring(x.length - 3);
    const otherNumbers = x.substring(0, x.length - 3);

    if (otherNumbers !== '') {
        return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
    }

    return lastThree;
};

/**
 * Shorten large numbers (e.g., 1500 -> 1.5K)
 */
export const shortenNumber = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num}`;
};

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate amount (positive number)
 */
export const isValidAmount = (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
};

/**
 * Validate name (at least 2 characters)
 */
export const isValidName = (name) => {
    return name && typeof name === 'string' && name.trim().length >= 2;
};

// ==================== STRING UTILITIES ====================

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
    if (!name) return '?';

    const parts = name.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// ==================== ARRAY UTILITIES ====================

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
};

/**
 * Sort array by date (newest first)
 */
export const sortByDateDesc = (array, dateKey = 'date') => {
    return [...array].sort((a, b) => {
        const dateA = new Date(a[dateKey]);
        const dateB = new Date(b[dateKey]);
        return dateB - dateA;
    });
};

// ==================== COLOR UTILITIES ====================

/**
 * Get category color
 */
export const getCategoryColor = (category) => {
    const colors = {
        Food: '#FF6B6B',
        Travel: '#4ECDC4',
        Stay: '#45B7D1',
        Entertainment: '#FFA07A',
        Shopping: '#98D8C8',
        Other: '#95A5A6'
    };

    return colors[category] || colors.Other;
};

/**
 * Get random color from palette
 */
export const getRandomColor = () => {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];

    return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Generate color from string (consistent color for same string)
 */
export const stringToColor = (str) => {
    if (!str) return '#95A5A6';

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
};

// ==================== CALCULATION UTILITIES ====================

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
};

/**
 * Calculate split amount per person
 */
export const calculateSplitAmount = (amount, numberOfPeople) => {
    if (!numberOfPeople || numberOfPeople === 0) return 0;
    return Math.round((amount / numberOfPeople) * 100) / 100;
};

/**
 * Round to 2 decimal places
 */
export const roundToTwo = (num) => {
    return Math.round(num * 100) / 100;
};

// ==================== STORAGE UTILITIES ====================

/**
 * Safe JSON parse
 */
export const safeJsonParse = (str, defaultValue = null) => {
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error('JSON Parse Error:', e);
        return defaultValue;
    }
};

/**
 * Safe JSON stringify
 */
export const safeJsonStringify = (obj, defaultValue = '{}') => {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        console.error('JSON Stringify Error:', e);
        return defaultValue;
    }
};

// ==================== DEBOUNCE & THROTTLE ====================

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function
 */
export const throttle = (func, limit = 300) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ==================== ASYNC UTILITIES ====================

/**
 * Sleep for ms
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Parse formatted number string back to number
 */
export const parseFormattedNumber = (str) => {
    if (!str) return 0;
    // Remove currency symbols and commas
    const cleanStr = str.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleanStr) || 0;
};

// ==================== EXPORT ALL ====================

export default {
    // Date
    formatDate,
    formatDateShort,
    getRelativeTime,

    // Currency
    formatCurrency,
    formatIndianNumber,
    shortenNumber,

    // Validation
    isValidEmail,
    isValidPhone,
    isValidAmount,
    isValidName,

    // String
    capitalize,
    getInitials,
    truncate,

    // Array
    groupBy,
    sortByDateDesc,

    // Color
    getCategoryColor,
    getRandomColor,
    stringToColor,

    // Calculation
    calculatePercentage,
    calculateSplitAmount,
    roundToTwo,

    // Storage
    safeJsonParse,
    safeJsonStringify,

    // Performance
    debounce,
    throttle,

    // Async
    sleep,

    // Parsers
    parseFormattedNumber
};
