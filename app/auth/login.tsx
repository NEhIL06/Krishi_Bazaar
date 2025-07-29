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
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RootState, AppDispatch } from '../../src/store';
import { login, clearError } from '../../src/store/slices/authSlice';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import CustomInput from '../../src/components/common/CustomInput';
import CustomButton from '../../src/components/common/CustomButton';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';

interface LoginFormData {
  emailOrPhone: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>();

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error);
      dispatch(clearError());
    }
  }, [error]);

  const validateEmailOrPhone = (value: string) => {
    if (loginMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) || 'Please enter a valid email address';
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      return phoneRegex.test(value) || 'Please enter a valid 10-digit phone number';
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      const credentials = {
        password: data.password,
        ...(loginMethod === 'email' 
          ? { email: data.emailOrPhone }
          : { phone: `+91${data.emailOrPhone}` }
        )
      };

      await dispatch(login(credentials)).unwrap();
    } catch (error: any) {
      console.error('Login error:', error);
      setError('emailOrPhone', { message: 'Invalid credentials' });
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="eco" size={48} color={Colors.primary[400]} />
              <Text style={styles.logoText}>Krishibazar</Text>
              <Text style={styles.logoSubtext}>कृषिबाजार</Text>
            </View>
            <Text style={styles.headerTitle}>Welcome Back!</Text>
            <Text style={styles.headerSubtitle}>
              Sign in to connect with farmers directly
            </Text>
          </View>

          {/* Login Method Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                loginMethod === 'email' && styles.toggleButtonActive,
              ]}
              onPress={() => setLoginMethod('email')}
            >
              <MaterialIcons 
                name="email" 
                size={20} 
                color={loginMethod === 'email' ? Colors.white : Colors.primary[400]} 
              />
              <Text
                style={[
                  styles.toggleText,
                  loginMethod === 'email' && styles.toggleTextActive,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                loginMethod === 'phone' && styles.toggleButtonActive,
              ]}
              onPress={() => setLoginMethod('phone')}
            >
              <MaterialIcons 
                name="phone" 
                size={20} 
                color={loginMethod === 'phone' ? Colors.white : Colors.primary[400]} 
              />
              <Text
                style={[
                  styles.toggleText,
                  loginMethod === 'phone' && styles.toggleTextActive,
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="emailOrPhone"
              rules={{
                required: `${loginMethod === 'email' ? 'Email' : 'Phone number'} is required`,
                validate: validateEmailOrPhone,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label={loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                  placeholder={
                    loginMethod === 'email' 
                      ? 'Enter your email' 
                      : 'Enter 10-digit phone number'
                  }
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.emailOrPhone?.message}
                  keyboardType={loginMethod === 'email' ? 'email-address' : 'phone-pad'}
                  autoCapitalize="none"
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.passwordContainer}>
                  <CustomInput
                    label="Password"
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
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

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => router.push('/auth/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <CustomButton
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Benefits */}
          <View style={styles.benefits}>
            <Text style={styles.benefitsTitle}>Why Choose Krishibazar?</Text>
            <View style={styles.benefitItem}>
              <MaterialIcons name="trending-down" size={20} color={Colors.success[500]} />
              <Text style={styles.benefitText}>Direct prices from farmers</Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialIcons name="eco" size={20} color={Colors.success[500]} />
              <Text style={styles.benefitText}>Fresh, quality produce</Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialIcons name="local-shipping" size={20} color={Colors.success[500]} />
              <Text style={styles.benefitText}>Direct delivery to your business</Text>
            </View>
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
    paddingTop: 40,
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary[400],
    marginTop: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: Colors.secondary[500],
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
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
  form: {
    marginBottom: 32,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary[400],
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
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
  benefits: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
});

export default LoginPage;