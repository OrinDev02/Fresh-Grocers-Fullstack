import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { registerDeliveryAsync } from '../../store/features/auth/authSlice';
import { ROUTES } from '../../utils/constants';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const RegisterDeliveryPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    district: '',
    province: '',
    latitude: 0,
    longitude: 0,
    vehicleType: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          toast.success('Location captured!');
        },
        () => {
          toast.error('Failed to get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.vehicleType.trim()) newErrors.vehicleType = 'Vehicle type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.province.trim()) newErrors.province = 'Province is required';
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Location is required. Click "Get My Location"';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    try {
      const { confirmPassword, ...registerData } = formData;
      await dispatch(registerDeliveryAsync(registerData)).unwrap();
      toast.success('Registration successful! Your application is pending approval.');
      navigate(ROUTES.DELIVERY_DASHBOARD, { replace: true });
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 lg:flex lg:items-center lg:justify-center lg:p-4 lg:relative lg:overflow-hidden">
      {/* Decorative Background Circles - Desktop Only */}
      <div className="hidden lg:block absolute top-10 left-10 w-64 h-64 bg-blue-100 rounded-full opacity-40 blur-3xl"></div>
      <div className="hidden lg:block absolute bottom-10 right-10 w-96 h-96 bg-blue-200 rounded-full opacity-30 blur-3xl"></div>
      <div className="hidden lg:block absolute top-1/2 left-1/4 w-48 h-48 bg-blue-50 rounded-full opacity-50 blur-2xl"></div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-4 py-4">
          <button
            onClick={() => step === 1 ? navigate(ROUTES.LOGIN_DELIVERY) : handleBack()}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          {/* Logo */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Delivery Partner</h1>
            <p className="text-gray-600 text-center mb-6">Join our delivery team</p>

            {/* Progress Indicator */}
            <div className="flex justify-center gap-2 mb-8">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-secondary' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-secondary' : 'bg-gray-300'}`}></div>
            </div>

            {step === 1 ? (
              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      placeholder="e.g., Motorcycle, Bicycle, Car"
                    />
                  </div>
                  {errors.vehicleType && <p className="mt-1 text-sm text-red-600">{errors.vehicleType}</p>}
                </div>

                <Button type="submit" variant="primary" className="w-full mt-6">
                  Continue
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                      placeholder="City"
                    />
                    {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                      placeholder="District"
                    />
                    {errors.district && <p className="mt-1 text-xs text-red-600">{errors.district}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                      placeholder="Province"
                    />
                    {errors.province && <p className="mt-1 text-xs text-red-600">{errors.province}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={formData.latitude || ''}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={formData.longitude || ''}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleLocation}
                    className="mt-2 w-full px-4 py-2 text-sm border border-secondary text-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors"
                  >
                    Get My Location
                  </button>
                  {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      placeholder="Create a password"
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      placeholder="Confirm your password"
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" variant="primary" className="w-full mt-6">
                  Register
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to={ROUTES.LOGIN_DELIVERY} className="text-secondary hover:underline font-medium">
                  Login
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
                <h2 className="text-3xl font-bold mb-4">Become a Delivery Partner</h2>
                <p className="text-blue-100 text-lg">Earn money delivering groceries in your area</p>
              </div>
            </div>

            {/* Right Panel - Registration Form */}
            <div className="lg:w-1/2 p-12 flex items-center">
              <div className="w-full max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Registration</h1>
                <p className="text-gray-500 mb-6">Join our delivery team</p>

                {/* Progress Indicator */}
                <div className="flex gap-2 mb-8">
                  <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                  <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                </div>

                {step === 1 ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-5">
                    {/* Full Name Input with Icon */}
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                      {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
                    </div>

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

                    {/* Phone Input with Icon */}
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                      {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                    </div>

                    {/* Vehicle Type Input with Icon */}
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Vehicle Type (e.g., Motorcycle, Car)"
                          value={formData.vehicleType}
                          onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                      {errors.vehicleType && <p className="mt-1 text-sm text-red-500">{errors.vehicleType}</p>}
                    </div>

                    {/* Continue Button */}
                    <button
                      type="submit"
                      className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-200 mt-6"
                    >
                      Continue
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Location Fields */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="City"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                        />
                        {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="District"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                        />
                        {errors.district && <p className="mt-1 text-xs text-red-500">{errors.district}</p>}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Province"
                          value={formData.province}
                          onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                        />
                        {errors.province && <p className="mt-1 text-xs text-red-500">{errors.province}</p>}
                      </div>
                    </div>

                    {/* Lat/Long with Get Location Button */}
                    <div>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="number"
                          step="any"
                          placeholder="Latitude"
                          value={formData.latitude || ''}
                          onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                          className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                        />
                        <input
                          type="number"
                          step="any"
                          placeholder="Longitude"
                          value={formData.longitude || ''}
                          onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                          className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleLocation}
                        className="w-full py-2 text-sm border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition"
                      >
                        Get My Location
                      </button>
                      {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
                    </div>

                    {/* Password Input with Icon */}
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
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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

                    {/* Confirm Password Input with Icon */}
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm Password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>

                    {/* Back and Register Buttons */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-200"
                      >
                        Register
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to={ROUTES.LOGIN_DELIVERY} className="text-orange-500 hover:text-orange-600 font-medium">
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterDeliveryPage;