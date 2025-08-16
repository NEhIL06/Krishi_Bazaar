import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { RootState, AppDispatch } from '../../src/store';
import { fetchProductById } from '../../src/store/slices/productSlice';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import CustomButton from '../../src/components/common/CustomButton';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorMessage from '../../src/components/common/ErrorMessage';
import ProductService from '../../src/services/productService';
import orderService from '@/src/services/orderService';

const { width } = Dimensions.get('window');

const ProductDetailPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProduct, isLoading, error } = useSelector((state: RootState) => state.products);
  const { user } = useSelector((state: RootState) => state.auth);
  const params = useLocalSearchParams();
  
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchProductById(params.id as string));
    }
  }, [params.id]);

  useEffect(() => {
    if (selectedProduct?.images) {
      // Fetch image URLs for the selected product
      setImageUrls(selectedProduct.images);
     
    }
  }, [selectedProduct?.images]);

  const formatPrice = (price: any) => {
    return `₹${price.amount}.toLocaleString('en-IN')}/${price.unit}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString);
  };

  const handleOrder = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to place an order');
      return;
    }

    if (!selectedProduct) return;

    const totalAmount = selectedProduct.price * quantity;
    
    Alert.alert(
      'Confirm Order',
      `Order ${quantity} ${selectedProduct.price} of ${selectedProduct.name} for ${formatPrice({ amount: totalAmount, unit: 'total' })}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            const id = orderService.createOrder({
                product: selectedProduct.name,
                buyer: user?.$id.toString(),
                farmer: selectedProduct.farmer,
                quantity: quantity,
                totalAmount: totalAmount,
                delivery_street: '',  
                delivery_city: '',
                delivery_state: '', 
                delivery_pincode: '',
                expectedDeliveryDate: ''
            })

            // Navigate to order confirmation or create order
            router.push({
              pathname: '/order/[id]',
              params: {
                id: id.toString(),
                productId: selectedProduct.$id,
                quantity: quantity.toString(),
                totalAmount: totalAmount.toString(),
              }
            });
          }
        }
      ]
    );
  };

  const handleContactFarmer = () => {
    if (!selectedProduct) return;
    
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: selectedProduct.farmer,
        name: 'Farmer'
      }
    });
  };

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => dispatch(fetchProductById(params.id as string))}
      />
    );
  }

  if (!selectedProduct) {
    return (
      <View style={styles.notFound}>
        <MaterialIcons name="search-off" size={64} color={Colors.neutral[400]} />
        <Text style={styles.notFoundText}>Product not found</Text>
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
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <MaterialIcons name="share" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {imageUrls.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / width);
                  setCurrentImageIndex(index);
                }}
              >
                {imageUrls.map((url, index) => (
                  <Image key={index} source={{ uri: url }} style={styles.productImage} />
                ))}
              </ScrollView>
              {imageUrls.length > 1 && (
                <View style={styles.imageIndicators}>
                  {imageUrls.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        index === currentImageIndex && styles.activeIndicator,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialIcons name="image" size={64} color={Colors.neutral[400]} />
            </View>
          )}
          
          {selectedProduct.isOrganic && (
            <View style={styles.organicBadge}>
              <MaterialIcons name="eco" size={16} color={Colors.white} />
              <Text style={styles.organicText}>Organic</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.productName}>{selectedProduct.name}</Text>
              <Text style={styles.productNameHindi}>{selectedProduct.nameHindi}</Text>
            </View>
            <View style={styles.gradeContainer}>
              <Text style={styles.grade}>{selectedProduct.grade}</Text>
            </View>
          </View>

          <Text style={styles.variety}>{selectedProduct.variety}</Text>
          <Text style={styles.description}>{selectedProduct.description}</Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(selectedProduct.price)}</Text>
            <Text style={styles.minimumOrder}>
              Min. order: {selectedProduct.minimumQuantity} {selectedProduct.price}
            </Text>
          </View>

          {/* Availability */}
          <View style={styles.availabilityContainer}>
            <MaterialIcons name="inventory" size={20} color={Colors.success[500]} />
            <Text style={styles.availabilityText}>
              {selectedProduct.availableQuantity} {selectedProduct.price} available
            </Text>
          </View>

          {/* Product Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Harvest Date:</Text>
              <Text style={styles.detailValue}>{formatDate(selectedProduct.harvestDate).toString()}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expiry Date:</Text>
              <Text style={styles.detailValue}>{formatDate(selectedProduct.expiryDate).toString()}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Storage:</Text>
              <Text style={styles.detailValue}>{selectedProduct.storageConditions}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery:</Text>
              <Text style={styles.detailValue}>{selectedProduct.deliveryTimeframe}</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationContainer}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={20} color={Colors.primary[400]} />
              <Text style={styles.locationText}>{selectedProduct.city}, {selectedProduct.state}</Text>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(selectedProduct.minimumQuantity, quantity - 1))}
              >
                <MaterialIcons name="remove" size={24} color={Colors.primary[400]} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>
                {quantity} {selectedProduct.price}
              </Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.min(selectedProduct.availableQuantity, quantity + 1))}
              >
                <MaterialIcons name="add" size={24} color={Colors.primary[400]} />
              </TouchableOpacity>
            </View>
            <Text style={styles.totalPrice}>
              Total: {formatPrice({ amount: selectedProduct.price * quantity, unit: 'total' })}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <CustomButton
          title="Contact Farmer"
          onPress={handleContactFarmer}
          variant="outline"
          style={styles.contactButton}
        />
        <CustomButton
          title="Place Order"
          onPress={handleOrder}
          style={styles.orderButton}
        />
      </View>
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  productImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: width,
    height: 300,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    opacity: 0.5,
    marginHorizontal: 4,
  },
  activeIndicator: {
    opacity: 1,
  },
  organicBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  organicText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  productInfo: {
    backgroundColor: Colors.white,
    padding: 16,
    marginTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  productNameHindi: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  gradeContainer: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  grade: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary[700],
  },
  variety: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary[600],
  },
  minimumOrder: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  availabilityText: {
    fontSize: 14,
    color: Colors.success[600],
    marginLeft: 4,
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
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
  certificationsContainer: {
    marginBottom: 20,
  },
  certificationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  certificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  certificationText: {
    fontSize: 12,
    color: Colors.success[700],
    marginLeft: 4,
  },
  locationContainer: {
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 4,
    flex: 1,
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginHorizontal: 20,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary[600],
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  contactButton: {
    flex: 1,
    marginRight: 8,
  },
  orderButton: {
    flex: 1,
    marginLeft: 8,
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

export default ProductDetailPage;