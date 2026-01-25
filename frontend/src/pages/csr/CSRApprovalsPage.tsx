import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { deliveryService } from '../../services/delivery.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { toast } from 'react-toastify';

const CSRApprovalsPage: React.FC = () => {
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const data = await adminService.getPendingApprovals();
        setPendingApprovals(data);
      } catch (error) {
        console.error('Failed to fetch approvals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApprovals();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await deliveryService.approveDeliveryPerson(userId);
      toast.success('Delivery person approved successfully');
      // Refresh the list
      const data = await adminService.getPendingApprovals();
      setPendingApprovals(data);
    } catch (error: any) {
      toast.error(error || 'Failed to approve');
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this application?')) return;
    try {
      await deliveryService.rejectDeliveryPerson(userId);
      toast.success('Delivery person rejected');
      // Refresh the list
      const data = await adminService.getPendingApprovals();
      setPendingApprovals(data);
    } catch (error: any) {
      toast.error(error || 'Failed to reject');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm mb-6">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-secondary">Pending Approvals</h1>
            <Link to={ROUTES.CSR_DASHBOARD} className="text-gray-700 hover:text-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container-main py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : pendingApprovals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((approval: any) => (
              <div key={approval._id || approval.userId} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{approval.fullName || approval.name}</h4>
                    <p className="text-sm text-gray-600">{approval.email}</p>
                    <p className="text-sm text-gray-600">{approval.phone}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    PENDING
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-semibold">{approval.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">District</p>
                    <p className="font-semibold">{approval.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Province</p>
                    <p className="font-semibold">{approval.province}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Type</p>
                    <p className="font-semibold">{approval.vehicleType}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => handleApprove(approval.userId || approval._id)}
                    className="flex-1"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleReject(approval.userId || approval._id)}
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CSRApprovalsPage;