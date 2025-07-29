import { StyleSheet } from 'react-native';
import Colors from './colors';

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  
  // Spacing
  padding: {
    paddingHorizontal: 16,
  },
  
  paddingLarge: {
    paddingHorizontal: 24,
  },
  
  paddingSmall: {
    paddingHorizontal: 8,
  },
  
  margin: {
    marginHorizontal: 16,
  },
  
  marginLarge: {
    marginHorizontal: 24,
  },
  
  marginSmall: {
    marginHorizontal: 8,
  },
  
  // Typography
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.text.primary,
    lineHeight: 24,
  },
  
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.text.tertiary,
    lineHeight: 16,
  },
  
  // Buttons
  button: {
    backgroundColor: Colors.primary[400],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  buttonSecondary: {
    backgroundColor: Colors.secondary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonOutline: {
    backgroundColor: Colors.transparent,
    borderWidth: 1,
    borderColor: Colors.primary[400],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonOutlineText: {
    color: Colors.primary[400],
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Cards
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  cardSmall: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Input fields
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: Colors.white,
    color: Colors.text.primary,
  },
  
  inputFocused: {
    borderColor: Colors.primary[400],
    borderWidth: 2,
  },
  
  inputError: {
    borderColor: Colors.error[500],
  },
  
  // Layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Status indicators
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  badgeSuccess: {
    backgroundColor: Colors.success[100],
  },
  
  badgeWarning: {
    backgroundColor: Colors.warning[100],
  },
  
  badgeError: {
    backgroundColor: Colors.error[100],
  },
  
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  badgeTextSuccess: {
    color: Colors.success[700],
  },
  
  badgeTextWarning: {
    color: Colors.warning[700],
  },
  
  badgeTextError: {
    color: Colors.error[700],
  },
  
  // Separators
  separator: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: 16,
  },
  
  separatorSmall: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: 8,
  },
});

export default GlobalStyles;