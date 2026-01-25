import { useEffect, useState } from 'react';
import { ordersService } from '../../services/orders.service';
import type { Order, OrderStatus } from '../../types';
import { ROUTES, ORDER_STATUS } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const CSROrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm mb-6">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-secondary">Order Management</h1>
            <Link to={ROUTES.CSR_DASHBOARD} className="text-gray-700 hover:text-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container-main py-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['ALL', 'PENDING', 'ASSIGNED', 'ACCEPTED', 'DELIVERED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-secondary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`${ROUTES.CSR_ORDERS}/${order._id}`}
                className="card hover:shadow-lg transition-shadow block"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                    <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                    {order.deliveryPersonId && (
                      <p className="text-sm text-gray-600">Delivery Person ID: {order.deliveryPersonId}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold text-secondary">${order.totalAmount.toFixed(2)}</span>
                  <span className="text-secondary font-semibold">View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CSROrdersPage;