import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import CustomButton from '../../src/components/common/CustomButton';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'bank';
  title: string;
  subtitle: string;
  icon: string;
  isDefault: boolean;
}

const PaymentMethodsPage: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'upi',
      title: 'UPI',
      subtitle: 'farmer@paytm',
      icon: 'account-balance-wallet',
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      title: 'Credit Card',
      subtitle: '**** **** **** 1234',
      icon: 'credit-card',
      isDefault: false,
    },
  ]);

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose a payment method to add',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'UPI', onPress: () => addUPIMethod() },
        { text: 'Credit/Debit Card', onPress: () => addCardMethod() },
        { text: 'Bank Account', onPress: () => addBankMethod() },
      ]
    );
  };

  const addUPIMethod = () => {
    Alert.prompt(
      'Add UPI ID',
      'Enter your UPI ID',
      (upiId) => {
        if (upiId && upiId.includes('@')) {
          const newMethod: PaymentMethod = {
            id: Date.now().toString(),
            type: 'upi',
            title: 'UPI',
            subtitle: upiId,
            icon: 'account-balance-wallet',
            isDefault: paymentMethods.length === 0,
          };
          setPaymentMethods([...paymentMethods, newMethod]);
          Alert.alert('Success', 'UPI ID added successfully');
        } else {
          Alert.alert('Error', 'Please enter a valid UPI ID');
        }
      },
      'plain-text',
      '',
      'email-address'
    );
  };

  const addCardMethod = () => {
    Alert.alert('Coming Soon', 'Credit/Debit card integration will be available soon.');
  };

  const addBankMethod = () => {
    Alert.alert('Coming Soon', 'Bank account integration will be available soon.');
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === methodId,
      }))
    );
    Alert.alert('Success', 'Default payment method updated');
  };

  const handleRemoveMethod = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method?.isDefault && paymentMethods.length > 1) {
      Alert.alert(
        'Cannot Remove',
        'You cannot remove the default payment method. Please set another method as default first.'
      );
      return;
    }

    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(methods => methods.filter(m => m.id !== methodId));
            Alert.alert('Success', 'Payment method removed');
          }
        }
      ]
    );
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method.id} style={styles.paymentMethodCard}>
      <View style={styles.methodHeader}>
        <View style={styles.methodIcon}>
          <MaterialIcons name={method.icon as any} size={24} color={Colors.primary[400]} />
        </View>
        <View style={styles.methodInfo}>
          <Text style={styles.methodTitle}>{method.title}</Text>
          <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
        </View>
        {method.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>

      <View style={styles.methodActions}>
        {!method.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(method.id)}
          >
            <Text style={styles.actionText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => handleRemoveMethod(method.id)}
        >
          <Text style={[styles.actionText, styles.removeText]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={GlobalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Methods List */}
        <View style={styles.methodsList}>
          <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
          {paymentMethods.length > 0 ? (
            paymentMethods.map(renderPaymentMethod)
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="payment" size={64} color={Colors.neutral[400]} />
              <Text style={styles.emptyText}>No payment methods added</Text>
              <Text style={styles.emptySubtext}>
                Add a payment method to make purchases easier
              </Text>
            </View>
          )}
        </View>

        {/* Add Payment Method */}
        <View style={styles.addMethodCard}>
          <CustomButton
            title="Add Payment Method"
            onPress={handleAddPaymentMethod}
            style={styles.addButton}
          />
        </View>

        {/* Payment Security */}
        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>Payment Security</Text>
          <View style={styles.securityFeatures}>
            <View style={styles.securityFeature}>
              <MaterialIcons name="security" size={20} color={Colors.success[500]} />
              <Text style={styles.securityText}>256-bit SSL encryption</Text>
            </View>
            <View style={styles.securityFeature}>
              <MaterialIcons name="verified-user" size={20} color={Colors.success[500]} />
              <Text style={styles.securityText}>PCI DSS compliant</Text>
            </View>
            <View style={styles.securityFeature}>
              <MaterialIcons name="lock" size={20} color={Colors.success[500]} />
              <Text style={styles.securityText}>Secure payment processing</Text>
            </View>
          </View>
        </View>

        {/* Supported Payment Methods */}
        <View style={styles.supportedCard}>
          <Text style={styles.supportedTitle}>Supported Payment Methods</Text>
          <View style={styles.supportedMethods}>
            <View style={styles.supportedMethod}>
              <MaterialIcons name="account-balance-wallet" size={32} color={Colors.primary[400]} />
              <Text style={styles.supportedText}>UPI</Text>
            </View>
            <View style={styles.supportedMethod}>
              <MaterialIcons name="credit-card" size={32} color={Colors.primary[400]} />
              <Text style={styles.supportedText}>Cards</Text>
            </View>
            <View style={styles.supportedMethod}>
              <MaterialIcons name="account-balance" size={32} color={Colors.primary[400]} />
              <Text style={styles.supportedText}>Net Banking</Text>
            </View>
            <View style={styles.supportedMethod}>
              <MaterialIcons name="account-balance-wallet" size={32} color={Colors.primary[400]} />
              <Text style={styles.supportedText}>Wallets</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  methodsList: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  paymentMethodCard: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  methodSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: Colors.success[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success[700],
  },
  methodActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  removeButton: {
    backgroundColor: Colors.error[50],
  },
  removeText: {
    color: Colors.error[600],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  addMethodCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  addButton: {
    backgroundColor: Colors.primary[400],
  },
  securityCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  securityFeatures: {
    gap: 12,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 8,
  },
  supportedCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  supportedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  supportedMethods: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  supportedMethod: {
    alignItems: 'center',
  },
  supportedText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
});

export default PaymentMethodsPage;