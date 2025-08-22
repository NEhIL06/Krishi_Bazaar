import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Dimensions,
  ViewStyle,
  ImageErrorEventData,
  NativeSyntheticEvent,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { Product } from '../../types';
import ProductService from '../../services/productService';
import * as Sentry from '@sentry/react-native';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  style?: ViewStyle;
  columns?: number; // Allow configurable columns
}

// Configuration constants
const CONFIG = {
  DEFAULT_COLUMNS: 2,
  HORIZONTAL_MARGIN: 48, // Total horizontal margins
  IMAGE_HEIGHT: 120,
  BORDER_RADIUS: 12,
  SHADOW: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
} as const;

// Image loading states
type ImageState = 'loading' | 'loaded' | 'error' | 'idle';

const { width } = Dimensions.get('window');

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress, 
  style,
  columns = CONFIG.DEFAULT_COLUMNS 
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageState, setImageState] = useState<ImageState>('idle');
  const isMountedRef = useRef(true);

  // Calculate card width based on columns
  const cardWidth = (width - CONFIG.HORIZONTAL_MARGIN) / columns;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load image URL with proper cleanup
  useEffect(() => {
    if (!product.images || product.images.length === 0) {
      setImageState('error');
      return;
    }

    const loadImageUrl = async () => {
      try {
        setImageState('loading');
        const url = product.images[0];
        console.log('Fetched image URL:', url);
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setImageUrl(url);
          setImageState('loaded');
        }
      } catch (error) {
        console.error('Error fetching image URL:', error);
        Sentry.captureException(error, {
          tags: {
            component: 'ProductCard',
            productId: product.$id,
          },
          extra: {
            productName: product.name,
            imageId: product.images?.[0],
          },
        });

        if (isMountedRef.current) {
          setImageState('error');
        }
      }
    };

    loadImageUrl();
  }, [product.images, product.$id, product.name]);

  // Memoized price formatter
  const formatPrice = useCallback((price: any) => {
    console.log('Product price data:', price, typeof price);
    
    // Handle different price formats
    if (typeof price === 'object' && price !== undefined) {
      return `₹${price.toLocaleString('en-IN')}/kg`;
    }
    if (typeof price === 'number') {
      return `₹${price.toLocaleString('en-IN')}/kg`;
    }
    if (typeof price === 'string') {
      const numPrice = parseFloat(price);
      if (!isNaN(numPrice)) {
        return `₹${numPrice.toLocaleString('en-IN')}/kg`;
      }
    }
    return `₹0/kg`;
  }, []);

  // Memoized quantity formatter
  const formatQuantity = useCallback((quantity: number, minimumQuantity?: number) => {
    const minQty = minimumQuantity || 1;
    const availableQty = quantity || 0;
    
    if (availableQty === 0) {
      return 'Out of stock';
    }
    
    return `${availableQty.toLocaleString('en-IN')} kg available (Min: ${minQty} kg)`;
  }, []);

  // Handle image loading error
  const handleImageError = useCallback((error: NativeSyntheticEvent<ImageErrorEventData>) => {
    console.error('Image load error:', error.nativeEvent.error);
    setImageState('error');
  }, []);

  // Handle image load success
  const handleImageLoad = useCallback(() => {
    setImageState('loaded');
  }, []);

  // Retry image loading
  const retryImageLoad = useCallback(() => {
    if (product.images && product.images.length > 0) {
      setImageState('loading');
      // Re-trigger the effect by updating a dependency
      setImageUrl('');
    }
  }, [product.images]);

  // Render image with proper states
  const renderImage = () => {
    const imageContainerStyle = [
      styles.image,
      { borderTopLeftRadius: CONFIG.BORDER_RADIUS, borderTopRightRadius: CONFIG.BORDER_RADIUS }
    ];

    switch (imageState) {
      case 'loading':
        return (
          <View style={[...imageContainerStyle, styles.placeholderImage]}>
            <MaterialIcons name="hourglass-empty" size={24} color={Colors.neutral[400]} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        );
      
      case 'loaded':
        return (
          <Image 
            source={{ uri: imageUrl.toString()}} 
            style={imageContainerStyle}
            onError={handleImageError}
            onLoad={handleImageLoad}
            resizeMode="cover"
          />
        );
      
      case 'error':
        return (
          <TouchableOpacity
            style={[...imageContainerStyle, styles.placeholderImage, styles.errorImage]}
            onPress={retryImageLoad}
            activeOpacity={0.7}
          >
            <MaterialIcons name="error-outline" size={24} color={Colors.error[400]} />
            <Text style={styles.errorText}>Tap to retry</Text>
          </TouchableOpacity>
        );
      
      default:
        return (
          <View style={[...imageContainerStyle, styles.placeholderImage]}>
            <MaterialIcons name="image" size={32} color={Colors.neutral[400]} />
          </View>
        );
    }
  };

  return (
    <TouchableOpacity 
  style={[
    styles.container, 
    { width: cardWidth },
    CONFIG.SHADOW,
    style
  ].filter(Boolean)} // Filter out false values
  onPress={() => onPress(product)}
  activeOpacity={0.8}
>
  <View style={styles.imageContainer}>
    {renderImage()}
    {product.isOrganic && (
      <View style={styles.organicBadge}>
        <MaterialIcons name="eco" size={12} color={Colors.white} />
        <Text style={styles.organicText}>Organic</Text>
      </View>
    )}
  </View>
  
  <View style={styles.content}>
    <Text style={styles.name} numberOfLines={2}>
      {product.name}
    </Text>
    <Text style={styles.variety} numberOfLines={1}>
      {product.variety || 'Standard'}
    </Text>
    
    <View style={styles.priceRow}>
      <Text style={styles.price}>
        {formatPrice(product.price)}
      </Text>
      {product.grade && (
        <View style={styles.gradeContainer}>
          <Text style={styles.grade}>{product.grade}</Text>
        </View>
      )}
    </View>
    
    <View style={styles.quantityRow}>
      <MaterialIcons name="inventory" size={16} color={Colors.neutral[500]} />
      <Text style={styles.quantity}>
        {formatQuantity(product.availableQuantity, product.minimumQuantity)}
      </Text>
    </View>
    
    <View style={styles.locationRow}>
      <MaterialIcons name="location-on" size={16} color={Colors.neutral[500]} />
      <Text style={styles.location} numberOfLines={1}>
        {[product.city, product.state].filter(Boolean).join(', ') || 'Location not specified'}
      </Text>
    </View>

    {product?.rating && product.rating > 0 && (
      <View style={styles.ratingRow}>
        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={14} color={Colors.warning[500]} />
          <Text style={styles.ratingText}>
            {product.rating.toFixed(1)}
          </Text>
        </View>
      </View>
    )}
  </View>
</TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: CONFIG.BORDER_RADIUS,
    marginBottom: 16,
    overflow: 'hidden', // Ensures proper clipping
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: CONFIG.IMAGE_HEIGHT,
  },
  placeholderImage: {
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorImage: {
    backgroundColor: Colors.error[50],
    borderWidth: 1,
    borderColor: Colors.error[200],
    borderStyle: 'dashed',
  },
  loadingText: {
    fontSize: 10,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  errorText: {
    fontSize: 10,
    color: Colors.error[600],
    marginTop: 4,
    fontWeight: '500',
  },
  organicBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.success[500],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  organicText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 2,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.error[500],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
    lineHeight: 18,
  },
  variety: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary[600],
    flex: 1,
  },
  gradeContainer: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  grade: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.neutral[700],
    textTransform: 'uppercase',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginLeft: 4,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginLeft: 4,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 10,
    color: Colors.warning[700],
    marginLeft: 2,
    fontWeight: '600',
  },
});

export default ProductCard;