import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutAsync } from '../../store/features/auth/authSlice';
import { deliveryService } from '../../services/delivery.service';
import type { DeliveryProfile } from '../../types';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { toast } from 'react-toastify';

const DeliveryProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [profile, setProfile] = useState<DeliveryProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await deliveryService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      navigate(ROUTES.LOGIN, { replace: true });
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 lg:pb-0">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-white shadow-sm lg:hidden">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-secondary">Profile</h1>
        </div>
      </header>

      <div className="container-main py-6">
        <div className="space-y-6">
          {/* User Info */}
          {user && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Account Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="text-lg font-semibold">{user.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-lg font-semibold">{user.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Profile */}
          {profile && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">City</p>
                  <p className="text-lg font-semibold">{profile.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">District</p>
                  <p className="text-lg font-semibold">{profile.district}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Province</p>
                  <p className="text-lg font-semibold">{profile.province}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle Type</p>
                  <p className="text-lg font-semibold">{profile.vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`text-lg font-semibold ${
                    profile.status === 'APPROVED' ? 'text-green-600' :
                    profile.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {profile.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-lg font-semibold">{profile.averageRating.toFixed(1)} / 5.0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Deliveries</p>
                  <p className="text-lg font-semibold">{profile.totalDeliveries}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-lg font-semibold">${profile.totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Account Actions</h2>
            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
              <Button variant="danger" className="w-full" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProfilePage;