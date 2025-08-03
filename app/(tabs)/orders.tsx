import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
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

const OrdersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, isLoading, error } = useSelector((state: RootState) => state.orders);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Order['status'] | 'all'>('all');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (user) {
      try {
        await dispatch(fetchOrdersByBuyer(user.$id));
      } catch (error) {
        console.error('Failed to load orders:', error);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: Order['status']) => {
    const statusColors = {
      pending: Colors.warning[500],
      confirmed: Colors.primary[500],
      packed: Colors.secondary[500],
      shipped: Colors.success[400],
      delivered: Colors.success[600],
      cancelled: Colors.error[500],
    };
    return statusColors[status];
  };

  // Fix: Return the correct MaterialIcons type
  const getStatusIcon = (status: Order['status']): MaterialIconName => {
    const statusIcons: Record<Order['status'], MaterialIconName> = {
      pending: 'schedule',
      confirmed: 'check-circle',
      packed: 'inventory',
      shipped: 'local-shipping',
      delivered: 'done-all',
      cancelled: 'cancel',
    };
    return statusIcons[status];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatPrice = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const filteredOrders = selectedFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push({
        pathname: '/order/[id]',
        params: { id: item.$id }
      })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{item.$id.slice(-8).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <MaterialIcons 
            name={getStatusIcon(item.status)} 
            size={16} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
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

  const renderFilterTabs = () => {
    const filters: Array<{ key: Order['status'] | 'all'; label: string; count?: number }> = [
      { key: 'all', label: 'All', count: orders.length },
      { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
      { key: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
      { key: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
      { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
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
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === item.key && styles.filterTabTextActive,
                ]}
              >
                {item.label}
              </Text>
              {item.count !== undefined && item.count > 0 && (
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
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push('/categories')}
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
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            isLoading ? (
              <LoadingSpinner size="large" />
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="shopping-bag" size={64} color={Colors.neutral[400]} />
                <Text style={styles.emptyText}>No orders found</Text>
                <Text style={styles.emptySubtext}>
                  {selectedFilter === 'all' 
                    ? "You haven't placed any orders yet" 
                    : `No ${selectedFilter} orders`}
                </Text>
                <TouchableOpacity 
                  style={styles.browseButton}
                  onPress={() => router.push('/categories')}
                >
                  <Text style={styles.browseButtonText}>Browse Products</Text>
                </TouchableOpacity>
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
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
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