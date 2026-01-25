import { useEffect, useState } from 'react';
import { usersService } from '../../services/users.service';
import type { User } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const CSRUsersPage: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'customers' | 'delivery'>('customers');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [customersData, deliveryData] = await Promise.all([
          usersService.getAllCustomers(),
          usersService.getAllDeliveryPersons(),
        ]);
        setCustomers(customersData);
        setDeliveryPersons(deliveryData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm mb-6">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-secondary">User Management</h1>
            <Link to={ROUTES.CSR_DASHBOARD} className="text-gray-700 hover:text-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container-main py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'customers'
                ? 'border-b-2 border-secondary text-secondary'
                : 'text-gray-600 hover:text-secondary'
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'delivery'
                ? 'border-b-2 border-secondary text-secondary'
                : 'text-gray-600 hover:text-secondary'
            }`}
          >
            Delivery Persons ({deliveryPersons.length})
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'customers' ? (
              customers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No customers found</div>
              ) : (
                customers.map((customer) => (
                  <div key={customer.id} className="card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{customer.fullName}</h4>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        <p className="text-sm text-gray-600">{customer.phone}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                          {customer.role}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        customer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))
              )
            ) : (
              deliveryPersons.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No delivery persons found</div>
              ) : (
                deliveryPersons.map((delivery) => (
                  <div key={delivery.id} className="card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{delivery.fullName}</h4>
                        <p className="text-sm text-gray-600">{delivery.email}</p>
                        <p className="text-sm text-gray-600">{delivery.phone}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {delivery.role}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        delivery.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {delivery.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CSRUsersPage;