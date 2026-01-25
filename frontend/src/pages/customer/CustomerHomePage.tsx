import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProductsAsync } from '../../store/features/products/productsSlice';
import { fetchCartAsync } from '../../store/features/cart/cartSlice';
import BottomNavigation from '../../components/customer/BottomNavigation';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const CustomerHomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProductsAsync({ page: 1, limit: 20 }));
    dispatch(fetchCartAsync());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm lg:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-secondary">Fresh Grocers</h1>
            <Link to={ROUTES.CUSTOMER_CART} className="relative">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>
          </div>
          {user && (
            <p className="text-sm text-gray-600">Hello, {user.fullName.split(' ')[0]}!</p>
          )}
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white shadow-sm mb-6">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            <Link to={ROUTES.CUSTOMER_HOME} className="text-2xl font-bold text-secondary">
              Fresh Grocers
            </Link>
            <div className="flex items-center gap-6">
              <Link to={ROUTES.CUSTOMER_PRODUCTS} className="text-gray-700 hover:text-secondary">
                Products
              </Link>
              <Link to={ROUTES.CUSTOMER_CART} className="text-gray-700 hover:text-secondary">
                Cart
              </Link>
              <Link to={ROUTES.CUSTOMER_ORDERS} className="text-gray-700 hover:text-secondary">
                Orders
              </Link>
              <Link to={ROUTES.CUSTOMER_PROFILE} className="text-gray-700 hover:text-secondary">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-gradient-to-r from-secondary to-primary text-white p-6 mb-6">
        <div className="container-main">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2">Fresh Groceries Delivered to Your Door</h2>
          <p className="text-lg opacity-90">Get everything you need, delivered fast!</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-main pb-6">
        <h3 className="text-xl font-semibold mb-4">Popular Products</h3>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No products available at the moment.
              </div>
            ) : (
              products.map((product) => (
                <div key={product._id} className="card hover:shadow-lg transition-shadow">
                  <Link to={`/products/${product._id}`}>
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h4>
                    <p className="text-secondary font-bold text-lg">${product.price.toFixed(2)}</p>
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />
    </div>
  );
};

export default CustomerHomePage;