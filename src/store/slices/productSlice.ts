import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, Category } from '../../types';
import ProductService from '../../services/productService';

interface ProductState {
  products: Product[];
  categories: Category[];
  featuredProducts: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    category?: string;
    priceRange?: { min: number; max: number };
    isOrganic?: boolean;
    location?: { latitude: number; longitude: number; radius: number };
  };
}

const initialState: ProductState = {
  products: [],
  categories: [],
  featuredProducts: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: {},
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params?: { filters?: any; sort?: any; limit?: number; offset?: number }) => {
    return await ProductService.getProducts(
      params?.filters,
      params?.sort,
      params?.limit,
      params?.offset
    );
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId: string) => {
    return await ProductService.getProductById(productId);
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async () => {
    return await ProductService.getCategories();
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async ({ query, filters, limit }: { query: string; filters?: any; limit?: number }) => {
    return await ProductService.searchProducts(query, filters, limit);
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (limit?: number) => {
    return await ProductService.getFeaturedProducts(limit);
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      // Fetch product by ID
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedProduct = action.payload;
      })
      // Fetch categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Search products
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      })
      // Fetch featured products
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  setFilters,
  clearFilters,
  setSelectedProduct,
  clearError,
} = productSlice.actions;

export default productSlice.reducer;