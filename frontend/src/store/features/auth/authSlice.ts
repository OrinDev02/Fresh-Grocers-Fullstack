import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  User,
  LoginDto,
  RegisterCustomerDto,
  RegisterDeliveryDto,
} from '../../../types';
import { authService } from '../../../services/auth.service';


interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};



const loadAuthFromStorage = (): Partial<AuthState> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (accessToken && user) {
      return {
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error('Failed to load auth from storage:', error);
  }
  return {};
};

const storedAuth = loadAuthFromStorage();

/* =======================
   Async Thunks
======================= */

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginDto, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const registerCustomerAsync = createAsyncThunk(
  'auth/registerCustomer',
  async (data: RegisterCustomerDto, { rejectWithValue }) => {
    try {
      const response = await authService.registerCustomer(data);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

export const registerDeliveryAsync = createAsyncThunk(
  'auth/registerDelivery',
  async (data: RegisterDeliveryDto, { rejectWithValue }) => {
    try {
      const response = await authService.registerDelivery(data);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
});

/* =======================
   Slice
======================= */

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...initialState,
    ...storedAuth,
  } as AuthState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },

    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },

    clearError: (state) => {
      state.error = null;
    },

    // 🔥 IMPORTANT FIX
    resetAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Register Customer
      .addCase(registerCustomerAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerCustomerAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(registerCustomerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Register Delivery
      .addCase(registerDeliveryAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerDeliveryAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(registerDeliveryAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

/* =======================
   Exports
======================= */

export const {
  setUser,
  setTokens,
  clearError,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;
