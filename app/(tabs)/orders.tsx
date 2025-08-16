import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RootState, AppDispatch } from '../../src/store';
import { fetchOrdersByBuyer } from '../../src/store/slices/orderSlice';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorMessage from '../../src/components/common/ErrorMessage';
import { Order } from '../../src/types';

// Define the MaterialIcons type
type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

// Configuration constants
const CONFIG = {
  ORDER_ID_DISPLAY_LENGTH: 8,
  DATE_LOCALE: 'en-IN',
  CURRENCY_LOCALE: 'en-IN',
  CURRENCY_SYMBOL: '₹',
} as const;

// Type-safe status mappings
const STATUS_CONFIG: Record<Order['status'], {
  color: string;
  icon: MaterialIconName;
  label: string;
}> = {
  pending: {
    color: Colors.warning[500],
    icon: 'schedule',
    label: 'Pending',
  },
  confirmed: {
    color: Colors.primary[500],
    icon: 'check-circle',
    label: 'Confirmed',
  },
  packed: {
    color: Colors.secondary[500],
    icon: 'inventory',
    label: 'Packed',
  },
  shipped: {
    color: Colors.success[400],
    icon: 'local-shipping',
    label: 'Shipped',
  },
  delivered: {
    color: Colors.success[600],
    icon: 'done-all',
    label: 'Delivered',
  },
  cancelled: {
    color: Colors.error[500],
    icon: 'cancel',
    label: 'Cancelled',
  },
};

const OrdersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, isLoading, error } = useSelector((state: RootState) => state.orders);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Order['status'] | 'all'>('all');

  // Memoized calculations for better performance
  const orderStats = useMemo(() => {
    const stats = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<Order['status'], number>);
    
    return {
      all: orders.length,
      ...stats,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return selectedFilter === 'all' 
      ? orders 
      : orders.filter(order => order.status === selectedFilter);
  }, [orders, selectedFilter]);

  // Improved error handling with user feedback
  const loadOrders = useCallback(async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    try {
      await dispatch(fetchOrdersByBuyer(user.$id)).unwrap();
    } catch (error) {
      console.error('Failed to load orders:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load orders. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, loadOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  // Helper functions with better error handling
  const getStatusConfig = (status: Order['status']) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  };

  const formatDate = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(CONFIG.DATE_LOCALE);
    } catch {
      return 'Invalid date';
    }
  }, []);

  const formatPrice = useCallback((amount: number) => {
    try {
      return `${CONFIG.CURRENCY_SYMBOL}${amount.toLocaleString(CONFIG.CURRENCY_LOCALE)}`;
    } catch {
      return `${CONFIG.CURRENCY_SYMBOL}${amount}`;
    }
  }, []);

  const formatOrderId = useCallback((orderId: string) => {
    return `#${orderId.slice(-CONFIG.ORDER_ID_DISPLAY_LENGTH).toUpperCase()}`;
  }, []);

  const handleOrderPress = useCallback((orderId: string) => {
    router.push({
      pathname: '/order/[id]',
      params: { id: orderId }
    });
  }, []);

  const renderOrderItem = useCallback(({ item }: { item: Order }) => {
    const statusConfig = getStatusConfig(item.status);
    
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(item.$id)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>{formatOrderId(item.$id)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <MaterialIcons 
              name={statusConfig.icon} 
              size={16} 
              color={statusConfig.color} 
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.productName} numberOfLines={1}>
            Product: {item.product}
          </Text>
          <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
          <Text style={styles.amount}>{formatPrice(item.totalAmount)}</Text>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderDate}>Ordered on {formatDate(item.$createdAt)}</Text>
          {item.expectedDeliveryDate && (
            <Text style={styles.deliveryDate}>
              Expected: {formatDate(item.expectedDeliveryDate)}
            </Text>
          )}
        </View>

        {item.trackingNumber && (
          <View style={styles.trackingContainer}>
            <MaterialIcons name="local-shipping" size={16} color={Colors.primary[400]} />
            <Text style={styles.trackingNumber}>Tracking: {item.trackingNumber}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [formatOrderId, formatPrice, formatDate, handleOrderPress]);

  const renderFilterTabs = useCallback(() => {
    const filters: Array<{ 
      key: Order['status'] | 'all'; 
      label: string; 
      count: number;
    }> = [
      { key: 'all', label: 'All', count: orderStats.all },
      { key: 'pending', label: 'Pending', count: orderStats.pending || 0 },
      { key: 'confirmed', label: 'Confirmed', count: orderStats.confirmed || 0 },
      { key: 'shipped', label: 'Shipped', count: orderStats.shipped || 0 },
      { key: 'delivered', label: 'Delivered', count: orderStats.delivered || 0 },
    ];

    return (
      <View style={styles.filterTabs}>
        <FlatList
          horizontal
          data={filters}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === item.key && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(item.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === item.key && styles.filterTabTextActive,
                ]}
              >
                {item.label}
              </Text>
              {item.count > 0 && (
                <View style={styles.filterTabBadge}>
                  <Text style={styles.filterTabBadgeText}>{item.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsList}
        />
      </View>
    );
  }, [orderStats, selectedFilter]);

  const renderEmptyState = useCallback(() => {
    const isFiltered = selectedFilter !== 'all';
    
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="shopping-bag" size={64} color={Colors.neutral[400]} />
        <Text style={styles.emptyText}>No orders found</Text>
        <Text style={styles.emptySubtext}>
          {isFiltered 
            ? `No ${selectedFilter} orders found`
            : "You haven't placed any orders yet"}
        </Text>
        {!isFiltered && (
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/categories')}
            activeOpacity={0.8}
          >
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [selectedFilter]);

  return (
    <SafeAreaView style={GlobalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push('/categories')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add-shopping-cart" size={24} color={Colors.primary[400]} />
        </TouchableOpacity>
      </View>

      {renderFilterTabs()}

      {error ? (
        <ErrorMessage message={error} onRetry={loadOrders} />
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={[
            styles.ordersList,
            filteredOrders.length === 0 && styles.ordersListEmpty
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={isLoading ? <LoadingSpinner size="large" /> : renderEmptyState()}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabs: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  filterTabsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: Colors.primary[400],
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  filterTabBadge: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  filterTabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary[400],
  },
  ordersList: {
    padding: 16,
  },
  ordersListEmpty: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderDetails: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary[600],
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  orderDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  deliveryDate: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  trackingNumber: {
    fontSize: 12,
    color: Colors.primary[400],
    fontWeight: '600',
    marginLeft: 4,
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
  browseButton: {
    backgroundColor: Colors.primary[400],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  browseButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrdersPage;