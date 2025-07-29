import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import CustomInput from '../../src/components/common/CustomInput';
import CustomButton from '../../src/components/common/CustomButton';
import { account } from '../../src/config/appwrite';

interface ForgotPasswordFormData {
  emailOrPhone: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [resetMethod, setResetMethod] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<ForgotPasswordFormData>();

  const newPassword = watch('newPassword');

  const validateEmailOrPhone = (value: string) => {
    if (resetMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) || 'Please enter a valid email address';
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      return phoneRegex.test(value) || 'Please enter a valid 10-digit phone number';
    }
  };

  const sendResetCode = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      if (resetMethod === 'email') {
        // For email reset - in a real app, you'd implement email recovery
        Alert.alert(
          'Reset Code Sent',
          'A password reset code has been sent to your email address.',
          [{ text: 'OK', onPress: () => setStep('otp') }]
        );
      } else {
        // For phone reset - simulate OTP sending
        Alert.alert(
          'OTP Sent',
          'An OTP has been sent to your phone number.',
          [{ text: 'OK', onPress: () => setStep('otp') }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // In a real app, you'd verify the OTP here
      if (!data.otp || data.otp.length !== 6) {
        setError('otp', { message: 'Please enter a valid 6-digit OTP' });
        return;
      }
      
      Alert.alert(
        'OTP Verified',
        'OTP verified successfully. You can now reset your password.',
        [{ text: 'OK', onPress: () => setStep('reset') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ForgotPasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you'd reset the password here
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now login with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <>
      <Text style={styles.stepTitle}>Reset Your Password</Text>
      <Text style={styles.stepDescription}>
        Enter your email address or phone number to receive a reset code
      </Text>

      {/* Method Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            resetMethod === 'email' && styles.toggleButtonActive,
          ]}
          onPress={() => setResetMethod('email')}
        >
          <MaterialIcons 
            name="email" 
            size={20} 
            color={resetMethod === 'email' ? Colors.white : Colors.primary[400]} 
          />
          <Text
            style={[
              styles.toggleText,
              resetMethod === 'email' && styles.toggleTextActive,
            ]}
          >
            Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            resetMethod === 'phone' && styles.toggleButtonActive,
          ]}
          onPress={() => setResetMethod('phone')}
        >
          <MaterialIcons 
            name="phone" 
            size={20} 
            color={resetMethod === 'phone' ? Colors.white : Colors.primary[400]} 
          />
          <Text
            style={[
              styles.toggleText,
              resetMethod === 'phone' && styles.toggleTextActive,
            ]}
          >
            Phone
          </Text>
        </TouchableOpacity>
      </View>

      <Controller
        control={control}
        name="emailOrPhone"
        rules={{
          required: `${resetMethod === 'email' ? 'Email' : 'Phone number'} is required`,
          validate: validateEmailOrPhone,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            label={resetMethod === 'email' ? 'Email Address' : 'Phone Number'}
            placeholder={
              resetMethod === 'email' 
                ? 'Enter your email' 
                : 'Enter 10-digit phone number'
            }
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.emailOrPhone?.message}
            keyboardType={resetMethod === 'email' ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            required
          />
        )}
      />

      <CustomButton
        title="Send Reset Code"
        onPress={handleSubmit(sendResetCode)}
        loading={isLoading}
        disabled={isLoading}
        style={styles.submitButton}
      />
    </>
  );

  const renderOTPStep = () => (
    <>
      <Text style={styles.stepTitle}>Enter Verification Code</Text>
      <Text style={styles.stepDescription}>
        We've sent a verification code to your {resetMethod}
      </Text>

      <Controller
        control={control}
        name="otp"
        rules={{
          required: 'OTP is required',
          minLength: {
            value: 6,
            message: 'OTP must be 6 digits',
          },
          maxLength: {
            value: 6,
            message: 'OTP must be 6 digits',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            label="Verification Code"
            placeholder="Enter 6-digit code"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.otp?.message}
            keyboardType="numeric"
            maxLength={6}
            required
          />
        )}
      />

      <View style={styles.buttonRow}>
        <CustomButton
          title="Back"
          onPress={() => setStep('email')}
          variant="outline"
          style={styles.backButton}
        />
        <CustomButton
          title="Verify Code"
          onPress={handleSubmit(verifyOTP)}
          loading={isLoading}
          disabled={isLoading}
          style={styles.submitButton}
        />
      </View>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={() => Alert.alert('Code Resent', 'A new verification code has been sent')}
      >
        <Text style={styles.resendText}>Didn't receive the code? Resend</Text>
      </TouchableOpacity>
    </>
  );

  const renderResetStep = () => (
    <>
      <Text style={styles.stepTitle}>Create New Password</Text>
      <Text style={styles.stepDescription}>
        Enter your new password below
      </Text>

      <Controller
        control={control}
        name="newPassword"
        rules={{
          required: 'New password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.passwordContainer}>
            <CustomInput
              label="New Password"
              placeholder="Enter new password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.newPassword?.message}
              secureTextEntry={!showPassword}
              required
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={24}
                color={Colors.neutral[500]}
              />
            </TouchableOpacity>
          </View>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        rules={{
          required: 'Please confirm your password',
          validate: (value) => value === newPassword || 'Passwords do not match',
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.passwordContainer}>
            <CustomInput
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
              secureTextEntry={!showConfirmPassword}
              required
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <MaterialIcons
                name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                size={24}
                color={Colors.neutral[500]}
              />
            </TouchableOpacity>
          </View>
        )}
      />

      <CustomButton
        title="Reset Password"
        onPress={handleSubmit(resetPassword)}
        loading={isLoading}
        disabled={isLoading}
        style={styles.submitButton}
      />
    </>
  );

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButtonHeader}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color={Colors.primary[400]} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <MaterialIcons name="eco" size={32} color={Colors.primary[400]} />
              <Text style={styles.logoText}>Krishibazar</Text>
            </View>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { 
                    width: step === 'email' ? '33%' : step === 'otp' ? '66%' : '100%'
                  },
                ]}
              />
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {step === 'email' && renderEmailStep()}
            {step === 'otp' && renderOTPStep()}
            {step === 'reset' && renderResetStep()}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButtonHeader: {
    position: 'absolute',
    left: 0,
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary[400],
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[400],
    borderRadius: 2,
  },
  form: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary[400],
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary[400],
    marginLeft: 8,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 38,
    padding: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
  resendButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    color: Colors.primary[400],
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  footerLink: {
    fontSize: 16,
    color: Colors.primary[400],
    fontWeight: '600',
  },
});

export default ForgotPasswordPage;