import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutAsync } from '../../store/features/auth/authSlice';
import { usersService } from '../../services/users.service';
import BottomNavigation from '../../components/customer/BottomNavigation';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import type { User } from '../../types';
import { toast } from 'react-toastify';

const CustomerProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [profile, setProfile] = useState<User | null>(user);

  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await usersService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    if (!profile) {
      fetchProfile();
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      navigate(ROUTES.LOGIN, { replace: true });
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
                <p className="text-xs text-gray-500 -mt-1">My Profile</p>
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
              {/* Cart */}
              <button onClick={() => navigate(ROUTES.CUSTOMER_CART)} className="relative group">
                <div className="p-2 lg:p-2.5 bg-green-50 hover:bg-green-100 rounded-xl transition-all group-hover:shadow-md">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  
                </div>
              </button>

              {/* Profile - Active State */}
              <button onClick={() => navigate(ROUTES.CUSTOMER_PROFILE)} className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg">
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
        {profile ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header Card */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="w-28 h-28 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/30">
                  <span className="text-4xl font-bold text-white">
                    {profile.fullName ? getInitials(profile.fullName) : 'U'}
                  </span>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-3xl font-bold mb-2">{profile.fullName}</h2>
                  <p className="text-white/90 mb-1 flex items-center justify-center sm:justify-start gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {profile.email}
                  </p>
                  <p className="text-white/90 flex items-center justify-center sm:justify-start gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {profile.phone}
                  </p>
                </div>

                {/* Role Badge */}
                <div className="sm:self-start">
                  <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl font-semibold text-sm border-2 border-white/30">
                    {profile.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Information Card */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 border-2 border-green-100 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Account Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl p-5 border-2 border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-600">Full Name</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 ml-13">{profile.fullName}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl p-5 border-2 border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-600">Email Address</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 ml-13 break-all">{profile.email}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl p-5 border-2 border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-600">Phone Number</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 ml-13">{profile.phone}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl p-5 border-2 border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-600">Account Role</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 ml-13 capitalize">{profile.role}</p>
                </div>
              </div>
            </div>

            {/* Account Actions Card */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 border-2 border-green-100 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Account Actions</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="bg-gradient-to-br from-green-50 to-yellow-50 hover:from-green-100 hover:to-yellow-100 border-2 border-green-200 hover:border-green-400 text-gray-800 py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 group">
                  <svg className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
                >
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div>
            </div>
            <p className="text-gray-600 font-semibold">Loading profile...</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CustomerProfilePage;