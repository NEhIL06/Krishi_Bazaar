import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { RootState, AppDispatch } from '../../src/store';
import { fetchOrderById, cancelOrder, updateOrderStatus } from '../../src/store/slices/orderSlice';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import CustomButton from '../../src/components/common/CustomButton';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorMessage from '../../src/components/common/ErrorMessage';
import { Order } from '../../src/types';

// Define the icon type more strictly
type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const OrderDetailPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedOrder, isLoading, error } = useSelector((state: RootState) => state.orders);
  const { user } = useSelector((state: RootState) => state.auth);
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.id) {
      dispatch(fetchOrderById(params.id as string));
    }
  }, [params.id]);

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

  // Fix: Return the correct MaterialIcons type and use proper icon names
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

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    const statusColors = {
      pending: Colors.warning[500],
      paid: Colors.success[500],
      failed: Colors.error[500],
      refunded: Colors.neutral[500],
    };
    return statusColors[status];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleCancelOrder = () => {
    if (!selectedOrder) return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(cancelOrder({ // not required here 
                orderId: selectedOrder.$id,
                reason: 'Cancelled by buyer'
              }));
              Alert.alert('Success', 'Order has been cancelled successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel order');
            }
          }
        }
      ]
    );
  };

  const handleContactFarmer = () => {
    if (!selectedOrder) return;
    
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: selectedOrder.farmer,
        name: 'Farmer'
      }
    });
  };

  const handleTrackOrder = () => {
    if (!selectedOrder?.trackingNumber) return;
    
    Alert.alert(
      'Tracking Information',
      `Tracking Number: ${selectedOrder.trackingNumber}\n\nYou can track your order using this tracking number on the courier's website.`,
      [{ text: 'OK' }]
    );
  };

  const renderOrderStatus = () => {
    if (!selectedOrder) return null;

    // Fix: Define proper icon types for status steps
    const statusSteps: Array<{
      key: Order['status'];
      label: string;
      icon: MaterialIconName;
    }> = [
      { key: 'pending', label: 'Order Placed', icon: 'receipt' },
      { key: 'confirmed', label: 'Confirmed', icon: 'check-circle' },
      { key: 'packed', label: 'Packed', icon: 'inventory' },
      { key: 'shipped', label: 'Shipped', icon: 'local-shipping' },
      { key: 'delivered', label: 'Delivered', icon: 'done-all' },
    ];

    const currentStatusIndex = statusSteps.findIndex(step => step.key === selectedOrder.status);

    return (
      <View style={styles.statusContainer}>
        <Text style={styles.sectionTitle}>Order Status</Text>
        <View style={styles.statusTimeline}>
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const isLast = index === statusSteps.length - 1;

            return (
              <View key={step.key} style={styles.statusStep}>
                <View style={styles.statusStepContent}>
                  <View
                    style={[
                      styles.statusIcon,
                      isCompleted && styles.statusIconCompleted,
                      isCurrent && styles.statusIconCurrent,
                    ]}
                  >
                    <MaterialIcons
                      name={step.icon}
                      size={20}
                      color={isCompleted ? Colors.white : Colors.neutral[400]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.statusLabel,
                      isCompleted && styles.statusLabelCompleted,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.statusLine,
                      isCompleted && styles.statusLineCompleted,
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => dispatch(fetchOrderById(params.id as string))}
      />
    );
  }

  if (!selectedOrder) {
    return (
      <View style={styles.notFound}>
        <MaterialIcons name="search-off" size={64} color={Colors.neutral[400]} />
        <Text style={styles.notFoundText}>Order not found</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <MaterialIcons name="share" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderId}>#{selectedOrder.$id.slice(-8).toUpperCase()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) + '20' }]}>
              <MaterialIcons 
                name={getStatusIcon(selectedOrder.status)}
                size={16} 
                color={getStatusColor(selectedOrder.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(selectedOrder.status) }]}>
                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.orderDate}>
            Placed on {formatDate(selectedOrder.$createdAt)}
          </Text>
        </View>

        {/* Order Status Timeline */}
        {selectedOrder.status !== 'cancelled' && renderOrderStatus()}

        {/* Order Details */}
        <View style={styles.orderDetails}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Product:</Text>
            <Text style={styles.detailValue}>{selectedOrder.product}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={styles.detailValue}>{selectedOrder.quantity}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount:</Text>
            <Text style={styles.detailValue}>{formatPrice(selectedOrder.totalAmount)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Status:</Text>
            <View style={[styles.paymentBadge, { backgroundColor: getPaymentStatusColor(selectedOrder.paymentStatus) + '20' }]}>
              <Text style={[styles.paymentText, { color: getPaymentStatusColor(selectedOrder.paymentStatus) }]}>
                {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
              </Text>
            </View>
          </View>

          {selectedOrder.expectedDeliveryDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expected Delivery:</Text>
              <Text style={styles.detailValue}>{formatDate(selectedOrder.expectedDeliveryDate)}</Text>
            </View>
          )}

          {selectedOrder.actualDeliveryDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivered On:</Text>
              <Text style={styles.detailValue}>{formatDate(selectedOrder.actualDeliveryDate)}</Text>
            </View>
          )}

          {selectedOrder.trackingNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tracking Number:</Text>
              <TouchableOpacity onPress={handleTrackOrder}>
                <Text style={styles.trackingNumber}>{selectedOrder.trackingNumber}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Delivery Address */}
        <View style={styles.addressContainer}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <MaterialIcons name="location-on" size={20} color={Colors.primary[400]} />
            <View style={styles.addressText}>
              
              <Text style={styles.addressLine}>
                {selectedOrder.delivery_city}, {selectedOrder.delivery_state}
              </Text>
              <Text style={styles.addressLine}>{selectedOrder.delivery_pincode}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {selectedOrder.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{selectedOrder.notes}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <CustomButton
            title="Contact Farmer"
            onPress={handleContactFarmer}
            variant="outline"
            style={styles.actionButton}
          />
          
          {selectedOrder.trackingNumber && (
            <CustomButton
              title="Track Order"
              onPress={handleTrackOrder}
              variant="secondary"
              style={styles.actionButton}
            />
          )}
          
          {selectedOrder.status === 'pending' && (
            <CustomButton
              title="Cancel Order"
              onPress={handleCancelOrder}
              variant="outline"
              textStyle={{ color: Colors.error[500] }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Rest of your styles remain the same
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderHeader: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 8,
  },
  orderIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 20,
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
  orderDate: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statusContainer: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 8,
  },
  statusTimeline: {
    marginTop: 16,
  },
  statusStep: {
    marginBottom: 16,
  },
  statusStepContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusIconCompleted: {
    backgroundColor: Colors.success[500],
  },
  statusIconCurrent: {
    backgroundColor: Colors.primary[400],
  },
  statusLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  statusLabelCompleted: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  statusLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.neutral[200],
    marginLeft: 19,
    marginTop: 4,
  },
  statusLineCompleted: {
    backgroundColor: Colors.success[500],
  },
  orderDetails: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trackingNumber: {
    fontSize: 14,
    color: Colors.primary[600],
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  addressContainer: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 8,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.neutral[50],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  addressText: {
    flex: 1,
    marginLeft: 8,
  },
  addressLine: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  notesContainer: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    backgroundColor: Colors.neutral[50],
    padding: 12,
    borderRadius: 8,
  },
  actionsContainer: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
  },
});

export default OrderDetailPage;