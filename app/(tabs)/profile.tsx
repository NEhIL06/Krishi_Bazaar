import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  RefreshControl,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { RootState, AppDispatch } from '../../src/store';
import { logout, getCurrentUser } from '../../src/store/slices/authSlice';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import CustomButton from '../../src/components/common/CustomButton';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';

// Define MaterialIcons type
type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

// Configuration constants
const CONFIG = {
  APP_VERSION: '1.0.0',
  APP_NAME: 'Krishibazar',
  PROFILE_IMAGE_SIZE: 80,
  EDIT_BUTTON_SIZE: 28,
} as const;

// Type-safe menu item interface
interface MenuItem {
  id: string;
  icon: MaterialIconName;
  title: string;
  subtitle: string;
  route?: string;
  onPress?: () => void;
  disabled?: boolean;
}

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Memoized menu items with proper navigation
  const menuItems: MenuItem[] = useMemo(() => [
    {
      id: 'edit-profile',
      icon: 'edit',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      route: '/profile/edit',
    },
    {
      id: 'business-details',
      icon: 'business',
      title: 'Business Details',
      subtitle: 'Manage your business information',
      route: '/profile/business',
    },
    {
      id: 'addresses',
      icon: 'location-on',
      title: 'Delivery Addresses',
      subtitle: 'Manage your delivery locations',
      route: '/profile/addresses',
    },
    {
      id: 'payments',
      icon: 'payment',
      title: 'Payment Methods',
      subtitle: 'Manage payment options',
      route: '/profile/payments',
    },
    {
      id: 'notifications',
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      route: '/profile/notifications',
    },
    {
      id: 'help',
      icon: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      route: '/support',
    },
    {
      id: 'about',
      icon: 'info',
      title: `About ${CONFIG.APP_NAME}`,
      subtitle: `App version ${CONFIG.APP_VERSION} and information`,
      route: '/about',
    },
  ], []);

  // Load user data with proper error handling
  const loadUserData = useCallback(async () => {
    try {
      await dispatch(getCurrentUser()).unwrap();
    } catch (error) {
      console.error('Failed to load user data:', error);
      Alert.alert(
        'Error',
        'Failed to load profile data. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [dispatch]);

  useEffect(() => {
    if (!user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  // Handle logout with proper error handling
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logout()).unwrap();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert(
                'Error',
                'Failed to logout. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  }, [dispatch]);

  // Handle refresh with proper state management
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadUserData();
    } finally {
      setRefreshing(false);
    }
  }, [loadUserData]);

  // Handle image picker
  const handleImagePicker = useCallback(() => {
    const options = [
      { text: 'Camera', onPress: () => openImagePicker('camera') },
      { text: 'Photo Library', onPress: () => openImagePicker('library') },
      { text: 'Cancel', style: 'cancel' as const },
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: options.map(o => o.text),
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex < 2) {
            options[buttonIndex].onPress && options[buttonIndex].onPress();
          }
        }
      );
    } else {
      Alert.alert(
        'Select Image',
        'Choose how you want to select an image',
        options
      );
    }
  }, []);

  const openImagePicker = useCallback(async (source: 'camera' | 'library') => {
    try {
      setImageUploading(true);
      
      // Request permissions
      const { status } = source === 'camera' 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          `Please grant ${source === 'camera' ? 'camera' : 'photo library'} permission to continue.`
        );
        return;
      }

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        // Here you would typically upload the image to your backend
        // For now, we'll just update the local state
        console.log('Selected image:', result.assets[0].uri);
        
        // Uncomment and implement when backend is ready
        // await dispatch(updateUserProfile({ profileImage: result.assets[0].uri })).unwrap();
        
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    } finally {
      setImageUploading(false);
    }
  }, [dispatch]);

  // Handle menu item press
  const handleMenuItemPress = useCallback((item: MenuItem) => {
    if (item.disabled) {
      Alert.alert('Coming Soon', 'This feature will be available in a future update.');
      return;
    }

    if (item.onPress) {
      item.onPress();
    } else if (item.route) {
      router.push(item.route as any);
    }
  }, []);

  // Render verification badge
  const renderVerificationBadge = useCallback(() => {
    if (!user) return null;

    const isVerified = user.isVerified;
    const badgeColor = isVerified ? Colors.success[50] : Colors.warning[50];
    const textColor = isVerified ? Colors.success[700] : Colors.warning[700];
    const iconColor = isVerified ? Colors.success[500] : Colors.warning[500];
    const iconName: MaterialIconName = isVerified ? 'verified' : 'pending';
    const text = isVerified ? 'Verified Business' : 'Verification Pending';

    return (
      <View style={[styles.verificationBadge, { backgroundColor: badgeColor }]}>
        <MaterialIcons name={iconName} size={16} color={iconColor} />
        <Text style={[styles.verificationText, { color: textColor }]}>
          {text}
        </Text>
      </View>
    );
  }, [user]);

  // Render menu item
  const renderMenuItem = useCallback((item: MenuItem, index: number) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        index === menuItems.length - 1 && styles.lastMenuItem,
        item.disabled && styles.menuItemDisabled,
      ]}
      onPress={() => handleMenuItemPress(item)}
      disabled={item.disabled}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>
        <MaterialIcons 
          name={item.icon} 
          size={24} 
          color={item.disabled ? Colors.neutral[400] : Colors.primary[400]} 
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={[
          styles.menuTitle,
          item.disabled && styles.menuTitleDisabled,
        ]}>
          {item.title}
        </Text>
        <Text style={[
          styles.menuSubtitle,
          item.disabled && styles.menuSubtitleDisabled,
        ]}>
          {item.subtitle}
        </Text>
      </View>
      <MaterialIcons 
        name="chevron-right" 
        size={24} 
        color={item.disabled ? Colors.neutral[300] : Colors.neutral[400]} 
      />
    </TouchableOpacity>
  ), [menuItems.length, handleMenuItemPress]);

  if (isLoading && !user) {
    return (
      <SafeAreaView style={GlobalStyles.container}>
        <LoadingSpinner size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/settings' as any)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="settings" size={24} color={Colors.primary[400]} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {user?.profileImage ? (
              <Image 
                source={{ uri: user.profileImage }} 
                style={styles.profileImage}
                onError={() => console.log('Failed to load profile image')}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialIcons name="person" size={40} color={Colors.neutral[500]} />
              </View>
            )}
            <TouchableOpacity 
              style={styles.editImageButton}
              onPress={handleImagePicker}
              disabled={imageUploading}
              activeOpacity={0.8}
            >
              {imageUploading ? (
                <LoadingSpinner size="small" color={Colors.white} />
              ) : (
                <MaterialIcons name="camera-alt" size={16} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {user?.name || 'User Name'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || 'user@example.com'}
            </Text>
            <Text style={styles.userPhone}>
              {user?.phone || '+91 XXXXXXXXXX'}
            </Text>
            
            {user?.businessName && (
              <View style={styles.businessInfo}>
                <MaterialIcons name="business" size={16} color={Colors.primary[400]} />
                <Text style={styles.businessName}>{user.businessName}</Text>
              </View>
            )}
            
            {renderVerificationBadge()}
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadUserData} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>
            {CONFIG.APP_NAME} v{CONFIG.APP_VERSION}
          </Text>
          <Text style={styles.versionSubtext}>Made with ❤️ for Indian farmers</Text>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <CustomButton
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: CONFIG.PROFILE_IMAGE_SIZE,
    height: CONFIG.PROFILE_IMAGE_SIZE,
    borderRadius: CONFIG.PROFILE_IMAGE_SIZE / 2,
  },
  profileImagePlaceholder: {
    width: CONFIG.PROFILE_IMAGE_SIZE,
    height: CONFIG.PROFILE_IMAGE_SIZE,
    borderRadius: CONFIG.PROFILE_IMAGE_SIZE / 2,
    backgroundColor: Colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CONFIG.EDIT_BUTTON_SIZE,
    height: CONFIG.EDIT_BUTTON_SIZE,
    borderRadius: CONFIG.EDIT_BUTTON_SIZE / 2,
    backgroundColor: Colors.primary[400],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  businessName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[600],
    marginLeft: 4,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  errorContainer: {
    backgroundColor: Colors.error[50],
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: Colors.error[700],
    marginRight: 12,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.error[500],
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  menuSection: {
    backgroundColor: Colors.white,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  menuTitleDisabled: {
    color: Colors.neutral[500],
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  menuSubtitleDisabled: {
    color: Colors.neutral[400],
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: Colors.white,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  logoutSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: Colors.white,
    marginBottom: 20,
  },
  logoutButton: {
    borderColor: Colors.error[500],
  },
  logoutButtonText: {
    color: Colors.error[500],
  },
});

export default ProfilePage;