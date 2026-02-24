import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCartAsync, clearCart } from '../../store/features/cart/cartSlice';
import { ordersService } from '../../services/orders.service';
import { ROUTES } from '../../utils/constants';
import BottomNavigation from '../../components/customer/BottomNavigation';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const DELIVERY_FEE_RATE = 0.05; // 5% of subtotal
const MIN_DELIVERY_FEE = 2.0;
const MAX_DELIVERY_FEE = 10.0;

interface DeliveryAddressForm {
  street: string;
  city: string;
  district: string;
  province: string;
  latitude: number;
  longitude: number;
}

const CustomerCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, isLoading: cartLoading } = useAppSelector((state) => state.cart);
  

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddressForm>({
    street: '',
    city: 'Colombo',
    district: 'Colombo',
    province: 'Western',
    latitude: 6.9271,
    longitude: 80.6369,
  });

  

  useEffect(() => {
    if (!cart) {
      dispatch(fetchCartAsync());
    }
  }, [dispatch, cart]);

  // Redirect to cart if empty
  if (!cartLoading && (!cart || cart.items.length === 0)) {
    navigate(ROUTES.CUSTOMER_CART);
    return null;
  }

  // Calculate fees
  const subtotal = cart?.totalAmount || 0;
  const deliveryFee = Math.max(
    MIN_DELIVERY_FEE,
    Math.min(MAX_DELIVERY_FEE, subtotal * DELIVERY_FEE_RATE)
  );
  const total = subtotal + deliveryFee;

  const handleAddressChange = (field: keyof DeliveryAddressForm, value: any) => {
    setDeliveryAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!deliveryAddress.street.trim()) {
      toast.error('Please enter street address');
      return false;
    }
    if (!deliveryAddress.city.trim()) {
      toast.error('Please enter city');
      return false;
    }
    if (!deliveryAddress.district.trim()) {
      toast.error('Please enter district');
      return false;
    }
    if (!deliveryAddress.province.trim()) {
      toast.error('Please enter province');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const order = await ordersService.createOrder(deliveryAddress, deliveryFee);
      
      // Clear cart
      dispatch(clearCart());
      
      toast.success('Order placed successfully!');
      
      // Navigate to orders page with success state
      setTimeout(() => {
        navigate(ROUTES.CUSTOMER_ORDERS, { 
          state: { orderId: order._id, message: 'Your order has been placed successfully!' }
        });
      }, 500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
      console.error('Order placement error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 lg:pb-0 bg-gradient-to-br from-green-50 via-yellow-50 to-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white pb-20 lg:pb-0">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-green-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Fresh Grocers</h1>
                <p className="text-xs text-gray-500 -mt-1">Checkout</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <button onClick={() => navigate(ROUTES.CUSTOMER_HOME)} className="flex items-center gap-2 text-gray-600 font-medium hover:text-green-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </button>
              <button onClick={() => navigate(ROUTES.CUSTOMER_PRODUCTS)} className="flex items-center gap-2 text-gray-600 font-medium hover:text-green-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Products
              </button>
              <button onClick={() => navigate(ROUTES.CUSTOMER_ORDERS)} className="flex items-center gap-2 text-gray-600 font-medium hover:text-green-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Orders
              </button>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Cart */}
              <button onClick={() => navigate(ROUTES.CUSTOMER_CART)} className="relative group">
                <div className="p-2 lg:p-2.5 bg-green-50 hover:bg-green-100 rounded-xl transition-all group-hover:shadow-md">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  
                </div>
              </button>

              {/* Profile */}
              <button onClick={() => navigate(ROUTES.CUSTOMER_PROFILE)} className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Account</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigate(ROUTES.CUSTOMER_HOME)} className="text-gray-500 hover:text-green-600 transition-colors">Home</button>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <button onClick={() => navigate(ROUTES.CUSTOMER_CART)} className="text-gray-500 hover:text-green-600 transition-colors">Cart</button>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-green-600 font-semibold">Checkout</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 border-2 border-green-100 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Delivery Address</h2>
              </div>

              <div className="space-y-5">
                {/* Street Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="Enter your street address"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-400 transition-all"
                  />
                </div>

                {/* City and District */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="City"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      District *
                    </label>
                    <select
                      value={deliveryAddress.district}
                      onChange={(e) => handleAddressChange('district', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-400 transition-all bg-white"
                    >
                      <option value="Colombo">Colombo</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Kalutara">Kalutara</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Matara">Matara</option>
                      <option value="Galle">Galle</option>
                      <option value="Jaffna">Jaffna</option>
                      <option value="Mullaitivu">Mullaitivu</option>
                      <option value="Batticaloa">Batticaloa</option>
                      <option value="Trincomalee">Trincomalee</option>
                      <option value="Kurunegala">Kurunegala</option>
                      <option value="Puttalam">Puttalam</option>
                      <option value="Anuradhapura">Anuradhapura</option>
                      <option value="Polonnaruwa">Polonnaruwa</option>
                      <option value="Badulla">Badulla</option>
                      <option value="Monaragala">Monaragala</option>
                      <option value="Ratnapura">Ratnapura</option>
                      <option value="Kegalle">Kegalle</option>
                    </select>
                  </div>
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Province *
                  </label>
                  <select
                    value={deliveryAddress.province}
                    onChange={(e) => handleAddressChange('province', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-400 transition-all bg-white"
                  >
                    <option value="Western">Western</option>
                    <option value="Central">Central</option>
                    <option value="Southern">Southern</option>
                    <option value="Northern">Northern</option>
                    <option value="Eastern">Eastern</option>
                    <option value="North Western">North Western</option>
                    <option value="North Central">North Central</option>
                    <option value="Uva">Uva</option>
                    <option value="Sabaragamuwa">Sabaragamuwa</option>
                  </select>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={deliveryAddress.latitude}
                      onChange={(e) => handleAddressChange('latitude', parseFloat(e.target.value))}
                      placeholder="Latitude"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={deliveryAddress.longitude}
                      onChange={(e) => handleAddressChange('longitude', parseFloat(e.target.value))}
                      placeholder="Longitude"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-400 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Review */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 border-2 border-green-100 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {cart?.items.map((item: any) => {
                  const product = typeof item.productId === 'object' ? item.productId : null;
                  const productName = product?.name || `Product ${item.productId}`;
                  return (
                    <div key={item._id || item.productId} className="flex justify-between items-center pb-3 border-b-2 border-gray-100 last:border-0">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{productName}</p>
                        <p className="text-sm text-gray-500">{item.quantity} × Rs.{item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-bold text-green-600">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Total Section */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 lg:p-8 border-2 border-green-200 shadow-xl sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Order Total</h3>
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b-2 border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="font-bold text-gray-800">Rs.{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Delivery Fee</span>
                  <span className="font-bold text-gray-800">Rs.{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3">
                  <p className="text-xs text-yellow-800">
                    Delivery fee: {Math.round(DELIVERY_FEE_RATE * 100)}% of subtotal (Min: Rs.{MIN_DELIVERY_FEE.toFixed(2)}, Max: Rs.{MAX_DELIVERY_FEE.toFixed(2)})
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-green-200">
                <span className="text-lg font-bold text-gray-800">Total Amount</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Rs.{total.toFixed(2)}</span>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Payment Method</p>
                      <p className="text-xs text-blue-700">Cash on Delivery</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Place Order
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate(ROUTES.CUSTOMER_CART)}
                  disabled={isSubmitting}
                  className="w-full bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CustomerCheckoutPage;