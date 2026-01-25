import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginAsync } from '../../store/features/auth/authSlice';
import { ROUTES, USER_ROLES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { toast } from 'react-toastify';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || null;

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      const targetRoute = from || 
        (user.role === USER_ROLES.CUSTOMER ? ROUTES.CUSTOMER_HOME :
         user.role === USER_ROLES.DELIVERY_PERSON ? ROUTES.DELIVERY_DASHBOARD :
         ROUTES.CSR_DASHBOARD);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-light to-primary-light px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2">Fresh Grocers</h1>
          <p className="text-gray-600">Welcome back! Please login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            required
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Login
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/auth/forgot-password" className="text-sm text-secondary hover:underline">
            Forgot Password?
          </Link>
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3">Don't have an account?</p>
            <div className="flex gap-4 justify-center">
              <Link to={ROUTES.REGISTER_CUSTOMER} className="text-sm text-secondary hover:underline font-medium">
                Register as Customer
              </Link>
              <span className="text-gray-400">|</span>
              <Link to={ROUTES.REGISTER_DELIVERY} className="text-sm text-secondary hover:underline font-medium">
                Register as Delivery
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;