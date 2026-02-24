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
         <div className="hidden lg:block w-full max-w-5xl relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="lg:flex">
            {/* Left Panel - Branding */}
            <div className="lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 p-12 flex flex-col items-center justify-center text-white relative overflow-hidden min-h-[600px]">
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-10 left-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                <div className="absolute top-20 right-10 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                <div className="absolute bottom-10 left-1/4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
                <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-white opacity-10 rounded-full"></div>
              </div>

              {/* Logo Circle */}
              <div className="mb-8 relative z-10">
                <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-xl">
                  <div className="text-center">
                    <svg className="w-20 h-20 text-orange-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className="text-orange-600 font-bold text-lg">FreshGrocer</div>
                  </div>
                </div>
              </div>

              {/* Branding Text */}
              <div className="text-center relative z-10">
                <h2 className="text-3xl font-bold mb-4">Your Delivery journey starts here</h2>
                <p className="text-blue-100 text-lg">Secure access to your earnings records and delivery services</p>
              </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="lg:w-1/2 p-12 flex items-center">
              <div className="w-full max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-500 mb-8">Please sign in to continue</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input with Icon */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>

                  {/* Password Input with Icons */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex justify-end">
                    <Link to="#" className="text-sm text-orange-500 hover:text-blue-600 font-medium">
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Sign In Button */}
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-full bg-slate-800 hover:bg-slate-900 py-3 rounded-lg shadow-lg hover:shadow-xl transition duration-200" 
                    isLoading={isLoading}
                  >
                    Sign In
                  </Button>

                  <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to={ROUTES.REGISTER_DELIVERY} className="text-orange-500 hover:underline font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLoginPage;
