import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RootState, AppDispatch } from '../../src/store';
import { updateProfile } from '../../src/store/slices/authSlice';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import CustomInput from '../../src/components/common/CustomInput';
import CustomButton from '../../src/components/common/CustomButton';

interface EditProfileFormData {
  name: string;
  email: string;
  phone: string;
}

const EditProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditProfileFormData>();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone.replace('+91', ''),
      });
    }
  }, [user, reset]);

  const validatePhone = (value: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(value) || 'Please enter a valid 10-digit phone number';
  };

  const onSubmit = async (data: EditProfileFormData) => {
    if (!user) return;

    setIsSaving(true);
    try {
      await dispatch(updateProfile({
        userId: user.$id,
        updates: {
          name: data.name,
          email: data.email,
          phone: `+91${data.phone}`,
        }
      })).unwrap();

      Alert.alert(
        'Success',
        'Your profile has been updated successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

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

            <View style={styles.infoBox}>
              <MaterialIcons name="info" size={20} color={Colors.primary[400]} />
              <Text style={styles.infoText}>
                Changes to your email or phone number may require verification.
              </Text>
            </View>

            <CustomButton
              title="Save Changes"
              onPress={handleSubmit(onSubmit)}
              loading={isSaving}
              disabled={isSaving}
              style={styles.saveButton}
            />
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
  },
  form: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary[700],
    marginLeft: 8,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 8,
  },
});

export default EditProfilePage;