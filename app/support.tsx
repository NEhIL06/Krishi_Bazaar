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

const SupportPage: React.FC = () => {
  const handleContactSupport = () => {
    // This would open email or phone in a real app
    Alert.alert(
      'Contact Support',
      'Support features will be available in a future update. For now, please use the app feedback option.',
      [{ text: 'OK' }]
    );
  };

  const handleFAQ = () => {
    Alert.alert(
      'FAQ',
      'Frequently Asked Questions will be available in a future update.',
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Coming Soon Section */}
        <View style={styles.comingSoonContainer}>
          <MaterialIcons 
            name="support-agent" 
            size={80} 
            color={Colors.primary[400]} 
          />
          <Text style={styles.comingSoonTitle}>Support Coming Soon!</Text>
          <Text style={styles.comingSoonSubtitle}>
            Comprehensive help and support features will be available in a future update
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={Colors.success[500]} />
              <Text style={styles.featureText}>24/7 Customer Support</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={Colors.success[500]} />
              <Text style={styles.featureText}>Live Chat Support</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={Colors.success[500]} />
              <Text style={styles.featureText}>FAQ Section</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={Colors.success[500]} />
              <Text style={styles.featureText}>Video Tutorials</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={Colors.success[500]} />
              <Text style={styles.featureText}>Order Tracking Help</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color={Colors.success[500]} />
              <Text style={styles.featureText}>Payment Issue Resolution</Text>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Need Immediate Help?</Text>
            <Text style={styles.contactText}>
              For urgent issues, please contact us through the app feedback or email us directly.
            </Text>
            
            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
                <MaterialIcons name="email" size={20} color={Colors.white} />
                <Text style={styles.contactButtonText}>Contact Support</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.contactButton, styles.secondaryButton]} onPress={handleFAQ}>
                <MaterialIcons name="help" size={20} color={Colors.primary[600]} />
                <Text style={[styles.contactButtonText, styles.secondaryButtonText]}>View FAQ</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  comingSoonSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  featuresList: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  contactSection: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButtons: {
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[600],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  secondaryButton: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  contactButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: Colors.primary[600],
  },
});

export default SupportPage; 