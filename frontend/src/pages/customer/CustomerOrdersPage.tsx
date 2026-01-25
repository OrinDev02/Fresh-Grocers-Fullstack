import { useEffect, useState } from 'react';
import { ordersService } from '../../services/orders.service';
import BottomNavigation from '../../components/customer/BottomNavigation';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Order, OrderStatus } from '../../types';
import { Link } from 'react-router-dom';
import { ROUTES, ORDER_STATUS } from '../../utils/constants';

const CustomerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ordersService.getOrders();
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

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
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-white shadow-sm lg:hidden">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-secondary">My Orders</h1>
        </div>
      </header>

      <div className="container-main py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Link to={ROUTES.CUSTOMER_PRODUCTS}>
              <button className="btn-primary">Start Shopping</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="card hover:shadow-lg transition-shadow block"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                    <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-600">{order.items.length} item(s)</span>
                  <span className="text-lg font-bold text-secondary">${order.totalAmount.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CustomerOrdersPage;