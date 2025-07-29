import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Modal,
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
import { Product } from '../../src/types';

const CategoriesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, categories, isLoading, error, filters } = useSelector(
    (state: RootState) => state.products
  );
  const params = useLocalSearchParams();
  
  const [searchQuery, setSearchQuer] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'createdAt' | 'rating'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    dispatch(fetchCategories());
    
    // Handle search params
    if (params.search) {
      setSearchQuery(params.search as string);
      dispatch(setSearchQuery(params.search as string));
    }
    
    if (params.categoryId) {
      dispatch(setFilters({ ...filters, category: params.categoryId as string }));
    }
    
    loadProducts();
  }, [params]);

  useEffect(() => {
    loadProducts();
  }, [filters, sortBy, sortDirection]);

  const loadProducts = () => {
    dispatch(fetchProducts({
      filters,
      sort: { field: sortBy, direction: sortDirection },
      limit: 20,
      offset: 0,
    }));
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(setSearchQuery(searchQuery));
      loadProducts();
    }
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.$id }
    });
  };

  const handleCategoryFilter = (categoryId: string) => {
    dispatch(setFilters({ ...filters, category: categoryId }));
  };

  const handlePriceFilter = (min: number, max: number) => {
    dispatch(setFilters({ ...filters, priceRange: { min, max } }));
  };

  const handleOrganicFilter = (isOrganic: boolean) => {
    dispatch(setFilters({ ...filters, isOrganic }));
  };

  const clearAllFilters = () => {
    dispatch(clearFilters());
    setSearchQuery('');
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <ProductCard
      product={item}
      onPress={handleProductPress}
      style={[
        viewMode === 'grid' ? styles.gridProduct : styles.listProduct,
        viewMode === 'grid' && index % 2 === 1 && styles.gridProductRight,
      ]}
    />
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
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
            />
          </View>

          {/* Organic Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Product Type</Text>
            <View style={styles.organicFilters}>
              <TouchableOpacity
                style={[
                  styles.organicChip,
                  filters.isOrganic === undefined && styles.organicChipActive,
                ]}
                onPress={() => handleOrganicFilter(undefined as any)}
              >
                <Text style={styles.organicChipText}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.organicChip,
                  filters.isOrganic === true && styles.organicChipActive,
                ]}
                onPress={() => handleOrganicFilter(true)}
              >
                <Text style={styles.organicChipText}>Organic</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.organicChip,
                  filters.isOrganic === false && styles.organicChipActive,
                ]}
                onPress={() => handleOrganicFilter(false)}
              >
                <Text style={styles.organicChipText}>Conventional</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sort By</Text>
            <View style={styles.sortOptions}>
              {[
                { key: 'createdAt', label: 'Latest' },
                { key: 'price', label: 'Price' },
                { key: 'rating', label: 'Rating' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortChip,
                    sortBy === option.key && styles.sortChipActive,
                  ]}
                  onPress={() => setSortBy(option.key as any)}
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
            style={styles.clearButton}
          />
          <CustomButton
            title="Apply Filters"
            onPress={() => setShowFilters(false)}
            style={styles.applyButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={GlobalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={Colors.neutral[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuer}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowFilters(true)}
          >
            <MaterialIcons name="filter-list" size={24} color={Colors.primary[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
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
      {(filters.category || filters.isOrganic !== undefined || searchQuery) && (
        <View style={styles.activeFilters}>
          {filters.category && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>
                {categories.find(c => c.$id === filters.category)?.name}
              </Text>
              <TouchableOpacity
                onPress={() => dispatch(setFilters({ ...filters, category: undefined }))}
              >
                <MaterialIcons name="close" size={16} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
          )}
          {filters.isOrganic !== undefined && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>
                {filters.isOrganic ? 'Organic' : 'Conventional'}
              </Text>
              <TouchableOpacity
                onPress={() => dispatch(setFilters({ ...filters, isOrganic: undefined }))}
              >
                <MaterialIcons name="close" size={16} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
          )}
          {searchQuery && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>"{searchQuery}"</Text>
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={16} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Products List */}
      {error ? (
        <ErrorMessage message={error} onRetry={loadProducts} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.$id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            isLoading ? (
              <LoadingSpinner size="large" />
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="search-off" size={64} color={Colors.neutral[400]} />
                <Text style={styles.emptyText}>No products found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
              </View>
            )
          }
        />
      )}

      {renderFilterModal()}
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
  gridProduct: {
    flex: 1,
    marginBottom: 16,
  },
  gridProductRight: {
    marginLeft: 8,
  },
  listProduct: {
    width: '100%',
    marginBottom: 16,
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
  },
  organicChip: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  organicChipActive: {
    backgroundColor: Colors.success[400],
  },
  organicChipText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortChip: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
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
  clearButton: {
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default CategoriesPage;