export const themes = {
  dark: {
    type: 'dark',
    primary: '#00C896',    // Cyan/Teal
    secondary: '#FF7D54',  // Coral Orange
    background: '#0F172A', // Deep Navy
    surface: 'rgba(255, 255, 255, 0.1)', // Glass
    surfaceHighlight: 'rgba(255, 255, 255, 0.2)',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    border: 'rgba(255, 255, 255, 0.1)',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    white: '#FFFFFF',
    gray: '#94A3B8',
    iconDefault: '#FFFFFF',

    // Gradients
    gradientStart: '#0F172A',
    gradientEnd: '#1E293B',

    // Status Bar
    statusBar: 'light-content',
    statusBarStyle: 'light',

    // Legacy glass helper (optional, but better to use surface)
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
    },

    shadowConfig: {
      shadowColor: '#00C896',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2, // Softer shadow
      shadowRadius: 15,
      elevation: 8,
    }
  },
  light: {
    type: 'light',
    primary: '#00C896',    // Keep Brand Color
    secondary: '#FF7D54',  // Keep Brand Color
    background: '#F0F4F8', // Alice Blue / Light Gray
    surface: '#FFFFFF',    // Clean White Cards
    surfaceHighlight: '#F8FAFC',
    text: '#1E293B',       // Slate 800
    textSecondary: '#64748B', // Slate 500
    border: '#E2E8F0',     // Light Border
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    white: '#FFFFFF',
    gray: '#94A3B8',
    iconDefault: '#1E293B',

    // Gradients (Subtle Light)
    gradientStart: '#F0F4F8',
    gradientEnd: '#E2E8F0',

    // Status Bar
    statusBar: 'dark-content',
    statusBarStyle: 'dark',

    glass: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E2E8F0',
      borderWidth: 1,
    },

    shadowConfig: {
      shadowColor: '#94A3B8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    }
  }
};

// Default export for backward compatibility relative to imports, 
// though we should switch to Context.
export const colors = themes.dark;
