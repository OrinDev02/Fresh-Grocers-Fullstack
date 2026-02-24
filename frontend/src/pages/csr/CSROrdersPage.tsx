import { useEffect, useState } from 'react';
import { ordersService } from '../../services/orders.service';
import { deliveryService } from '../../services/delivery.service';
import type { Order, OrderStatus, DeliveryProfile } from '../../types';
import { ROUTES, ORDER_STATUS } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logoutAsync } from '../../store/features/auth/authSlice';
import { toast } from 'react-toastify';

const CSROrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [nearbyDeliveryPersons, setNearbyDeliveryPersons] = useState<DeliveryProfile[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate(ROUTES.SELECT_ROLE);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ordersService.getOrders(
          statusFilter !== 'ALL' ? { status: statusFilter } : undefined
        );
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case ORDER_STATUS.DELIVERED:
        return 'bg-green-100 text-green-800';
      case ORDER_STATUS.ACCEPTED:
        return 'bg-blue-100 text-blue-800';
      case ORDER_STATUS.ASSIGNED:
        return 'bg-yellow-100 text-yellow-800';
      case ORDER_STATUS.PENDING:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const handleOpenAssignModal = async (order: Order) => {
    setSelectedOrder(order);
    setShowAssignModal(true);
    setIsLoadingNearby(true);

    try {
      console.log('Finding nearby delivery persons:', {
        latitude: order.deliveryAddress.latitude,
        longitude: order.deliveryAddress.longitude,
        district: order.deliveryAddress.district,
      });
      
      // Get nearby delivery persons based on delivery address
      const nearby = await deliveryService.findNearby(
        order.deliveryAddress.latitude || 0,
        order.deliveryAddress.longitude || 0,
        5, // 5km radius
        order.deliveryAddress.district // Pass district for fallback matching
      );
      console.log('Nearby delivery persons:', nearby);
      setNearbyDeliveryPersons(nearby || []);

      if (nearby && nearby.length === 0) {
        toast.warning('No nearby delivery persons found. Please check later.');
      }
    } catch (error: any) {
      console.error('Failed to fetch nearby delivery persons:', error.response?.data || error.message);
      toast.error('Failed to find nearby delivery persons');
    } finally {
      setIsLoadingNearby(false);
    }
  };

  const handleAssignDeliveryPerson = async (deliveryPersonId: string) => {
    if (!selectedOrder) return;

    setIsAssigning(true);
    try {
      console.log('Assigning delivery person:', { orderId: selectedOrder._id, deliveryPersonId });
      await ordersService.assignDeliveryPerson(selectedOrder._id, deliveryPersonId);
      toast.success('Delivery person assigned successfully!');
      
      // Refresh orders
      const response = await ordersService.getOrders(
        statusFilter !== 'ALL' ? { status: statusFilter } : undefined
      );
      setOrders(response.data);
      setShowAssignModal(false);
      setSelectedOrder(null);
      setNearbyDeliveryPersons([]);
    } catch (error: any) {
      console.error('Assignment error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error?.message || 'Failed to assign delivery person';
      toast.error(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold">FreshGrocers</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            to={ROUTES.CSR_DASHBOARD}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>

          <Link 
            to={ROUTES.CSR_ORDERS}
            className="flex items-center gap-3 px-4 py-3 bg-green-500 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Orders
          </Link>

          <Link 
            to={ROUTES.CSR_POS}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            POS System
          </Link>

          <Link 
            to={ROUTES.CSR_USERS}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Users
          </Link>

          <Link 
            to={ROUTES.CSR_APPROVALS}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Delivery Partners
          </Link>

          <Link 
            to={ROUTES.CSR_PRODUCTS}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Products
          </Link>

          <Link 
            to={ROUTES.CSR_CATEGORIES}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Categories
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-700 p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg font-medium transition-colors"
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
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-500 text-sm mt-1">Manage and track all orders</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.fullName || 'Admin User'}</span>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Filter Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap gap-2">
              {['ALL', 'PENDING', 'ASSIGNED', 'ACCEPTED', 'DELIVERED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No orders found</p>
                <p className="text-gray-400 text-sm mt-1">Orders will appear here once customers place them</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Delivery Person
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">#{order.orderNumber}</div>
                              <div className="text-xs text-gray-500">ID: {order._id.slice(-8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {typeof order.customerId === 'string' ? 'N/A' : order.customerId?.fullName || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {typeof order.customerId === 'string' ? 'N/A' : order.customerId?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.items.length} items
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            ${order.totalAmount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.deliveryPersonId ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-900">
                                  {typeof order.deliveryPersonId === 'string' ? 'Assigned' : order.deliveryPersonId?.fullName || 'Assigned'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {typeof order.deliveryPersonId === 'string' ? order.deliveryPersonId.slice(-6) : order.deliveryPersonId?._id.slice(-6)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleOpenAssignModal(order)}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Assign
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            to={`${ROUTES.CSR_ORDERS}/${order._id}`}
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            View
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Assign Delivery Person Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Assign Delivery Person</h2>
              <p className="text-sm text-gray-600 mt-1">
                Order #{selectedOrder?.orderNumber} - {selectedOrder?.deliveryAddress.city}
              </p>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              {isLoadingNearby ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : nearbyDeliveryPersons.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-600 font-medium">No nearby delivery persons available</p>
                  <p className="text-xs text-gray-500 mt-1">Try again later or manually select a delivery person</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nearbyDeliveryPersons.map((person) => (
                    <button
                      key={person._id}
                      onClick={() => handleAssignDeliveryPerson(person._id)}
                      disabled={isAssigning}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {typeof person.userId === 'string' ? 'Delivery Person' : person.userId?.fullName || 'Delivery Person'}
                          </p>
                          <p className="text-xs text-gray-600">{person.city}</p>
                          <p className="text-xs text-gray-500">
                            {typeof person.userId === 'string' ? 'N/A' : person.userId?.phone || 'N/A'}
                          </p>
                          {person.averageRating && (
                            <div className="flex items-center gap-1 mt-1">
                              <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                              <span className="text-xs font-medium">{person.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-3 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedOrder(null);
                  setNearbyDeliveryPersons([]);
                }}
                disabled={isAssigning}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSROrdersPage;