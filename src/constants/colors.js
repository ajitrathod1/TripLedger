export const colors = {
  primary: '#7F5AF0', // Vivid Purple
  secondary: '#2Cb67D',
  background: '#16161a', // Very Dark
  surface: '#242629',    // Dark Gray Card
  text: '#fffffe',       // White
  textSecondary: '#94a1b2', // Grayish Blue
  border: '#010101',
  success: '#2Cb67D',
  error: '#ef4565',
  warning: '#ff8906',
  info: '#3da9fc',
  white: '#fffffe',
  gray: '#94a1b2',
  darkGray: '#242629',
  lightGray: '#16161a',
  gradientStart: '#16161a', // Using solid like gradient for consistency
  gradientEnd: '#242629',
  // Reverting "glass" to be a Solid Card style for better readability
  glass: {
    backgroundColor: '#242629', // Solid Card Color
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  shadowConfig: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  }
};
