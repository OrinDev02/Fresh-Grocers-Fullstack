import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProductsAsync } from '../../store/features/products/productsSlice';
import { addToCartAsync } from '../../store/features/cart/cartSlice';
import BottomNavigation from '../../components/customer/BottomNavigation';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { toast } from 'react-toastify';

const CustomerProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.products);


  useEffect(() => {
    dispatch(fetchProductsAsync({ page: 1, limit: 50 }));
  }, [dispatch]);

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>, productId: string) => {
    e.preventDefault();
    try {
      await dispatch(addToCartAsync({ productId, quantity: 1 })).unwrap();
      toast.success('Item added to cart!');
    } catch (error: any) {
      toast.error(error || 'Failed to add item to cart');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white pb-20 lg:pb-0">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-green-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button onClick={() => navigate(ROUTES.CUSTOMER_HOME)} className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Fresh Grocers</h1>
                <p className="text-xs text-gray-500 -mt-1">All Products</p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <button onClick={() => navigate(ROUTES.CUSTOMER_HOME)} className="flex items-center gap-2 text-gray-600 font-medium hover:text-green-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </button>
              <button onClick={() => navigate(ROUTES.CUSTOMER_PRODUCTS)} className="flex items-center gap-2 text-green-600 font-semibold transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Products
              </button>

              <button onClick={() => navigate(ROUTES.CUSTOMER_ORDERS)} className="flex items-center gap-2 text-gray-600 font-medium hover:text-green-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Orders
              </button>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Search Icon */}
              <button className="p-2 lg:p-2.5 hover:bg-green-50 rounded-xl transition-all">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Cart */}
              <button onClick={() => navigate(ROUTES.CUSTOMER_CART)} className="relative group">
                <div className="p-2 lg:p-2.5 bg-green-50 hover:bg-green-100 rounded-xl transition-all group-hover:shadow-md">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                 
                </div>
              </button>

              {/* Profile */}
              <button onClick={() => navigate(ROUTES.CUSTOMER_PROFILE)} className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Account</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">All Products</h2>
            <p className="text-gray-600">Discover our fresh and organic collection</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-green-200 hover:border-green-400 rounded-xl transition-all">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-semibold text-gray-700 hidden sm:inline">Filter</span>
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Products Available</h3>
                <p className="text-gray-500">Check back soon for new arrivals!</p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product._id} className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all border-2 border-green-100 hover:border-green-300 relative">
                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg">
                      30% OFF
                    </span>
                  </div>

                  {/* Quick View Badge */}
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg hover:bg-white transition-all">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>

                  <Link to={`/products/${product._id}`}>
                    {/* Product Image */}
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-green-50 overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-16 h-16 lg:w-20 lg:h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm lg:text-base group-hover:text-green-600 transition-colors">
                        {product.name}
                      </h4>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-yellow-400 text-sm">
                          {'★'.repeat(5)}
                        </div>
                        <span className="text-xs text-gray-500">(4.5)</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl lg:text-2xl font-bold text-green-600">
                          Rs.{product.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          Rs.{(product.price * 1.3).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Add to Cart Button */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={(e) => handleAddToCart(e, product._id)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group-hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CustomerProductsPage;