import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCartAsync, updateCartItemAsync, removeFromCartAsync } from '../../store/features/cart/cartSlice';
import BottomNavigation from '../../components/customer/BottomNavigation';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ROUTES } from '../../utils/constants';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CustomerCartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { cart, isLoading } = useAppSelector((state) => state.cart);
  const [isCartOpen, setIsCartOpen] = useState(true);

  // Get cart item count
  

  useEffect(() => {
    dispatch(fetchCartAsync());
  }, [dispatch]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await dispatch(updateCartItemAsync({ itemId, quantity: newQuantity })).unwrap();
    } catch (error: any) {
      toast.error('Failed to update cart item');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await dispatch(removeFromCartAsync(itemId)).unwrap();
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error('Failed to remove item');
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      navigate(ROUTES.CUSTOMER_HOME);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 lg:pb-0 bg-gradient-to-br from-green-50 via-yellow-50 to-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white pb-20 lg:pb-0">
      {/* Modern Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-green-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button onClick={() => navigate(ROUTES.CUSTOMER_HOME)} className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Fresh Grocers</h1>
                <p className="text-xs text-gray-500 -mt-1">Shopping Cart</p>
              </div>
            </button>

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
              {/* Search Icon */}
              <button className="p-2 lg:p-2.5 hover:bg-green-50 rounded-xl transition-all">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
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

      {/* Main Content Area */}
      <div className="relative h-[calc(100vh-5rem)]">
        {/* Left Side - Product Browsing Area */}
        <div className="absolute inset-0 overflow-auto">
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                Continue Shopping
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Explore more amazing products while your cart is ready
              </p>
              <button
                onClick={() => navigate(ROUTES.CUSTOMER_PRODUCTS)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Browse All Products
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Cart Slide Panel */}
        <div
          className={`fixed top-16 lg:top-2 right-0 h-[calc(100vh-4rem)] lg:h-[calc(107vh-5rem)] w-full sm:w-[450px] lg:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Cart Header */}
          <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 flex items-center justify-between border-b-4 border-yellow-400 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Content */}
          <div className="h-[calc(100%-12rem)] overflow-y-auto">
            {!cart || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some products to get started!</p>
                <button
                  onClick={() => navigate(ROUTES.CUSTOMER_PRODUCTS)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {cart.items.map((item: any) => {
                  const itemId = item._id || item.productId;
                  if (!itemId) return null;

                  const product = typeof item.productId === 'object' ? item.productId : null;
                  const productName = product?.name || `Product ${typeof item.productId === 'object' ? item.productId._id : item.productId}`;
                  const productImage = product?.imageUrl;

                  return (
                    <div key={itemId} className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-4 border-2 border-green-100 hover:shadow-lg transition-all">
                      <div className="flex gap-3">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-white rounded-xl flex-shrink-0 overflow-hidden border-2 border-gray-100">
                          {productImage ? (
                            <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{productName}</h4>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-lg font-bold text-green-600">Rs.{item.price.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Total: Rs.{(item.price * item.quantity).toFixed(2)}</p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(itemId)}
                          className="self-start w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-green-100">
                        <span className="text-sm font-semibold text-gray-600">Quantity</span>
                        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border-2 border-green-200 shadow-sm">
                          <button
                            onClick={() => handleQuantityChange(itemId, item.quantity - 1)}
                            className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center font-bold transition-all"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(itemId, item.quantity + 1)}
                            className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center font-bold transition-all"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Footer - Totals & Checkout */}
          {cart && cart.items.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-green-100 p-6">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">Rs.{cart.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Shipping & Handling</span>
                  <span className="font-semibold">Rs.8.00</span>
                </div>
                <div className="border-t-2 border-green-100 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Order Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    Rs.{(cart.totalAmount + 8).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => navigate(ROUTES.CUSTOMER_CHECKOUT)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Checkout</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Overlay - Click to close cart */}
        {isCartOpen && (
          <div
            onClick={handleClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:block hidden"
          />
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CustomerCartPage;