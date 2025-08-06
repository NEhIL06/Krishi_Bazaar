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

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const DeliveryAddressesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>();

  useEffect(() => {
    if (user?.address) {
      reset({
        street: user.street || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        country: user.country || 'India',
      });
    }
  }, [user, reset]);

  const validatePincode = (value: string) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(value) || 'Please enter a valid 6-digit pincode';
  };

  const onSubmit = async (data: AddressFormData) => {
    if (!user) return;

    setIsSaving(true);
    try {
      await dispatch(updateProfile({
        userId: user.$id,
        updates: {
            street: data.street,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            country: "India",
        }
      })).unwrap();

      Alert.alert(
        'Success',
        'Your delivery address has been updated successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetCurrentLocation = () => {
    Alert.alert(
      'Get Current Location',
      'This feature will use your device location to automatically fill the address fields.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Allow', onPress: () => {
          // In a real app, you would use location services here
          Alert.alert('Coming Soon', 'Location services will be available soon.');
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
          <Text style={styles.headerTitle}>Delivery Addresses</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Location Button */}
          <View style={styles.locationCard}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleGetCurrentLocation}
            >
              <MaterialIcons name="my-location" size={24} color={Colors.primary[400]} />
              <View style={styles.locationText}>
                <Text style={styles.locationTitle}>Use Current Location</Text>
                <Text style={styles.locationSubtitle}>
                  Automatically fill address using GPS
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Primary Delivery Address</Text>

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
                  multiline
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

            <View style={styles.row}>
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
                    containerStyle={styles.halfWidth}
                    required
                  />
                )}
              />

              <Controller
                control={control}
                name="country"
                rules={{ required: 'Country is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    label="Country"
                    placeholder="Enter country"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.country?.message}
                    containerStyle={styles.halfWidth}
                    required
                  />
                )}
              />
            </View>

            <View style={styles.infoBox}>
              <MaterialIcons name="info" size={20} color={Colors.primary[400]} />
              <Text style={styles.infoText}>
                This address will be used as the default delivery location for all your orders. 
                You can change it for individual orders during checkout.
              </Text>
            </View>

            <CustomButton
              title="Save Address"
              onPress={handleSubmit(onSubmit)}
              loading={isSaving}
              disabled={isSaving}
              style={styles.saveButton}
            />
          </View>

          {/* Address Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Address Tips</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <MaterialIcons name="location-on" size={16} color={Colors.primary[400]} />
                <Text style={styles.tipText}>
                  Provide complete address including landmarks for easy delivery
                </Text>
              </View>
              <View style={styles.tipItem}>
                <MaterialIcons name="access-time" size={16} color={Colors.primary[400]} />
                <Text style={styles.tipText}>
                  Ensure someone is available at the address during delivery hours
                </Text>
              </View>
              <View style={styles.tipItem}>
                <MaterialIcons name="phone" size={16} color={Colors.primary[400]} />
                <Text style={styles.tipText}>
                  Keep your phone number updated for delivery coordination
                </Text>
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
  locationCard: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  locationText: {
    flex: 1,
    marginLeft: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  locationSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
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
  tipsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});

export default DeliveryAddressesPage;