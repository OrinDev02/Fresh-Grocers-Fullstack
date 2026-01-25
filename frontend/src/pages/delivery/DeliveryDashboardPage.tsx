import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { deliveryService } from '../../services/delivery.service';
import { ordersService } from '../../services/orders.service';
import type { DeliveryProfile } from '../../types';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';

const DeliveryDashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<DeliveryProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, statsData, ordersData] = await Promise.all([
          deliveryService.getApprovalStatus(),
          deliveryService.getStats(),
          ordersService.getOrders({ status: 'ASSIGNED' }),
        ]);
        setProfile(profileData);
        setStats(statsData);
        setOrders(ordersData.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show approval pending screen if not approved
  if (profile && !profile.isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pb-20 lg:pb-0">
        <div className="max-w-md w-full card text-center">
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Approval Pending</h2>
            <p className="text-gray-600">Your application is being reviewed. You'll be notified once approved.</p>
            <p className="text-sm text-gray-500 mt-2">Status: {profile.status}</p>
          </div>
          <Link to={ROUTES.DELIVERY_PROFILE}>
            <Button variant="primary">View Profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm lg:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-secondary">Delivery Dashboard</h1>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
          {user && (
            <p className="text-sm text-gray-600">Hello, {user.fullName.split(' ')[0]}!</p>
          )}
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white shadow-sm mb-6">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-secondary">Delivery Dashboard</h1>
            <div className="flex items-center gap-6">
              <Link to={ROUTES.DELIVERY_ORDERS} className="text-gray-700 hover:text-secondary">
                Orders
              </Link>
              <Link to={ROUTES.DELIVERY_STATS} className="text-gray-700 hover:text-secondary">
                Stats
              </Link>
              <Link to={ROUTES.DELIVERY_PROFILE} className="text-gray-700 hover:text-secondary">
                Profile
              </Link>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {isOnline ? 'Online' : 'Offline'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-main py-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card text-center">
              <p className="text-sm text-gray-600 mb-1">Total Deliveries</p>
              <p className="text-2xl font-bold text-secondary">{stats.totalDeliveries || 0}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-600 mb-1">Average Rating</p>
              <p className="text-2xl font-bold text-secondary">{stats.averageRating?.toFixed(1) || '0.0'}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-secondary">${stats.totalEarnings?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
              <p className="text-2xl font-bold text-secondary">{orders.length}</p>
            </div>
          </div>
        )}

        {/* Assigned Orders */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Assigned Orders</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No assigned orders at the moment</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <div key={order._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                      <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-lg font-bold text-secondary">${order.totalAmount.toFixed(2)}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/delivery/orders/${order._id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboardPage;