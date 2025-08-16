import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Modal,
  ViewStyle,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { RootState, AppDispatch } from '../../src/store';
import { 
  fetchProducts, 
  fetchCategories,
  setFilters,
  clearFilters,
  setSearchQuery 
} from '../../src/store/slices/productSlice';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import ProductCard from '../../src/components/products/ProductCard';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorMessage from '../../src/components/common/ErrorMessage';
import CustomButton from '../../src/components/common/CustomButton';
import { Product, Category } from '../../src/types';

// Types
type SortField = 'price' | 'createdAt' | 'rating';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

// Constants
const SORT_OPTIONS = [
  { key: 'createdAt' as const, label: 'Latest' },
  { key: 'price' as const, label: 'Price' },
  { key: 'rating' as const, label: 'Rating' },
];

const ORGANIC_OPTIONS = [
  { key: undefined, label: 'All' },
  { key: true, label: 'Organic' },
  { key: false, label: 'Conventional' },
] as const;

const CategoriesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    products = [], 
    categories = [], 
    isLoading = false, 
    error = null, 
    filters = {} 
  } = useSelector((state: RootState) => state.products ?? {});
  
  const params = useLocalSearchParams();
  
  // Local state
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Refs for cleanup
  const loadProductsRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Memoized values
  const currentFilters = useMemo(() => ({
    ...filters,
    search: localSearchQuery.trim() || undefined
  }), [filters, localSearchQuery]);

  const hasActiveFilters = useMemo(() => 
    Boolean(filters.category || filters.isOrganic !== undefined || localSearchQuery.trim()),
    [filters.category, filters.isOrganic, localSearchQuery]
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    if (loadProductsRef.current) {
      clearTimeout(loadProductsRef.current);
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const loadProducts = useCallback(() => {
    // Clear any pending requests
    if (loadProductsRef.current) {
      clearTimeout(loadProductsRef.current);
    }

    // Debounce the API call
    loadProductsRef.current = setTimeout(() => {
      dispatch(fetchProducts({
        filters: currentFilters,
        sort: { field: sortBy, direction: sortDirection },
        limit: 20,
        offset: 0,
      }));
    }, 300);
  }, [dispatch, currentFilters, sortBy, sortDirection]);

  const loadCategories = useCallback(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Initialize data and handle URL params
  useEffect(() => {
    loadCategories();
    
    // Handle URL parameters
    let needsProductLoad = false;
    
    if (params.search && typeof params.search === 'string') {
      setLocalSearchQuery(params.search);
      dispatch(setSearchQuery(params.search));
      needsProductLoad = true;
    }
    
    if (params.categoryId && typeof params.categoryId === 'string') {
      dispatch(setFilters({ ...filters, category: params.categoryId }));
      needsProductLoad = true;
    }

    if (params.farmerId && typeof params.farmerId === 'string') {
      dispatch(setFilters({ ...filters, farmerId: params.farmerId }));
      needsProductLoad = true;
    }
    
    // Load products regardless of params
    if (needsProductLoad) {
      // Use setTimeout to ensure state updates are applied
      setTimeout(loadProducts, 100);
    } else {
      loadProducts();
    }
  }, [params.search, params.categoryId, params.farmerId]); // Only depend on params

  // Load products when filters or sort change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = useCallback(() => {
    const query = localSearchQuery.trim();
    if (query) {
      dispatch(setSearchQuery(query));
    } else {
      dispatch(setSearchQuery(''));
    }
  }, [localSearchQuery, dispatch]);

  const handleSearchChange = useCallback((text: string) => {
    setLocalSearchQuery(text);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      if (text.trim()) {
        dispatch(setSearchQuery(text.trim()));
      }
    }, 500);
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    setLocalSearchQuery('');
    dispatch(setSearchQuery(''));
  }, [dispatch]);

  const handleProductPress = useCallback((product: Product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.$id }
    });
  }, []);

  const handleCategoryFilter = useCallback((categoryId: string) => {
    const newFilters = { ...filters, category: categoryId };
    dispatch(setFilters(newFilters));
  }, [filters, dispatch]);

  const handleOrganicFilter = useCallback((isOrganic: boolean | undefined) => {
    const newFilters = { ...filters, isOrganic };
    dispatch(setFilters(newFilters));
  }, [filters, dispatch]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters());
    setLocalSearchQuery('');
    dispatch(setSearchQuery(''));
  }, [dispatch]);

  const removeFilter = useCallback((filterKey: string) => {
    if (filterKey === 'search') {
      clearSearch();
    } else {
      const newFilters = { ...filters };
      const validFilterKeys: Array<keyof typeof filters> = ['category', 'priceRange', 'isOrganic', 'location'];
      if (validFilterKeys.includes(filterKey as keyof typeof filters)) {
        delete newFilters[filterKey as keyof typeof filters];
      }
      dispatch(setFilters(newFilters));
    }
  }, [filters, dispatch, clearSearch]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const applyFilters = useCallback(() => {
    setShowFilters(false);
    // Filters are applied in real-time, so no additional action needed
  }, []);

  // Helper function to compute product card styles
  const getProductCardStyle = useCallback((index: number): ViewStyle => {
    const baseStyle: ViewStyle = { marginBottom: 16 };
    
    if (viewMode === 'grid') {
      const gridStyle: ViewStyle = {
        ...baseStyle,
        flex: 1,
      };
      
      if (index % 2 === 1) {
        return {
          ...gridStyle,
          marginLeft: 8,
        };
      }
      
      return gridStyle;
    } else {
      return {
        ...baseStyle,
        width: '100%',
      };
    }
  }, [viewMode]);

  // Memoized render functions
  const renderProduct = useCallback(({ item, index }: { item: Product; index: number }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      style={getProductCardStyle(index)}
      columns={viewMode === 'grid' ? 2 : 1}
    />
  ), [handleProductPress, viewMode, getProductCardStyle]);

  const keyExtractor = useCallback((item: Product) => item.$id, []);

  // Memoized components
  const searchSection = useMemo(() => (
    <View style={styles.searchContainer}>
      <MaterialIcons name="search" size={20} color={Colors.neutral[500]} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        value={localSearchQuery}
        onChangeText={handleSearchChange}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      {localSearchQuery.length > 0 && (
        <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
          <MaterialIcons name="clear" size={20} color={Colors.neutral[500]} />
        </TouchableOpacity>
      )}
    </View>
  ), [localSearchQuery, handleSearchChange, handleSearch, clearSearch]);

  const activeFiltersSection = useMemo(() => {
    if (!hasActiveFilters) return null;

    return (
      <View style={styles.activeFilters}>
        {filters.category && (
          <View style={styles.activeFilter}>
            <Text style={styles.activeFilterText}>
              {categories.find(c => c.$id === filters.category)?.name || 'Category'}
            </Text>
            <TouchableOpacity onPress={() => removeFilter('category')}>
              <MaterialIcons name="close" size={16} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}
        
        {filters.isOrganic !== undefined && (
          <View style={styles.activeFilter}>
            <Text style={styles.activeFilterText}>
              {filters.isOrganic ? 'Organic' : 'Conventional'}
            </Text>
            <TouchableOpacity onPress={() => removeFilter('isOrganic')}>
              <MaterialIcons name="close" size={16} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}
        
        {localSearchQuery.trim() && (
          <View style={styles.activeFilter}>
            <Text style={styles.activeFilterText}>"{localSearchQuery}"</Text>
            <TouchableOpacity onPress={() => removeFilter('search')}>
              <MaterialIcons name="close" size={16} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }, [hasActiveFilters, filters, categories, localSearchQuery, removeFilter]);

  const emptyComponent = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="search-off" size={64} color={Colors.neutral[400]} />
        <Text style={styles.emptyText}>No products found</Text>
        <Text style={styles.emptySubtext}>
          {hasActiveFilters ? 'Try adjusting your filters' : 'No products available'}
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearAllFilters} style={styles.clearFiltersButton}>
            <Text style={styles.clearFiltersText}>Clear all filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [isLoading, hasActiveFilters, clearAllFilters]);

  const filterModal = useMemo(() => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <MaterialIcons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          {/* Categories */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Categories</Text>
            <FlatList
              horizontal
              data={categories}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    filters.category === item.$id && styles.categoryChipActive,
                  ]}
                  onPress={() => handleCategoryFilter(item.$id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      filters.category === item.$id && styles.categoryChipTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.$id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsList}
            />
          </View>

          {/* Organic Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Product Type</Text>
            <View style={styles.organicFilters}>
              {ORGANIC_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.organicChip,
                    filters.isOrganic === option.key && styles.organicChipActive,
                  ]}
                  onPress={() => handleOrganicFilter(option.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.organicChipText,
                      filters.isOrganic === option.key && styles.organicChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sort By</Text>
            <View style={styles.sortOptions}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortChip,
                    sortBy === option.key && styles.sortChipActive,
                  ]}
                  onPress={() => setSortBy(option.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      sortBy === option.key && styles.sortChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.modalFooter}>
          <CustomButton
            title="Clear All"
            onPress={clearAllFilters}
            variant="outline"
            style={styles.clearAllButton}
          />
          <CustomButton
            title="Apply Filters"
            onPress={applyFilters}
            style={styles.applyButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  ), [
    showFilters,
    categories,
    filters,
    sortBy,
    handleCategoryFilter,
    handleOrganicFilter,
    clearAllFilters,
    applyFilters
  ]);

  return (
    <SafeAreaView style={GlobalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        {searchSection}

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionButton, hasActiveFilters && styles.actionButtonActive]}
            onPress={toggleFilters}
            activeOpacity={0.7}
          >
            <MaterialIcons name="filter-list" size={24} color={Colors.primary[400]} />
            {hasActiveFilters && <View style={styles.filterDot} />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={toggleViewMode}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name={viewMode === 'grid' ? 'view-list' : 'view-module'} 
              size={24} 
              color={Colors.primary[400]} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filters */}
      {activeFiltersSection}

      {/* Products List */}
      {error ? (
        <ErrorMessage message={error} onRetry={loadProducts} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={emptyComponent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={6}
          getItemLayout={viewMode === 'grid' ? undefined : (data, index) => ({
            length: 120, // Approximate item height for list view
            offset: 120 * index,
            index,
          })}
        />
      )}

      {filterModal}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text.primary,
  },
  clearSearchButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  actionButtonActive: {
    backgroundColor: Colors.primary[50],
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary[500],
  },
  activeFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.neutral[50],
    flexWrap: 'wrap',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  activeFilterText: {
    fontSize: 12,
    color: Colors.primary[700],
    marginRight: 4,
  },
  productsList: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  clearFiltersButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary[100],
    borderRadius: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: Colors.primary[600],
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterSection: {
    marginVertical: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  chipsList: {
    paddingRight: 16,
  },
  categoryChip: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary[400],
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  organicFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  organicChip: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  organicChipActive: {
    backgroundColor: Colors.success[400],
  },
  organicChipText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  organicChipTextActive: {
    color: Colors.white,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortChip: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  sortChipActive: {
    backgroundColor: Colors.secondary[400],
  },
  sortChipText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  sortChipTextActive: {
    color: Colors.white,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  clearAllButton: {
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default CategoriesPage;