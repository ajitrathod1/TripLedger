export const themes = {
  dark: {
    type: 'dark',
    primary: '#00C896',    // Reverted to Teal
    secondary: '#FF7D54',  // Reverted to Coral Orange
    background: '#0F172A', // Reverted to Deep Navy
    surface: 'rgba(255, 255, 255, 0.05)', // Keep Ultra-Fine Glass from new theme
    surfaceHighlight: 'rgba(255, 255, 255, 0.12)',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    border: 'rgba(255, 255, 255, 0.15)', // Keep Crisp Border
    success: '#34D399',    // Reverted
    error: '#F87171',      // Reverted
    warning: '#FBBF24',    // Reverted
    info: '#60A5FA',       // Reverted
    white: '#FFFFFF',
    gray: '#94A3B8',
    iconDefault: '#FFFFFF',
    overlay: 'rgba(15, 23, 42, 0.8)',
    transparent: 'transparent',

    // Gradients
    gradientStart: '#0F172A',
    gradientEnd: '#1E293B',

    // Status Bar
    statusBar: 'light-content',
    statusBarStyle: 'light',

    // Legacy glass helper
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 1,
    },

    shadowConfig: {
      shadowColor: '#00C896',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
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
    overlay: 'rgba(255, 255, 255, 0.8)',
    transparent: 'transparent',

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
