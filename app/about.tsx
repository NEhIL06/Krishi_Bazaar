import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '../src/constants/colors';
import GlobalStyles from '../src/constants/styles';

const AboutPage: React.FC = () => {
  const appInfo = {
    name: 'Krishibazar',
    version: '1.0.0',
    description: 'Connecting Indian farmers with buyers for better agricultural commerce',
    tagline: 'Empowering Indian Agriculture',
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Privacy Policy will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      'Terms of Service will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleContactUs = () => {
    Alert.alert(
      'Contact Us',
      'Contact information will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

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
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* App Info Section */}
        <View style={styles.appInfoSection}>
          <View style={styles.appIconContainer}>
            <MaterialIcons 
              name="agriculture" 
              size={80} 
              color={Colors.primary[400]} 
            />
          </View>
          
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.appVersion}>Version {appInfo.version}</Text>
          <Text style={styles.appTagline}>{appInfo.tagline}</Text>
          
          <Text style={styles.appDescription}>
            {appInfo.description}
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <MaterialIcons name="store" size={24} color={Colors.primary[400]} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Direct Farm-to-Table</Text>
                <Text style={styles.featureDescription}>
                  Connect directly with farmers for fresh, quality produce
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialIcons name="verified" size={24} color={Colors.primary[400]} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Verified Farmers</Text>
                <Text style={styles.featureDescription}>
                  All farmers are verified and quality-checked
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialIcons name="local-shipping" size={24} color={Colors.primary[400]} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Reliable Delivery</Text>
                <Text style={styles.featureDescription}>
                  Fast and secure delivery to your doorstep
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialIcons name="support-agent" size={24} color={Colors.primary[400]} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>24/7 Support</Text>
                <Text style={styles.featureDescription}>
                  Round-the-clock customer support
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.legalSection}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity style={styles.legalItem} onPress={handlePrivacyPolicy}>
            <MaterialIcons name="privacy-tip" size={20} color={Colors.text.secondary} />
            <Text style={styles.legalText}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.legalItem} onPress={handleTermsOfService}>
            <MaterialIcons name="description" size={20} color={Colors.text.secondary} />
            <Text style={styles.legalText}>Terms of Service</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact</Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleContactUs}>
            <MaterialIcons name="email" size={20} color={Colors.text.secondary} />
            <Text style={styles.contactText}>Contact Us</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for Indian farmers
          </Text>
          <Text style={styles.copyrightText}>
            © 2024 Krishibazar. All rights reserved.
          </Text>
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
    padding: 20,
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 32,
  },
  appIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: Colors.primary[600],
    fontWeight: '600',
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  featuresSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  legalSection: {
    marginBottom: 32,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  legalText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
  },
  contactSection: {
    marginBottom: 32,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
  },
  contactText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});

export default AboutPage; 