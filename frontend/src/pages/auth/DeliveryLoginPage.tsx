import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginAsync } from '../../store/features/auth/authSlice';
import { ROUTES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { toast } from 'react-toastify';

const DeliveryLoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || null;

  useEffect(() => {
    if (isAuthenticated && user) {
      const targetRoute = from || ROUTES.DELIVERY_DASHBOARD;
      navigate(targetRoute, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await dispatch(loginAsync(formData)).unwrap();
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:flex lg:items-center lg:justify-center">
      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen flex flex-col">
        <div className="px-4 py-4">
          <button
            onClick={() => navigate(ROUTES.SELECT_ROLE)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          <div className="mb-8">
            <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h1>
            <p className="text-gray-600 text-center mb-8">Login to your delivery account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                required
              />

              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                  required
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-orange-500 hover:underline"
                  >
                    {showPassword ? 'Hide' : 'Show'} Password
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="#" className="text-sm text-orange-500 hover:underline">Forgot Password?</Link>
              </div>

              <Button type="submit" variant="primary" className="w-full bg-orange-500 hover:bg-orange-600" isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to={ROUTES.REGISTER_DELIVERY} className="text-orange-500 hover:underline font-medium">
                  Register Now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="w-1/2 bg-orange-500 relative overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
            <div className="relative z-10 mb-8">
              <div className="w-32 h-32 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold mb-4">Delivery Partner</h2>
              <p className="text-xl text-white/90">Earn money by delivering orders</p>
            </div>
          </div>
        </div>

        <div className="w-1/2 p-12 flex flex-col justify-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600 mb-8">Please sign in to continue</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                required
              />

              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                  required
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-orange-500 hover:underline"
                  >
                    {showPassword ? 'Hide' : 'Show'} Password
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="#" className="text-sm text-orange-500 hover:underline">Forgot Password?</Link>
              </div>

              <Button type="submit" variant="primary" className="w-full bg-orange-500 hover:bg-orange-600" isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to={ROUTES.REGISTER_DELIVERY} className="text-orange-500 hover:underline font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLoginPage;
