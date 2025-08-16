import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import * as Sentry from '@sentry/react-native';

// Extended Farmer interface to include imageUrl
interface FarmerWithImage extends Farmer {
  imageUrl?: string;
}

const FarmersPage: React.FC = () => {
  const [farmers, setFarmers] = useState<FarmerWithImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const getImageUrl = useCallback(async (fileId: string): Promise<string> => {
    try {
      console.log('Getting image URL for file ID:', fileId);
      const result = storage.getFilePreview(
        "688f502a003b047969d9",
        fileId,
        200,
        200,
        ImageGravity.Center,      
        85
      );
      console.log('Image URL generated successfully');
      return result.toString();
    } catch (error: any) {
      console.error('Failed to get image URL:', error);
      Sentry.captureException(new Error(`Failed to get image URL: ${error.message}`));
      return '';
    }
  }, []);

  const loadFarmers = useCallback(async () => {
    try {
      setError(null);
      console.log('Loading farmers...');
      
      const response = await databases.listDocuments(
        "688f5012002f53e1b1de", // Database ID
        "68873a62001f447ef53f", // Make sure this exists in your COLLECTION_IDS
        [Query.equal('isVerified', true), Query.orderDesc('$createdAt')]
      );

      console.log('Farmers fetched:', response.documents.length);

      // Preload image URLs for all farmers
      const farmersWithImages = await Promise.allSettled(
        response.documents.map(async (farmer: any): Promise<FarmerWithImage> => {
          let imageUrl = '';
          if (farmer.profileImage) {
            try {
              imageUrl = await getImageUrl(farmer.profileImage);
            } catch (error) {
              console.warn(`Failed to load image for farmer ${farmer.$id}:`, error);
            }
          }
          return { ...farmer, imageUrl } as FarmerWithImage;
        })
      );

      // Extract successful results and handle any failures
      const successfulFarmers = farmersWithImages
        .filter((result): result is PromiseFulfilledResult<FarmerWithImage> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);

      // Log any failures
      farmersWithImages
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .forEach((result, index) => {
          console.error(`Failed to process farmer at index ${index}:`, result.reason);
        });

      setFarmers(successfulFarmers);
      console.log('Farmers loaded with images:', successfulFarmers.length);
      
    } catch (error: any) {
      console.error('Failed to load farmers:', error);
      setError(error.message || 'Failed to load farmers');
      Sentry.captureException(error);
    } finally {
      setIsLoading(false);
    }
  }, [getImageUrl]);

  useEffect(() => {
    loadFarmers();
  }, [loadFarmers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFarmers();
    setRefreshing(false);
  }, [loadFarmers]);

  const handleFarmerPress = useCallback((farmer: FarmerWithImage) => {  
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: farmer.$id,
        name: farmer.name
      }
    });
  }, []);

  const handleProductsPress = useCallback((farmerId: string) => {
    router.push({
      pathname: '/categories',
      params: { farmerId }
    });
  }, []);

  const filteredFarmers = useMemo(() => 
    farmers.filter(farmer =>
      farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.farmName.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [farmers, searchQuery]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleBackPress = useCallback(() => {
    router.back();
  }, []);

  const renderFarmerItem = useCallback(({ item }: { item: FarmerWithImage }) => (
    <FarmerCard
      farmer={item}
      onPress={() => handleFarmerPress(item)}
      onProductsPress={() => handleProductsPress(item.$id)}
    />
  ), [handleFarmerPress, handleProductsPress]);

  const keyExtractor = useCallback((item: FarmerWithImage) => item.$id, []);

  const renderEmptyComponent = useMemo(() => {
    if (isLoading) {
      return <LoadingSpinner size="large" />;
    }
    
    return (
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
    );
  }, [isLoading, searchQuery]);

  return (
    <SafeAreaView style={GlobalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
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
          <TouchableOpacity onPress={clearSearch}>
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
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.farmersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyComponent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={5}
          getItemLayout={(data, index) => ({
            length: 150, // Approximate item height
            offset: 150 * index,
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
};

// Memoized FarmerCard component for better performance
const FarmerCard = React.memo<{
  farmer: FarmerWithImage;
  onPress: () => void;
  onProductsPress: () => void;
}>(({ farmer, onPress, onProductsPress }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      style={styles.farmerCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.farmerHeader}>
        <View style={styles.avatarContainer}>
          {farmer.imageUrl && !imageError ? (
            <Image 
              source={{ uri: farmer.imageUrl }} 
              style={styles.avatar}
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={32} color={Colors.neutral[500]} />
            </View>
          )}
          {farmer.isVerified && (
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={16} color={Colors.success[500]} />
            </View>
          )}
        </View>

        <View style={styles.farmerInfo}>
          <Text style={styles.farmerName} numberOfLines={1}>
            {farmer.name}
          </Text>
          <Text style={styles.farmName} numberOfLines={1}>
            {farmer.farmName}
          </Text>
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={16} color={Colors.neutral[500]} />
            <Text style={styles.location} numberOfLines={1}>
              {farmer.city}, {farmer.state}
            </Text>
          </View>
        </View>

        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={16} color={Colors.warning[500]} />
          <Text style={styles.rating}>{farmer.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({farmer.totalReviews})</Text>
        </View>
      </View>

      <View style={styles.farmerActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <MaterialIcons name="chat" size={20} color={Colors.primary[400]} />
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onProductsPress}
          activeOpacity={0.7}
        >
          <MaterialIcons name="inventory" size={20} color={Colors.primary[400]} />
          <Text style={styles.actionText}>Products</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

FarmerCard.displayName = 'FarmerCard';

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
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    backgroundColor: Colors.neutral[200],
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
    marginRight: 8,
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
    flex: 1,
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