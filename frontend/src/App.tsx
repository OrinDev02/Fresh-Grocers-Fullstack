import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { ROUTES, USER_ROLES } from './utils/constants';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import FlashScreen from './pages/auth/FlashScreen';
import SelectRolePage from './pages/auth/SelectRolePage';
import CustomerLoginPage from './pages/auth/CustomerLoginPage';
import DeliveryLoginPage from './pages/auth/DeliveryLoginPage';
import CSRLoginPage from './pages/auth/CSRLoginPage';
import RegisterCustomerPage from './pages/auth/RegisterCustomerPage';
import RegisterDeliveryPage from './pages/auth/RegisterDeliveryPage';

// Customer Pages
import CustomerHomePage from './pages/customer/CustomerHomePage';
import CustomerProductsPage from './pages/customer/CustomerProductsPage';
import CustomerCartPage from './pages/customer/CustomerCartPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';

// Delivery Pages
import DeliveryDashboardPage from './pages/delivery/DeliveryDashboardPage';
import DeliveryOrdersPage from './pages/delivery/DeliveryOrdersPage';
import DeliveryStatsPage from './pages/delivery/DeliveryStatsPage';
import DeliveryProfilePage from './pages/delivery/DeliveryProfilePage';

// CSR Pages
import CSRDashboardPage from './pages/csr/CSRDashboardPage';
import CSROrdersPage from './pages/csr/CSROrdersPage';
import CSRApprovalsPage from './pages/csr/CSRApprovalsPage';
import CSRProductsPage from './pages/csr/CSRProductsPage';
import CSRCategoriesPage from './pages/csr/CSRCategoriesPage';
import CSRUsersPage from './pages/csr/CSRUsersPage';

function App() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Auth Routes - Public */}
        <Route path={ROUTES.FLASH} element={<FlashScreen />} />
        <Route path={ROUTES.SELECT_ROLE} element={<SelectRolePage />} />
        <Route path={ROUTES.LOGIN_CUSTOMER} element={<CustomerLoginPage />} />
        <Route path={ROUTES.LOGIN_DELIVERY} element={<DeliveryLoginPage />} />
        <Route path={ROUTES.LOGIN_CSR} element={<CSRLoginPage />} />
        <Route path={ROUTES.LOGIN} element={<Navigate to={ROUTES.SELECT_ROLE} replace />} />
        <Route path={ROUTES.REGISTER_CUSTOMER} element={<RegisterCustomerPage />} />
        <Route path={ROUTES.REGISTER_DELIVERY} element={<RegisterDeliveryPage />} />

        {/* Customer Routes */}
        <Route
          path={ROUTES.CUSTOMER_HOME}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <CustomerHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMER_PRODUCTS}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <CustomerProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMER_CART}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <CustomerCartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMER_ORDERS}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <CustomerOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMER_PROFILE}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <CustomerProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Delivery Routes */}
        <Route
          path={ROUTES.DELIVERY_DASHBOARD}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.DELIVERY_PERSON]}>
              <DeliveryDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DELIVERY_ORDERS}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.DELIVERY_PERSON]}>
              <DeliveryOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DELIVERY_STATS}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.DELIVERY_PERSON]}>
              <DeliveryStatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DELIVERY_PROFILE}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.DELIVERY_PERSON]}>
              <DeliveryProfilePage />
            </ProtectedRoute>
          }
        />

        {/* CSR Routes */}
        <Route
          path={ROUTES.CSR_DASHBOARD}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CSR]}>
              <CSRDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CSR_ORDERS}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CSR]}>
              <CSROrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CSR_APPROVALS}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CSR]}>
              <CSRApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CSR_PRODUCTS}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CSR]}>
              <CSRProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CSR_CATEGORIES}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CSR]}>
              <CSRCategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CSR_USERS}
          element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CSR]}>
              <CSRUsersPage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect based on auth status */}
        <Route
          path="/"
          element={
            isAuthenticated && user ? (
              user.role === USER_ROLES.CUSTOMER ? (
                <Navigate to={ROUTES.CUSTOMER_HOME} replace />
              ) : user.role === USER_ROLES.DELIVERY_PERSON ? (
                <Navigate to={ROUTES.DELIVERY_DASHBOARD} replace />
              ) : (
                <Navigate to={ROUTES.CSR_DASHBOARD} replace />
              )
            ) : (
              <Navigate to={ROUTES.FLASH} replace />
            )
          }
        />

        {/* Catch all - redirect to flash */}
        <Route path="*" element={<Navigate to={ROUTES.FLASH} replace />} />
      </Routes>
    </div>
  );
}

export default App;