import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const SelectRolePage: React.FC = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Shop groceries and get them delivered fast',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: 'bg-green-100 text-green-600',
      buttonColor: 'bg-secondary hover:bg-secondary-dark',
      route: ROUTES.LOGIN_CUSTOMER,
    },
    {
      id: 'delivery',
      title: 'Delivery Partner',
      description: 'Earn money by delivering orders',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-orange-100 text-orange-600',
      buttonColor: 'bg-orange-500 hover:bg-orange-600',
      route: ROUTES.LOGIN_DELIVERY,
    },
    {
      id: 'csr',
      title: 'CSR Agent',
      description: 'Manage orders and support customers',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      color: 'bg-blue-100 text-blue-600',
      buttonColor: 'bg-blue-500 hover:bg-blue-600',
      route: ROUTES.LOGIN_CSR,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-3xl mb-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to FreshCart</h1>
          <p className="text-gray-600">Select how you'd like to continue</p>
        </div>

        {/* Role Cards */}
        <div className="space-y-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => navigate(role.route)}
              className="w-full bg-gray-50 hover:bg-gray-100 rounded-xl p-4 flex items-center justify-between transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className={`${role.color} rounded-2xl p-3`}>
                  {role.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-gray-900">{role.title}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              </div>
              <div className={`${role.buttonColor} text-white rounded-full p-2 group-hover:scale-110 transition-transform`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectRolePage;
