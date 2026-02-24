import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProductsAsync } from '../../store/features/products/productsSlice';
import { ordersService } from '../../services/orders.service';
import { deliveryService } from '../../services/delivery.service';
import POSProductItem from '../../components/customer/POSProductItem';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { logoutAsync } from '../../store/features/auth/authSlice';
import type { Product } from '../../types';
import { toast } from 'react-toastify';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface DeliveryPerson {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  averageRating: number;
}

const CSRPOSOrderPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, isLoading: productsLoading } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate(ROUTES.SELECT_ROLE);
  };

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Customer info state
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Delivery address state
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    district: '',
    province: '',
    latitude: 0,
    longitude: 0,
  });

  // Delivery fee and assignment
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Always fetch fresh products when component mounts
    const loadData = async () => {
      dispatch(fetchProductsAsync({ page: 1, limit: 100 }));
      await fetchDeliveryPersons();
    };
    loadData();
  }, [dispatch]);

  const fetchDeliveryPersons = async () => {
    try {
      // Fetch approved delivery persons
      const response = await deliveryService.getDeliveryPersons();
      setDeliveryPersons(response || []);
    } catch (error) {
      console.error('Failed to fetch delivery persons:', error);
    }
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product._id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prevItems,
        {
          productId: product._id,
          productName: product.name,
          quantity,
          price: product.price,
          imageUrl: product.imageUrl,
        },
      ];
    });

    toast.success(`${product.name} added to cart!`);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    setCustomerPhone(phone);
    setPhoneError('');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlaceOrder = async () => {
    // Validation
    if (!customerPhone.trim()) {
      setPhoneError('Customer phone number is required');
      return;
    }

    if (!validatePhoneNumber(customerPhone)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Cart is empty. Please add items before placing order.');
      return;
    }

    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.district || !deliveryAddress.province) {
      toast.error('Please fill in all delivery address fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderData = {
        customerPhone,
        customerName: customerName || 'Customer',
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryAddress,
        deliveryFee,
      };

      const order = await ordersService.createCSROrder(
        customerPhone,
        customerName || 'Customer',
        orderData.items,
        deliveryAddress,
        deliveryFee
      );

      toast.success('Order placed successfully!');

      // If delivery person is selected, assign the order
      if (selectedDeliveryPerson) {
        try {
          await ordersService.assignDeliveryPerson(order._id, selectedDeliveryPerson);
          toast.success('Delivery person assigned successfully!');
        } catch (error) {
          toast.warning('Order placed but failed to assign delivery person');
        }
      } else {
        setShowDeliveryModal(true);
      }

      // Reset form
      setCartItems([]);
      setCustomerPhone('');
      setCustomerName('');
      setDeliveryAddress({
        street: '',
        city: '',
        district: '',
        province: '',
        latitude: 0,
        longitude: 0,
      });
      setDeliveryFee(0);
      setSelectedDeliveryPerson('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (productsLoading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-yellow-50 to-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white">
      {/* Modern Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">FreshGrocers</span>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link 
            to={ROUTES.CSR_DASHBOARD}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-xl font-medium transition-all hover:translate-x-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>

          <Link 
            to={ROUTES.CSR_ORDERS}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-xl font-medium transition-all hover:translate-x-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Orders
          </Link>

          <Link 
            to={ROUTES.CSR_POS}
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl font-semibold transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            POS System
            <span className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
          </Link>

          <Link 
            to={ROUTES.CSR_USERS}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-xl font-medium transition-all hover:translate-x-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Users
          </Link>

          <Link 
            to={ROUTES.CSR_APPROVALS}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-xl font-medium transition-all hover:translate-x-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Delivery Partners
          </Link>

          <Link 
            to={ROUTES.CSR_PRODUCTS}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-xl font-medium transition-all hover:translate-x-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Products
          </Link>

          <Link 
            to={ROUTES.CSR_CATEGORIES}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-xl font-medium transition-all hover:translate-x-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Categories
          </Link>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user?.fullName?.charAt(0) || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-md border-b-2 border-green-100 px-8 py-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">POS System</h1>
                  <p className="text-gray-600 text-sm mt-0.5">Create orders with SMS confirmation</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-50 px-4 py-2 rounded-xl border-2 border-green-200">
                <p className="text-sm font-semibold text-gray-700">Items in Cart: <span className="text-green-600">{cartItems.length}</span></p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <main className="flex-1 flex overflow-hidden">
          {/* Products Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Bar */}
            <div className="p-6 bg-white border-b-2 border-green-100">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:border-green-400 transition-all"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Products Found</h3>
                  <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <POSProductItem
                      key={product._id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart & Order Section */}
          <div className="w-[420px] flex flex-col bg-white border-l-2 border-green-100 shadow-2xl overflow-hidden">
            {/* Cart Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold">Order Cart</h2>
                  <p className="text-sm text-white/80">{cartItems.length} items added</p>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-green-50/30 to-yellow-50/30">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-semibold">Cart is empty</p>
                  <p className="text-gray-500 text-sm mt-1">Add products to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="bg-white rounded-xl p-4 shadow-md border-2 border-green-100 hover:shadow-lg transition-all">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-green-50 rounded-xl flex-shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                          <p className="text-sm text-gray-600">Rs. {item.price.toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                              className="w-7 h-7 bg-green-100 hover:bg-green-200 rounded-lg flex items-center justify-center text-green-700 font-bold transition-all"
                            >
                              −
                            </button>
                            <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                              className="w-7 h-7 bg-green-100 hover:bg-green-200 rounded-lg flex items-center justify-center text-green-700 font-bold transition-all"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleRemoveFromCart(item.productId)}
                              className="ml-auto text-xs text-red-600 hover:text-red-700 font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            Rs. {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Details Form */}
            <div className="border-t-2 border-green-100 p-5 space-y-4 bg-white overflow-y-auto max-h-[50vh]">
              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Customer Phone Number *
                </label>
                <Input
                  type="tel"
                  placeholder="Enter customer phone"
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  error={phoneError}
                  className="w-full"
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Customer Name (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Delivery Address */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Delivery Address
                </h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Street"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="District"
                    value={deliveryAddress.district}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, district: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Province"
                    value={deliveryAddress.province}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, province: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
              </div>

              {/* Delivery Fee */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Delivery Fee (Rs.)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="10"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Delivery Person Assignment */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Assign Delivery Person (Optional)
                </label>
                <select
                  value={selectedDeliveryPerson}
                  onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  <option value="">Select a delivery person...</option>
                  {deliveryPersons.map((person) => (
                    <option key={person._id} value={person._id}>
                      {person.fullName} - {person.city} ({person.averageRating?.toFixed(1)} ⭐)
                    </option>
                  ))}
                </select>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl p-4 border-2 border-green-200 space-y-3">
                <h3 className="font-bold text-gray-800 mb-2">Order Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Delivery Fee:</span>
                  <span className="font-semibold">Rs. {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-green-200 pt-3 flex justify-between">
                  <span className="text-gray-900 font-bold text-lg">Total:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handlePlaceOrder}
                  isLoading={isSubmitting}
                  disabled={cartItems.length === 0 || isSubmitting}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Processing...'
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Place Order & Send SMS
                    </>
                  )}
                </Button>

                <button
                  onClick={() => {
                    setCartItems([]);
                    setCustomerPhone('');
                    setCustomerName('');
                    setDeliveryFee(0);
                    setSelectedDeliveryPerson('');
                    setDeliveryAddress({
                      street: '',
                      city: '',
                      district: '',
                      province: '',
                      latitude: 0,
                      longitude: 0,
                    });
                  }}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Clear Form
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CSRPOSOrderPage;