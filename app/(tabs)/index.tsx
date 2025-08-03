import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Button,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RootState, AppDispatch } from '../../src/store';
import { 
  fetchFeaturedProducts, 
  fetchCategories,
  setSearchQuery 
} from '../../src/store/slices/productSlice';
import { getCurrentUser } from '../../src/store/slices/authSlice';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import ProductCard from '../../src/components/products/ProductCard';
import CategoryCard from '../../src/components/products/CategoryCard';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorMessage from '../../src/components/common/ErrorMessage';
import { Product, Category } from '../../src/types';
import seed from '@/src/seed/seed';

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    featuredProducts, 
    categories, 
    isLoading, 
    error, 
    searchQuery 
  } = useSelector((state: RootState) => state.products);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        dispatch(fetchFeaturedProducts(10)),
        dispatch(fetchCategories()),
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (localSearchQuery.trim()) {
      dispatch(setSearchQuery(localSearchQuery));
      router.push({
        pathname: '/categories',
        params: { search: localSearchQuery }
      });
    }
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.$id }
    });
  };

  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: '/categories',
      params: { categoryId: category.$id }
    });
  };

  const renderFeaturedProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={handleProductPress}
      style={styles.featuredProductCard}
    />
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <CategoryCard
      category={item}
      onPress={handleCategoryPress}
      style={styles.categoryCard}
    />
  );

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>
                नमस्ते, {user?.name.split(' ')[0] || 'Buyer'}!
              </Text>
              <Text style={styles.subGreeting}>Find fresh produce directly from farmers</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <MaterialIcons name="person" size={24} color={Colors.primary[400]} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={Colors.neutral[500]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for crops, vegetables, fruits..."
              value={localSearchQuery}
              onChangeText={setLocalSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch}>
              <MaterialIcons name="arrow-forward" size={20} color={Colors.primary[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <ErrorMessage
            message={error}
            onRetry={loadInitialData}
            style={styles.errorContainer}
          />
        )}

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => router.push('/categories')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <Button title="Categories" onPress={seed} />
          {categories.length > 0 ? (
            <FlatList
              horizontal
              data={categories.slice(0, 6)}
              renderItem={renderCategory}
              keyExtractor={(item) => item.$id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          ) : (
            isLoading ? <LoadingSpinner /> : null
          )}
        </View>

        {/* Featured Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push('/categories')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {featuredProducts.length > 0 ? (
            <FlatList
              horizontal
              data={featuredProducts}
              renderItem={renderFeaturedProduct}
              keyExtractor={(item) => item.$id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          ) : (
            isLoading ? <LoadingSpinner /> : null
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/orders')}
            >
              <MaterialIcons name="shopping-bag" size={32} color={Colors.primary[400]} />
              <Text style={styles.quickActionText}>My Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/messages')}
            >
              <MaterialIcons name="chat" size={32} color={Colors.secondary[500]} />
              <Text style={styles.quickActionText}>Messages</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/categories')}
            >
              <MaterialIcons name="location-on" size={32} color={Colors.success[500]} />
              <Text style={styles.quickActionText}>Near Me</Text>
            </TouchableOpacity>
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
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  subGreeting: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text.primary,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary[400],
    fontWeight: '600',
  },
  horizontalList: {
    paddingRight: 16,
  },
  featuredProductCard: {
    marginRight: 12,
    width: 200,
  },
  categoryCard: {
    marginRight: 12,
    width: 160,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    margin: 16,
  },
});

export default HomePage;