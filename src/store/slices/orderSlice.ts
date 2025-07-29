import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Order } from '../../types';
import OrderService from '../../services/orderService';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: any) => {
    return await OrderService.createOrder(orderData);
  }
);

export const fetchOrdersByBuyer = createAsyncThunk(
  'orders/fetchOrdersByBuyer',
  async (buyerId: string) => {
    return await OrderService.getOrdersByBuyer(buyerId);
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: string) => {
    return await OrderService.getOrderById(orderId);
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, trackingNumber }: { 
    orderId: string; 
    status: Order['status']; 
    trackingNumber?: string;
  }) => {
    return await OrderService.updateOrderStatus(orderId, status, trackingNumber);
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, reason }: { orderId: string; reason?: string }) => {
    return await OrderService.cancelOrder(orderId, reason);
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create order';
      })
      // Fetch orders by buyer
      .addCase(fetchOrdersByBuyer.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      // Fetch order by ID
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.$id === action.payload.$id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?.$id === action.payload.$id) {
          state.selectedOrder = action.payload;
        }
      })
      // Cancel order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.$id === action.payload.$id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });
  },
});

export const { clearError, setSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;