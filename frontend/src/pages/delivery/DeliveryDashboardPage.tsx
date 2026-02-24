import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { deliveryService } from '../../services/delivery.service';
import { ordersService } from '../../services/orders.service';
import { logoutAsync } from '../../store/features/auth/authSlice';
import type { DeliveryProfile } from '../../types';
import { Link, useLocation } from 'react-router-dom';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      navigate(ROUTES.SELECT_ROLE, { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching delivery dashboard data...');
        console.log('Current user:', user);
        const [profileData, statsData, ordersData] = await Promise.all([
          deliveryService.getApprovalStatus(),
          deliveryService.getStats(),
          ordersService.getOrders({ status: 'ASSIGNED' }),
        ]);
        console.log('Profile received:', profileData);
        console.log('Stats received:', statsData);
        console.log('Orders received:', ordersData);
        setProfile(profileData);
        setStats(statsData);
        setOrders(ordersData.data || []);
      } catch (error: any) {
        console.error('Failed to fetch data:', error.message);
        console.error('Error status:', error.response?.status);
        console.error('Error details:', error.response?.data || error);
        // Set safe defaults on error
        setProfile(null);
        setStats(null);
        setOrders([]);
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

  // Show approval pending screen if not approved
  if (profile && !profile.isApproved) {
    const handleApprovalLogout = async () => {
      try {
        await dispatch(logoutAsync()).unwrap();
        navigate(ROUTES.SELECT_ROLE, { replace: true });
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pb-20 lg:pb-0">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Approval Pending</h2>
            <p className="text-gray-600">Your application is being reviewed. You'll be notified once approved.</p>
            <p className="text-sm text-gray-500 mt-2">Status: {profile.status}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to={ROUTES.DELIVERY_PROFILE}>
              <Button variant="primary" className="w-full bg-orange-500 hover:bg-orange-600">View Profile</Button>
            </Link>
            <button
              onClick={handleApprovalLogout}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error screen if profile failed to load
  if (!isLoading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pb-20 lg:pb-0">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-2h2m-2 0h-2M7 4.5H5.25A2.25 2.25 0 003 6.75v12.5A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V6.75A2.25 2.25 0 0018.75 4.5H17" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
            <p className="text-gray-600">There was an error loading your delivery dashboard.</p>
            <p className="text-sm text-gray-500 mt-2">Please check your internet connection and try again.</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={async () => {
                try {
                  await dispatch(logoutAsync()).unwrap();
                  navigate(ROUTES.SELECT_ROLE, { replace: true });
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation Panel - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-orange-500">FreshGrocers</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{user?.fullName.split(' ')[0]}</p>
              <p className="text-sm text-orange-400">Delivery Partner</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <Link
                to={ROUTES.DELIVERY_DASHBOARD}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(ROUTES.DELIVERY_DASHBOARD)
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.DELIVERY_ORDERS}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(ROUTES.DELIVERY_ORDERS)
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="font-medium">Orders</span>
              </Link>
            </li>
            
            <li>
              <Link
                to={ROUTES.DELIVERY_STATS}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(ROUTES.DELIVERY_STATS)
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">Statistics</span>
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.DELIVERY_PROFILE}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(ROUTES.DELIVERY_PROFILE)
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Profile</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-700 hover:text-red-300 transition w-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-white shadow-sm lg:hidden">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-orange-600">Delivery Dashboard</h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </button>
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
            {user && (
              <p className="text-sm text-gray-600">Hello, {user.fullName.split(' ')[0]}!</p>
            )}
          </div>
          
          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="border-t border-gray-100 bg-white">
              <nav className="px-4 py-2 space-y-2">
                <Link
                  to={ROUTES.DELIVERY_DASHBOARD}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 16l4-4m0 0l4 4m-4-4V5" />
                  </svg>
                  <span>Dashboard</span>
                </Link>
                <Link
                  to={ROUTES.DELIVERY_ORDERS}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>Orders</span>
                </Link>
                <Link
                  to={ROUTES.DELIVERY_STATS}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Statistics</span>
                </Link>
                <Link
                  to={ROUTES.DELIVERY_PROFILE}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          )}
        </header>
        <header className="hidden lg:block bg-white shadow-sm">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Welcome back, {user?.fullName.split(' ')[0]}! 🚚
                </h1>
                <p className="text-gray-600">Check your pending deliveries and today's progress.</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
                    isOnline ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto px-4 lg:px-6 py-6 pb-20 lg:pb-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {/* Assigned Orders Card */}
              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{orders.length}</p>
                <p className="text-xs lg:text-sm text-gray-600">Assigned Orders</p>
              </div>

              {/* Completed Today Card */}
              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stats.completedToday || 0}</p>
                <p className="text-xs lg:text-sm text-gray-600">Completed Today</p>
              </div>

              {/* Today's Earnings Card */}
              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Rs. {stats.todayEarnings?.toFixed(0) || '0'}</p>
                <p className="text-xs lg:text-sm text-gray-600">Today's Earnings</p>
              </div>

              {/* Average Rating Card */}
              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 flex items-center">
                  {stats.averageRating?.toFixed(1) || '0.0'} 
                  <svg className="w-5 h-5 lg:w-7 lg:h-7 text-yellow-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </p>
                <p className="text-xs lg:text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          )}

          {/* Assigned Orders Section */}
          <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">Assigned Orders</h2>
              <Link to={ROUTES.DELIVERY_ORDERS} className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1">
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 lg:py-12">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No assigned orders at the moment</p>
                <p className="text-sm text-gray-400 mt-1">New orders will appear here when assigned</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order._id} className="border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Order #{order.orderNumber}</h4>
                        <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                      </div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                      <span className="text-lg lg:text-xl font-bold text-gray-900">${order.totalAmount.toFixed(2)}</span>
                      <button
                        onClick={() => navigate(`/delivery/orders/${order._id}`)}
                        className="px-4 lg:px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition text-sm lg:text-base"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeliveryDashboardPage;