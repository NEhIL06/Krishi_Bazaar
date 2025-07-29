import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RootState, AppDispatch } from '../../src/store';
import { logout, getCurrentUser } from '../../src/store/slices/authSlice';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import CustomButton from '../../src/components/common/CustomButton';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(getCurrentUser());
    }
  }, []);

  const handleLogout = () => {
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
              await dispatch(logout());
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getCurrentUser());
    setRefreshing(false);
  };

  const menuItems = [
    {
      icon: 'edit',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => router.push('/profile/edit'),
    },
    {
      icon: 'business',
      title: 'Business Details',
      subtitle: 'Manage your business information',
      onPress: () => router.push('/profile/business'),
    },
    {
      icon: 'location-on',
      title: 'Delivery Addresses',
      subtitle: 'Manage your delivery locations',
      onPress: () => router.push('/profile/addresses'),
    },
    {
      icon: 'payment',
      title: 'Payment Methods',
      subtitle: 'Manage payment options',
      onPress: () => router.push('/profile/payments'),
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      onPress: () => router.push('/profile'),
    },
    {
      icon: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => router.push('/profile'),
    },
    {
      icon: 'info',
      title: 'About Krishibazar',
      subtitle: 'App version and information',
      onPress: () => router.push('/profile'),
    },
  ];

  if (isLoading && !user) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/profile')}
          >
            <MaterialIcons name="settings" size={24} color={Colors.primary[400]} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialIcons name="person" size={40} color={Colors.neutral[500]} />
              </View>
            )}
            <TouchableOpacity style={styles.editImageButton}>
              <MaterialIcons name="camera-alt" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            <Text style={styles.userPhone}>{user?.phone || '+91 XXXXXXXXXX'}</Text>
            
            {user?.businessName && (
              <View style={styles.businessInfo}>
                <MaterialIcons name="business" size={16} color={Colors.primary[400]} />
                <Text style={styles.businessName}>{user.businessName}</Text>
              </View>
            )}
            
            {user?.isVerified ? (
              <View style={styles.verificationBadge}>
                <MaterialIcons name="verified" size={16} color={Colors.success[500]} />
                <Text style={styles.verificationText}>Verified Business</Text>
              </View>
            ) : (
              <View style={styles.verificationBadge}>
                <MaterialIcons name="pending" size={16} color={Colors.warning[500]} />
                <Text style={[styles.verificationText, { color: Colors.warning[700] }]}>
                  Verification Pending
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <MaterialIcons name={item.icon as any} size={24} color={Colors.primary[400]} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.neutral[400]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Krishibazar v1.0.0</Text>
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
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
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
    backgroundColor: Colors.success[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success[700],
    marginLeft: 4,
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
  menuSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
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