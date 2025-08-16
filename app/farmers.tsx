import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { databases, DATABASE_ID, COLLECTION_IDS, storage, STORAGE_BUCKET_ID } from '../src/config/appwrite';
import Colors from '../src/constants/colors';
import GlobalStyles from '../src/constants/styles';
import LoadingSpinner from '../src/components/common/LoadingSpinner';
import ErrorMessage from '../src/components/common/ErrorMessage';
import { Farmer } from '../src/types';
import { ImageGravity, Query } from 'react-native-appwrite';

const FarmersPage: React.FC = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if(loaded) return; // Prevent reloading if already loaded
    loadFarmers();
  }, []);

  const loadFarmers = async () => {
    try {
      setError(null);
      const response = await databases.listDocuments(
        "688f5012002f53e1b1de", // DATABASE_ID
        "68873a62001f447ef53f", // COLLECTION_ID for farmers
        [Query.equal('isVerified', true), Query.orderDesc('$createdAt')], // Fetch only verified farmers
      );
      setFarmers(response.documents as unknown as Farmer[]);
      console.log('Farmers loaded:', response.documents.length);
      setLoaded(true);  
    } catch (error: any) {
      console.error('Failed to load farmers:', error);
      setError(error.message || 'Failed to load farmers');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFarmers();
    setRefreshing(false);
  };

  const getImageUrl = async (fileId: string) => {
    try {
      const result = storage.getFilePreview(
        "688f502a003b047969d9",
        fileId,
        200,
        200,
        ImageGravity.Center,      
        85
      );
      return result.toString();
    } catch (error) {
      return '';
    }
  };

  const handleFarmerPress = (farmer: Farmer) => {
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: farmer.$id,
        name: farmer.name
      }
    });
  };

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farmer.farmName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFarmerItem = ({ item }: { item: Farmer }) => {
    const [imageUrl, setImageUrl] = useState<string>('');

    React.useEffect(() => {
      if (item.profileImage) {
        getImageUrl(item.profileImage).then(setImageUrl);
      }
    }, [item.profileImage]);

    return (
      <TouchableOpacity
        style={styles.farmerCard}
        onPress={() => handleFarmerPress(item)}
      >
        <View style={styles.farmerHeader}>
          <View style={styles.avatarContainer}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={32} color={Colors.neutral[500]} />
              </View>
            )}
            {item.isVerified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={16} color={Colors.success[500]} />
              </View>
            )}
          </View>

          <View style={styles.farmerInfo}>
            <Text style={styles.farmerName}>{item.name}</Text>
            <Text style={styles.farmName}>{item.farmName}</Text>
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={16} color={Colors.neutral[500]} />
              <Text style={styles.location}>
                {item.city}, {item.state}
              </Text>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color={Colors.warning[500]} />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.totalReviews})</Text>
          </View>
        </View>

        <View style={styles.farmerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleFarmerPress(item)}
          >
            <MaterialIcons name="chat" size={20} color={Colors.primary[400]} />
            <Text style={styles.actionText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Navigate to farmer's products
              router.push({
                pathname: '/categories',
                params: { farmerId: item.$id }
              });
            }}
          >
            <MaterialIcons name="inventory" size={20} color={Colors.primary[400]} />
            <Text style={styles.actionText}>Products</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Farmers</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.neutral[500]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search farmers, farms, or specializations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="clear" size={20} color={Colors.neutral[500]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Farmers List */}
      {error ? (
        <ErrorMessage message={error} onRetry={loadFarmers} />
      ) : (
        <FlatList
          data={filteredFarmers}
          renderItem={renderFarmerItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.farmersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            isLoading ? (
              <LoadingSpinner size="large" />
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="people-outline" size={64} color={Colors.neutral[400]} />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No farmers found' : 'No farmers available'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Check back later for verified farmers'
                  }
                </Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text.primary,
  },
  farmersList: {
    padding: 16,
  },
  farmerCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  farmerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  farmName: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 2,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 2,
  },
  farmerDetails: {
    marginBottom: 12,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  experience: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 4,
  },
  specializationsContainer: {
    marginBottom: 8,
  },
  specializationsLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  specializationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  specializationChip: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  specializationText: {
    fontSize: 12,
    color: Colors.primary[700],
  },
  moreSpecializations: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  certificationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  certificationsText: {
    fontSize: 12,
    color: Colors.success[600],
    marginLeft: 4,
  },
  farmerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary[50],
  },
  actionText: {
    fontSize: 14,
    color: Colors.primary[600],
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default FarmersPage;