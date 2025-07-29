import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import GlobalStyles from '../../constants/styles';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  style?: any;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <MaterialIcons 
        name="error-outline" 
        size={48} 
        color={Colors.error[500]} 
        style={styles.icon}
      />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity 
          style={[GlobalStyles.button, styles.retryButton]} 
          onPress={onRetry}
        >
          <Text style={GlobalStyles.buttonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: Colors.error[700],
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: Colors.error[500],
  },
});

export default ErrorMessage;