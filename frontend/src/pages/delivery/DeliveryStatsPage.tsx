import { useEffect, useState } from 'react';
import { deliveryService } from '../../services/delivery.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const DeliveryStatsPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await deliveryService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 lg:pb-0">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.DELIVERY_DASHBOARD)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Back to Dashboard"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-secondary">Statistics</h1>
        </div>
      </header>

      <div className="container-main py-6">
        <h2 className="text-2xl font-bold mb-6">Your Performance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-2">Total Deliveries</p>
            <p className="text-4xl font-bold text-secondary mb-4">{stats?.totalDeliveries || 0}</p>
          </div>
          
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-2">Average Rating</p>
            <p className="text-4xl font-bold text-secondary mb-4">
              {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
            </p>
            <p className="text-sm text-gray-500">({stats?.totalRatings || 0} ratings)</p>
          </div>
          
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-2">Total Earnings</p>
            <p className="text-4xl font-bold text-secondary mb-4">
              ${stats?.totalEarnings?.toFixed(2) || '0.00'}
            </p>
          </div>
          
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-2">Delivery Profile</p>
            {stats && (
              <div className="mt-4 space-y-2 text-left">
                <p className="text-sm"><span className="font-semibold">City:</span> {stats.city || 'N/A'}</p>
                <p className="text-sm"><span className="font-semibold">District:</span> {stats.district || 'N/A'}</p>
                <p className="text-sm"><span className="font-semibold">Vehicle:</span> {stats.vehicleType || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryStatsPage;