import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutAsync } from '../../store/features/auth/authSlice';
import { usersService } from '../../services/users.service';
import BottomNavigation from '../../components/customer/BottomNavigation';
import Button from '../../components/common/Button';
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-white shadow-sm lg:hidden">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-secondary">Profile</h1>
        </div>
      </header>

      <div className="container-main py-6">
        {profile ? (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Account Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="text-lg font-semibold">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-lg font-semibold">{profile.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="text-lg font-semibold">{profile.role}</p>
                </div>
              </div>
            </div>

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
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading profile...</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CustomerProfilePage;