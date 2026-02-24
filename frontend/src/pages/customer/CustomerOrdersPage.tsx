import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersService } from '../../services/orders.service';
import { ratingsService } from '../../services/ratings.service';
import BottomNavigation from '../../components/customer/BottomNavigation';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Order, OrderStatus } from '../../types';
import { Link } from 'react-router-dom';
import { ROUTES, ORDER_STATUS } from '../../utils/constants';
import { toast } from 'react-toastify';


const CustomerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingData, setRatingData] = useState({
    rating: 5,
    comment: '',
  });
  const [ratedOrders, setRatedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ordersService.getOrders();
        setOrders(response.data);
        
        // Check which orders are already rated
        const ratedSet = new Set<string>();
        for (const order of response.data) {
          try {
            const existingRating = await ratingsService.getOrderRating(order._id);
            if (existingRating && existingRating._id) {
              ratedSet.add(order._id);
            }
          } catch (error) {
            // If error fetching rating, assume not rated
            console.log(`No rating found for order ${order._id}`);
          }
        }
        setRatedOrders(ratedSet);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case ORDER_STATUS.DELIVERED:
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case ORDER_STATUS.ACCEPTED:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case ORDER_STATUS.ASSIGNED:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case ORDER_STATUS.PENDING:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      default:
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case ORDER_STATUS.DELIVERED:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case ORDER_STATUS.ACCEPTED:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case ORDER_STATUS.ASSIGNED:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const handleSubmitRating = async (orderId: string, deliveryPersonId: string) => {
    if (!ratingData.rating || ratingData.rating < 1 || ratingData.rating > 5) {
      toast.error('Please select a rating between 1 and 5');
      return;
    }

    setRatingSubmitting(true);
    try {
      console.log('Submitting rating:', { orderId, deliveryPersonId, rating: ratingData.rating });
      await ratingsService.createRating(
        orderId,
        deliveryPersonId,
        ratingData.rating,
        ratingData.comment
      );
      
      setRatedOrders((prev) => new Set([...prev, orderId]));
      setRatingOrderId(null);
      setRatingData({ rating: 5, comment: '' });
      toast.success('Thank you for rating!');
    } catch (error: any) {
      console.error('Rating submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleCloseRating = () => {
    setRatingOrderId(null);
    setRatingData({ rating: 5, comment: '' });
  };

  // Get the current order being rated
  const currentRatingOrder = orders.find(order => order._id === ratingOrderId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white pb-20 lg:pb-0">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-green-100">
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
                <p className="text-xs text-gray-500 -mt-1">My Orders</p>
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
              
              <button onClick={() => navigate(ROUTES.CUSTOMER_ORDERS)} className="flex items-center gap-2 text-green-600 font-semibold transition-colors">
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

      <div className="container mx-auto px-4 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 max-w-md mx-auto">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
            <button
              onClick={() => navigate(ROUTES.CUSTOMER_PRODUCTS)}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">My Orders</h2>
              <p className="text-gray-600">Track and manage your orders</p>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl border-2 border-green-100 hover:shadow-xl transition-all overflow-hidden">
                  <Link
                    to={`/orders/${order._id}`}
                    className="block p-6 hover:bg-gradient-to-br hover:from-green-50 hover:to-yellow-50 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">Order #{order.orderNumber}</h4>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(order.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md inline-flex items-center gap-2 w-fit ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t-2 border-green-100">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="font-medium">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      </div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                        Rs.{order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </Link>

                  {/* Rating Button for Delivered Orders */}
                  {order.status === ORDER_STATUS.DELIVERED && !ratedOrders.has(order._id) && (
                    <div className="border-t-2 border-green-100 p-4 bg-gradient-to-br from-yellow-50 to-green-50">
                      <button
                        onClick={() => setRatingOrderId(order._id)}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Rate Delivery Person
                      </button>
                    </div>
                  )}

                  {/* Already Rated Badge */}
                  {order.status === ORDER_STATUS.DELIVERED && ratedOrders.has(order._id) && (
                    <div className="border-t-2 border-green-100 p-4 bg-gradient-to-r from-green-50 to-green-100">
                      <div className="flex items-center justify-center gap-2 text-green-700 font-semibold">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Thank you! You've rated this delivery</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Rating Modal/Overlay */}
      {ratingOrderId && currentRatingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 lg:px-8 py-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Rate Your Delivery</h3>
                    <p className="text-white/90 text-sm">Order #{currentRatingOrder.orderNumber}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseRating}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 lg:p-8 space-y-6">
              {/* Star Rating Section */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                <label className="block text-lg font-bold text-gray-800 mb-4 text-center">
                  How was your delivery experience?
                </label>
                <div className="flex gap-3 justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingData({ ...ratingData, rating: star })}
                      className={`text-6xl transition-all transform hover:scale-125 active:scale-95 ${
                        star <= ratingData.rating ? 'text-yellow-400 drop-shadow-lg' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <div className="inline-block bg-white px-6 py-3 rounded-xl shadow-md">
                    <p className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      {ratingData.rating} out of 5 stars
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {ratingData.rating === 5 && '🌟 Excellent!'}
                      {ratingData.rating === 4 && '😊 Very Good!'}
                      {ratingData.rating === 3 && '👍 Good'}
                      {ratingData.rating === 2 && '😐 Fair'}
                      {ratingData.rating === 1 && '😞 Poor'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comment Section */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  Share Your Feedback
                  <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
                </label>
                <textarea
                  value={ratingData.comment}
                  onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
                  placeholder="Tell us about your delivery experience... What did you like? What could be improved?"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 transition-all resize-none text-gray-700 placeholder-gray-400"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your feedback helps us improve our delivery service
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => {
                    const deliveryPersonId = typeof currentRatingOrder.deliveryPersonId === 'string' 
                      ? currentRatingOrder.deliveryPersonId 
                      : currentRatingOrder.deliveryPersonId?._id;
                    if (deliveryPersonId) {
                      handleSubmitRating(currentRatingOrder._id, deliveryPersonId);
                    }
                  }}
                  disabled={ratingSubmitting || !currentRatingOrder.deliveryPersonId}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {ratingSubmitting ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Rating
                    </>
                  )}
                </button>
                <button
                  onClick={handleCloseRating}
                  disabled={ratingSubmitting}
                  className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CustomerOrdersPage;