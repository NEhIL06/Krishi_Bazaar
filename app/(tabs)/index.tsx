import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
} from 'react-native';
import * as Sentry from '@sentry/react-native';  
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RootState, AppDispatch } from '../../src/store';
import { 
  fetchFeaturedProducts, 
  fetchCategories,
  setSearchQuery 
} from '../../src/store/slices/productSlice';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import ProductCard from '../../src/components/products/ProductCard';
import CategoryCard from '../../src/components/products/CategoryCard';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorMessage from '../../src/components/common/ErrorMessage';
import { Product, Category } from '../../src/types';

// Constants
const CATEGORIES_TO_SHOW = 6;
const QUICK_ACTIONS = [
  {
    id: 'orders',
    icon: 'shopping-bag',
    label: 'My Orders',
    color: Colors.primary[400],
    route: '/orders'
  },
  {
    id: 'messages',
    icon: 'chat',
    label: 'Messages',
    color: Colors.secondary[500],
    route: '/messages'
  },
  {
    id: 'nearme',
    icon: 'location-on',
    label: 'Near Me',
    color: Colors.success[500],
    route: '/categories'
  }
] as const;

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Safe selector with proper fallbacks
  const {
    featuredProducts = [],
    categories = [],
    isLoading = false,
    error = null
  } = useSelector((state: RootState) => state.products ?? {});
  
  const {
    user = null
  } = useSelector((state: RootState) => state.auth ?? {});
  
  const [refreshing, setRefreshing] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  console.log('HomePage: Rendering with user:', user);

  // Memoized user's first name
  const firstName = useMemo(() => {
    if (!user?.name) return 'किसान';
    return user.name.split(' ')[0] || 'किसान';
  }, [user?.name]);

  // Memoized limited categories
  const limitedCategories = useMemo(() => 
    categories.slice(0, CATEGORIES_TO_SHOW), 
    [categories]
  );

  const loadInitialData = useCallback(async () => {
    try {
      console.log('HomePage: Loading featured products and categories');
      const results = await Promise.allSettled([
        dispatch(fetchFeaturedProducts()),
        dispatch(fetchCategories())
      ]);
      
      // Check for any failures
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.warn('HomePage: Some data failed to load:', failures);
      }
      
      console.log('HomePage: Initial data load completed');
    } catch (error) {
      console.error('HomePage: Error loading initial data:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    console.log('HomePage: useEffect triggered, loading initial data');
    loadInitialData();
  }, [loadInitialData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, [loadInitialData]);

  const handleSearch = useCallback(async () => {
    const query = localSearchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    try {
      dispatch(setSearchQuery(query));
      router.push({
        pathname: '/categories',
        params: { search: query }
      });
    } catch (error) {
      Sentry.captureException(error);
      console.error('Search navigation failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [localSearchQuery, dispatch]);

  const handleProductPress = useCallback((product: Product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.$id }
    });
  }, []);

  const handleCategoryPress = useCallback((category: Category) => {
    router.push({
      pathname: '/categories',
      params: { categoryId: category.$id }
    });
  }, []);

  const handleProfilePress = useCallback(() => {
    router.push('/profile');
  }, []);

  const handleSeeAllCategories = useCallback(() => {
    router.push('/categories');
  }, []);

  const handleSeeAllProducts = useCallback(() => {
    router.push('/categories');
  }, []);

  const handleQuickAction = useCallback((route: string) => {
    router.push(route as any);
  }, []);

  const clearSearch = useCallback(() => {
    setLocalSearchQuery('');
  }, []);

  // Memoized render functions
  const renderFeaturedProduct = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      style={styles.featuredProductCard}
    />
  ), [handleProductPress]);

  const renderCategory = useCallback(({ item }: { item: Category }) => (
    <CategoryCard
      category={item}
      onPress={() => handleCategoryPress(item)}
      style={styles.categoryCard}
    />
  ), [handleCategoryPress]);

  const keyExtractorProduct = useCallback((item: Product) => item.$id, []);
  const keyExtractorCategory = useCallback((item: Category) => item.$id, []);

  // Memoized sections
  const searchSection = useMemo(() => (
    <View style={styles.searchContainer}>
      <MaterialIcons name="search" size={20} color={Colors.neutral[500]} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search for crops, vegetables, fruits..."
        value={localSearchQuery}
        onChangeText={setLocalSearchQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
        editable={!isSearching}
      />
      {localSearchQuery.length > 0 && (
        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
          <MaterialIcons name="clear" size={20} color={Colors.neutral[500]} />
        </TouchableOpacity>
      )}
      <TouchableOpacity 
        onPress={handleSearch} 
        disabled={isSearching || !localSearchQuery.trim()}
        style={[
          styles.searchButton,
          (isSearching || !localSearchQuery.trim()) && styles.searchButtonDisabled
        ]}
      >
        {isSearching ? (
          <LoadingSpinner size="small" color={Colors.primary[400]} />
        ) : (
          <MaterialIcons name="arrow-forward" size={20} color={Colors.primary[400]} />
        )}
      </TouchableOpacity>
    </View>
  ), [localSearchQuery, isSearching, handleSearch, clearSearch]);

  const quickActionsSection = useMemo(() => (
    <View style={styles.quickActions}>
      {QUICK_ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.quickActionCard}
          onPress={() => handleQuickAction(action.route)}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name={action.icon as any} 
            size={32} 
            color={action.color} 
          />
          <Text style={styles.quickActionText}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  ), [handleQuickAction]);

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
          <View style={styles.headerTop}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>
                नमस्ते, {firstName}! 🙏
              </Text>
              <Text style={styles.subGreeting}>
                Find fresh produce directly from farmers
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={handleProfilePress}
              activeOpacity={0.7}
            >
              <MaterialIcons name="person" size={24} color={Colors.primary[400]} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          {searchSection}
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
            <TouchableOpacity onPress={handleSeeAllCategories}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading && categories.length === 0 ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner />
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : limitedCategories.length > 0 ? (
            <FlatList
              horizontal
              data={limitedCategories}
              renderItem={renderCategory}
              keyExtractor={keyExtractorCategory}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              removeClippedSubviews={true}
              maxToRenderPerBatch={3}
              windowSize={5}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="category" size={48} color={Colors.neutral[400]} />
              <Text style={styles.emptyText}>No categories available</Text>
            </View>
          )}
        </View>

        {/* Featured Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={handleSeeAllProducts}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading && featuredProducts.length === 0 ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : featuredProducts.length > 0 ? (
            <FlatList
              horizontal
              data={featuredProducts}
              renderItem={renderFeaturedProduct}
              keyExtractor={keyExtractorProduct}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              removeClippedSubviews={true}
              maxToRenderPerBatch={3}
              windowSize={5}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inventory" size={48} color={Colors.neutral[400]} />
              <Text style={styles.emptyText}>No featured products available</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {quickActionsSection}
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
  greetingContainer: {
    flex: 1,
    marginRight: 12,
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
  clearButton: {
    padding: 4,
    marginRight: 4,
  },
  searchButton: {
    padding: 4,
  },
  searchButtonDisabled: {
    opacity: 0.5,
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 8,
  },
});

export default HomePage;