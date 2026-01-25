import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { ordersService } from '../../services/orders.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { useAppSelector } from '../../store/hooks';

const CSRDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, ordersData] = await Promise.all([
          adminService.getDashboard(),
          ordersService.getOrders({ status: 'PENDING' }),
        ]);
        setDashboard(dashboardData);
        setPendingOrders(ordersData.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm mb-6">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-secondary">CSR Dashboard</h1>
            <div className="flex items-center gap-6">
              <Link to={ROUTES.CSR_ORDERS} className="text-gray-700 hover:text-secondary">
                Orders
              </Link>
              <Link to={ROUTES.CSR_APPROVALS} className="text-gray-700 hover:text-secondary">
                Approvals
              </Link>
              <Link to={ROUTES.CSR_PRODUCTS} className="text-gray-700 hover:text-secondary">
                Products
              </Link>
              <Link to={ROUTES.CSR_CATEGORIES} className="text-gray-700 hover:text-secondary">
                Categories
              </Link>
              <Link to={ROUTES.CSR_USERS} className="text-gray-700 hover:text-secondary">
                Users
              </Link>
              {user && <span className="text-gray-700">{user.fullName}</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="container-main py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-secondary">{dashboard?.totalOrders || 0}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-2">Pending Orders</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingOrders.length}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-2">Total Customers</p>
            <p className="text-3xl font-bold text-secondary">{dashboard?.totalCustomers || 0}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-2">Delivery Persons</p>
            <p className="text-3xl font-bold text-secondary">{dashboard?.totalDeliveryPersons || 0}</p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Pending Orders</h2>
            <Link to={ROUTES.CSR_ORDERS} className="text-secondary hover:underline">
              View All
            </Link>
          </div>
          {pendingOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending orders</p>
          ) : (
            <div className="space-y-4">
              {pendingOrders.slice(0, 5).map((order: any) => (
                <div key={order._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                      <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                      <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      PENDING
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-secondary">${order.totalAmount.toFixed(2)}</span>
                    <Link
                      to={`${ROUTES.CSR_ORDERS}/${order._id}`}
                      className="text-secondary hover:underline font-semibold"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to={ROUTES.CSR_APPROVALS} className="card hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold mb-2">Pending Approvals</h3>
            <p className="text-gray-600 mb-4">Review and approve delivery person applications</p>
            <button className="text-secondary font-semibold">View Approvals →</button>
          </Link>

          <Link to={ROUTES.CSR_PRODUCTS} className="card hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold mb-2">Manage Products</h3>
            <p className="text-gray-600 mb-4">Add, edit, or remove products from the catalog</p>
            <button className="text-secondary font-semibold">Manage Products →</button>
          </Link>

          <Link to={ROUTES.CSR_CATEGORIES} className="card hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold mb-2">Manage Categories</h3>
            <p className="text-gray-600 mb-4">Organize products into categories</p>
            <button className="text-secondary font-semibold">Manage Categories →</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CSRDashboardPage;