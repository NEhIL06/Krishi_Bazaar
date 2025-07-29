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

interface BusinessFormData {
  businessName: string;
  gstNumber: string;
}

const BusinessDetailsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BusinessFormData>();

  useEffect(() => {
    if (user) {
      reset({
        businessName: user.businessName || '',
        gstNumber: user.gstNumber || '',
      });
    }
  }, [user, reset]);

  const validateGST = (value: string) => {
    if (!value) return 'GST number is required';
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(value) || 'Please enter a valid GST number';
  };

  const onSubmit = async (data: BusinessFormData) => {
    if (!user) return;

    setIsSaving(true);
    try {
      await dispatch(updateProfile({
        userId: user.$id,
        updates: {
          businessName: data.businessName,
          gstNumber: data.gstNumber,
        }
      })).unwrap();

      Alert.alert(
        'Success',
        'Your business details have been updated successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update business details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyBusiness = () => {
    Alert.alert(
      'Business Verification',
      'Business verification helps build trust with farmers and may unlock additional features. Would you like to start the verification process?',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Start Verification', onPress: () => {
          // In a real app, this would start the verification process
          Alert.alert('Coming Soon', 'Business verification feature will be available soon.');
        }}
      ]
    );
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
          <Text style={styles.headerTitle}>Business Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Verification Status */}
          <View style={styles.verificationCard}>
            <View style={styles.verificationHeader}>
              <MaterialIcons 
                name={user?.isVerified ? "verified" : "pending"} 
                size={24} 
                color={user?.isVerified ? Colors.success[500] : Colors.warning[500]} 
              />
              <Text style={styles.verificationTitle}>
                {user?.isVerified ? 'Verified Business' : 'Verification Pending'}
              </Text>
            </View>
            <Text style={styles.verificationDescription}>
              {user?.isVerified 
                ? 'Your business has been verified. This helps build trust with farmers.'
                : 'Complete your business details and verify your business to unlock all features.'
              }
            </Text>
            {!user?.isVerified && (
              <CustomButton
                title="Start Verification"
                onPress={handleVerifyBusiness}
                variant="outline"
                style={styles.verifyButton}
              />
            )}
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Business Information</Text>

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
              rules={{ validate: validateGST }}
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

            <View style={styles.infoBox}>
              <MaterialIcons name="info" size={20} color={Colors.primary[400]} />
              <Text style={styles.infoText}>
                Your GST number is used for business verification and generating invoices. 
                Make sure it's accurate as it cannot be changed easily later.
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

          {/* Business Benefits */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Benefits of Business Verification</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <MaterialIcons name="verified" size={20} color={Colors.success[500]} />
                <Text style={styles.benefitText}>Verified badge on your profile</Text>
              </View>
              <View style={styles.benefitItem}>
                <MaterialIcons name="trending-up" size={20} color={Colors.success[500]} />
                <Text style={styles.benefitText}>Higher priority in search results</Text>
              </View>
              <View style={styles.benefitItem}>
                <MaterialIcons name="security" size={20} color={Colors.success[500]} />
                <Text style={styles.benefitText}>Increased trust from farmers</Text>
              </View>
              <View style={styles.benefitItem}>
                <MaterialIcons name="receipt" size={20} color={Colors.success[500]} />
                <Text style={styles.benefitText}>GST invoices for all purchases</Text>
              </View>
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
  verificationCard: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  verificationDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  verifyButton: {
    alignSelf: 'flex-start',
  },
  form: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
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
  benefitsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
});

export default BusinessDetailsPage;