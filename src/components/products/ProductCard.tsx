import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Dimensions 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { Product } from '../../types';
import ProductService from '../../services/productService';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  style?: any;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with margins

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, style }) => {
  const [imageUrl, setImageUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (product.images && product.images.length > 0) {
      ProductService.getImageUrl(product.images[0])
        .then(setImageUrl)
        .catch(console.error);
    }
  }, [product.images]);

  const formatPrice = (price: Product['price']) => {
    return `₹${price.amount}/${price.unit}`;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={() => onPress(product)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <MaterialIcons name="image" size={32} color={Colors.neutral[400]} />
          </View>
        )}
        {product.isOrganic && (
          <View style={styles.organicBadge}>
            <Text style={styles.organicText}>Organic</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.variety} numberOfLines={1}>{product.variety}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <View style={styles.gradeContainer}>
            <Text style={styles.grade}>{product.grade}</Text>
          </View>
        </View>
        
        <View style={styles.quantityRow}>
          <MaterialIcons name="inventory" size={16} color={Colors.neutral[500]} />
          <Text style={styles.quantity}>
            {product.availableQuantity} {product.price.unit} available
          </Text>
        </View>
        
        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={16} color={Colors.neutral[500]} />
          <Text style={styles.location} numberOfLines={1}>
            {product.location.address}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  organicBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.success[500],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  organicText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  variety: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 8,
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
  },
  gradeContainer: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  grade: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.neutral[700],
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
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginLeft: 4,
    flex: 1,
  },
});

export default ProductCard;