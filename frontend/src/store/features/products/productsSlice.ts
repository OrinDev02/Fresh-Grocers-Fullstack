import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Product } from '../../../types';
import { productsService } from '../../../services/products.service';

interface ProductsState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

const initialState: ProductsState = {
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 20,
};

export const fetchProductsAsync = createAsyncThunk(
  'products/fetch',
  async (params: { page?: number; limit?: number; search?: string; categoryId?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await productsService.getProducts(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductAsync = createAsyncThunk('products/fetchOne', async (id: string, { rejectWithValue }) => {
  try {
    const product = await productsService.getProduct(id);
    return product;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchProductsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentProduct } = productsSlice.actions;
export default productsSlice.reducer;