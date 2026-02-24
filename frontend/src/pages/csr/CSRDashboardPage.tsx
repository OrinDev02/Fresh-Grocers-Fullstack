import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { ordersService } from '../../services/orders.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logoutAsync } from '../../store/features/auth/authSlice';

const CSRDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate(ROUTES.SELECT_ROLE);
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
            className="flex items-center gap-3 px-4 py-3 bg-green-500 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>

          <Link 
            to={ROUTES.CSR_ORDERS}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Orders
          </Link>

          <Link 
            to={ROUTES.CSR_POS}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg font-medium transition-colors"
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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Orders */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{dashboard?.totalOrders || 0}</h3>
              <p className="text-gray-500 text-sm">Total Orders</p>
            </div>

            
            {/* Customers */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{dashboard?.totalCustomers || 0}</h3>
              <p className="text-gray-500 text-sm">Customers</p>
            </div>

            {/* Delivery Persons */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{dashboard?.totalDeliveryPersons || 0}</h3>
              <p className="text-gray-500 text-sm">Active Riders</p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders - Takes 2 columns */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                <Link to={ROUTES.CSR_ORDERS} className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {pendingOrders.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No pending orders</p>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.slice(0, 5).map((order: any) => (
                    <div key={order._id} className="flex items-center justify-between py-4 border-b last:border-b-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{order.orderNumber}</h4>
                          <p className="text-sm text-gray-500">{order.customer?.fullName || 'Customer'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                            Pending
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Approvals - Takes 1 column */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Pending Approvals</h2>
                <span className="w-6 h-6 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  2
                </span>
              </div>

              <div className="space-y-4">
                {/* Quick Action Cards */}
                <Link 
                  to={ROUTES.CSR_APPROVALS}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">Delivery Partner</h3>
                      <p className="text-sm text-gray-500">2 pending approvals</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                    <button className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CSRDashboardPage;