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
import { Category } from '../../types';
import ProductService from '../../services/productService';

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
  style?: any;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with margins

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress, style }) => {
  const [imageUrl, setImageUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (category.imageUrl) {
      ProductService.getImageUrl(category.imageUrl)
        .then(setImageUrl)
        .catch(console.error);
    }
  }, [category.imageUrl]);

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={() => onPress(category)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <MaterialIcons name="category" size={32} color={Colors.neutral[400]} />
          </View>
        )}
        <View style={styles.overlay} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.nameHindi}>{category.nameHindi}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {category.description}
        </Text>
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
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.black,
    opacity: 0.1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  nameHindi: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: Colors.text.tertiary,
    lineHeight: 16,
  },
});

export default CategoryCard;