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
import { register, clearError } from '../../src/store/slices/authSlice';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import CustomInput from '../../src/components/common/CustomInput';
import CustomButton from '../../src/components/common/CustomButton';

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  gstNumber: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<RegisterFormData>();

  const password = watch('password');

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error);
      dispatch(clearError());
    }
  }, [error]);

  const validateGST = (value: string) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(value) || 'Please enter a valid GST number';
  };

  const validatePhone = (value: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(value) || 'Please enter a valid 10-digit phone number';
  };

  const validatePincode = (value: string) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(value) || 'Please enter a valid 6-digit pincode';
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }

    try {
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: `+91${data.phone}`,
        businessName: data.businessName,
        gstNumber: data.gstNumber,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: 'India',
        },
        location: {
          latitude: 0, // Will be updated with actual location
          longitude: 0,
        },
      };

      await dispatch(register(userData)).unwrap();
    } catch (error: any) {
      console.error('Registration error:', error);
    }
  };

  const renderStep1 = () => (
    <>
      <Controller
        control={control}
        name="name"
        rules={{ required: 'Full name is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            label="Full Name"
            placeholder="Enter your full name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
            required
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            label="Email Address"
            placeholder="Enter your email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        rules={{
          required: 'Phone number is required',
          validate: validatePhone,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            label="Phone Number"
            placeholder="Enter 10-digit phone number"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.phone?.message}
            keyboardType="phone-pad"
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

      <Controller
        control={control}
        name="confirmPassword"
        rules={{
          required: 'Please confirm your password',
          validate: (value) => value === password || 'Passwords do not match',
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.passwordContainer}>
            <CustomInput
              label="Confirm Password"
              placeholder="Confirm your password"
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
    </>
  );

  const renderStep2 = () => (
    <>
      <Controller
        control={control}
        name="businessName"
        rules={{ required: 'Business name is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            label="Business Name"
            placeholder="Enter your business name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.businessName?.message}
            required
          />
        )}
      />

      <Controller
        control={control}
        name="gstNumber"
        rules={{
          required: 'GST number is required',
          validate: validateGST,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            label="GST Number"
            placeholder="Enter GST number (e.g., 22AAAAA0000A1Z5)"
            value={value}
            onChangeText={(text) => onChange(text.toUpperCase())}
            onBlur={onBlur}
            error={errors.gstNumber?.message}
            autoCapitalize="characters"
            required
          />
        )}
      />

      <Controller
        control={control}
        name="street"
        rules={{ required: 'Street address is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            label="Street Address"
            placeholder="Enter your street address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.street?.message}
            required
          />
        )}
      />

      <View style={styles.row}>
        <Controller
          control={control}
          name="city"
          rules={{ required: 'City is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="City"
              placeholder="Enter city"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.city?.message}
              containerStyle={styles.halfWidth}
              required
            />
          )}
        />

        <Controller
          control={control}
          name="state"
          rules={{ required: 'State is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput
              label="State"
              placeholder="Enter state"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.state?.message}
              containerStyle={styles.halfWidth}
              required
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="pincode"
        rules={{
          required: 'Pincode is required',
          validate: validatePincode,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            label="Pincode"
            placeholder="Enter 6-digit pincode"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.pincode?.message}
            keyboardType="numeric"
            required
          />
        )}
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
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color={Colors.primary[400]} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <MaterialIcons name="eco" size={32} color={Colors.primary[400]} />
              <Text style={styles.logoText}>Krishibazar</Text>
            </View>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>
              Join the agricultural marketplace
            </Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentStep / 2) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Step {currentStep} of 2
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {currentStep === 1 ? renderStep1() : renderStep2()}

            {currentStep === 1 ? (
              <CustomButton
                title="Next"
                onPress={() => setCurrentStep(2)}
                style={styles.nextButton}
              />
            ) : (
              <View style={styles.buttonRow}>
                <CustomButton
                  title="Back"
                  onPress={() => setCurrentStep(1)}
                  variant="outline"
                  style={styles.backButtonForm}
                />
                <CustomButton
                  title="Create Account"
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.submitButton}
                />
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
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
  backButton: {
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
    marginBottom: 16,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary[400],
    marginTop: 4,
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
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[400],
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  nextButton: {
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  backButtonForm: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
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

export default RegisterPage;