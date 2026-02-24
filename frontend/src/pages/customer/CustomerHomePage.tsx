import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProductsAsync } from '../../store/features/products/productsSlice';
import { fetchCartAsync, addToCartAsync } from '../../store/features/cart/cartSlice';
import BottomNavigation from '../../components/customer/BottomNavigation';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { toast } from 'react-toastify';
import { categoriesService } from '../../services/categories.service';
import type { Category } from '../../types';

const CustomerHomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  

  // Get cart item count
  

  useEffect(() => {
    dispatch(fetchProductsAsync({ page: 1, limit: 20 }));
    dispatch(fetchCartAsync());
    
    // Fetch categories from database
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const fetchedCategories = await categoriesService.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    loadCategories();
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

  // Map category to image URLs (you can replace these with actual image URLs from your backend)
  const getCategoryImage = (name: string): string => {
    const imageMap: { [key: string]: string } = {
      'vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
      'fruits': 'https://static.vecteezy.com/system/resources/thumbnails/066/635/229/small/a-colorful-assortment-of-fresh-fruits-including-apples-oranges-bananas-and-grapes-photo.jpg',
      'beverages': 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&h=400&fit=crop',
      'snacks': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop',
      'dairy': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
      'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
    };
    return imageMap[name.toLowerCase()] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop';
  };

  // Map category gradient colors
  const getCategoryGradient = (name: string): string => {
    const gradientMap: { [key: string]: string } = {
      'vegetables': 'from-green-500/80 to-emerald-600/80',
      'fruits': 'from-red-500/80 to-pink-600/80',
      'beverages': 'from-blue-500/80 to-cyan-600/80',
      'snacks': 'from-yellow-500/80 to-orange-600/80',
      'dairy': 'from-purple-500/80 to-violet-600/80',
      'bakery': 'from-orange-500/80 to-amber-600/80',
    };
    return gradientMap[name.toLowerCase()] || 'from-gray-500/80 to-slate-600/80';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white pb-20 lg:pb-0">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-green-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to={ROUTES.CUSTOMER_HOME} className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Fresh Grocers</h1>
                <p className="text-xs text-gray-500 -mt-1">Organic Market</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link to={ROUTES.CUSTOMER_HOME} className="flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              <Link to={ROUTES.CUSTOMER_PRODUCTS} className="flex items-center gap-2 text-gray-600 font-medium hover:text-green-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Products
              </Link>
              <Link to={ROUTES.CUSTOMER_ORDERS} className="flex items-center gap-2 text-gray-600 font-medium hover:text-green-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Orders
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Cart */}
              <Link to={ROUTES.CUSTOMER_CART} className="relative group">
                <div className="p-2 lg:p-2.5 bg-green-50 hover:bg-green-100 rounded-xl transition-all group-hover:shadow-md">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  
                  
                </div>
              </Link>

              {/* Profile */}
              <Link to={ROUTES.CUSTOMER_PROFILE} className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{user?.fullName.split(' ')[0] || 'Account'}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="container mx-auto px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for products, brands or categories..."
              className="w-full pl-12 pr-4 py-3 lg:py-4 rounded-2xl border-2 border-green-100 focus:border-green-400 focus:ring-4 focus:ring-green-50 outline-none transition-all text-sm lg:text-base"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Categories Section - Modern Image-Based Design */}
      <div className="container mx-auto px-4 lg:px-8 mb-8 lg:mb-12">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Shop by Category</h2>
            <p className="text-sm text-gray-500 mt-1">Explore our fresh collections</p>
          </div>
          <button className="text-green-600 font-semibold text-sm lg:text-base hover:text-green-700 transition-colors flex items-center gap-1">
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {categoriesLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <p className="text-gray-500">No categories available at the moment.</p>
            </div>
          ) : (
            categories.map((category) => (
              <button
                key={category._id}
                className="group relative overflow-hidden rounded-2xl aspect-square transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {/* Category Image */}
                <div className="absolute inset-0">
                  <img 
                    src={getCategoryImage(category.name)} 
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  
                </div>
                
                {/* Category Name */}
                <div className="absolute inset-0 flex items-end justify-center p-3 lg:p-4">
                  <div className="text-center transform transition-transform group-hover:-translate-y-1">
                    <h3 className="text-white font-bold text-sm lg:text-base drop-shadow-lg">
                      {category.name}
                    </h3>
                    <div className="mt-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="inline-block text-white text-xs bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                        Explore →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decorative Corner Badge */}
                <div className="absolute top-2 right-2 lg:top-3 lg:right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 lg:p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg transform group-hover:rotate-12">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                
              </button>
            ))
          )}
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="container mx-auto px-4 lg:px-8 mb-8 lg:mb-12">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Top Saver Today</h2>
            <p className="text-sm text-gray-500 mt-1">Don't miss out on today's best deals</p>
          </div>
          <Link to={ROUTES.CUSTOMER_PRODUCTS} className="text-green-600 font-semibold text-sm lg:text-base hover:text-green-700 transition-colors">
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No products available at the moment.
              </div>
            ) : (
              products.slice(0, 5).map((product) => (
                <div key={product._id} className="group bg-white rounded-2xl p-3 lg:p-4 hover:shadow-2xl transition-all border-2 border-transparent hover:border-green-100 relative overflow-hidden">
                  {/* Discount Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                      30% OFF
                    </span>
                  </div>

                  <Link to={`/products/${product._id}`}>
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-green-50 rounded-xl mb-3 overflow-hidden relative group-hover:scale-105 transition-transform">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-12 h-12 lg:w-16 lg:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm lg:text-base">{product.name}</h4>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex text-yellow-400 text-xs">
                        {'★'.repeat(5)}
                      </div>
                      <span className="text-xs text-gray-500">(4.5)</span>
                    </div>
                  </Link>

                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-green-600 font-bold text-lg lg:text-xl">Rs.{product.price.toFixed(2)}</span>
                      <span className="text-gray-400 text-xs line-through ml-2">Rs.{(product.price * 1.3).toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={(e) => handleAddToCart(e, product._id)} 
                      className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-2 lg:p-2.5 rounded-xl transition-all shadow-md hover:shadow-lg group-hover:scale-110"
                    >
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* All Products Section */}
      <div className="container mx-auto px-4 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">All Products</h2>
            <p className="text-sm text-gray-500 mt-1">Fresh arrivals and customer favorites</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No products available at the moment.
              </div>
            ) : (
              products.map((product) => (
                <div key={product._id} className="group bg-white rounded-2xl p-3 lg:p-4 hover:shadow-2xl transition-all border-2 border-transparent hover:border-green-100 relative overflow-hidden">
                  <Link to={`/products/${product._id}`}>
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-green-50 rounded-xl mb-3 overflow-hidden relative group-hover:scale-105 transition-transform">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-12 h-12 lg:w-16 lg:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm lg:text-base">{product.name}</h4>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex text-yellow-400 text-xs">
                        {'★'.repeat(5)}
                      </div>
                      <span className="text-xs text-gray-500">(4.5)</span>
                    </div>
                  </Link>

                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-green-600 font-bold text-lg lg:text-xl">${product.price.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={(e) => handleAddToCart(e, product._id)} 
                      className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-2 lg:p-2.5 rounded-xl transition-all shadow-md hover:shadow-lg group-hover:scale-110"
                    >
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 mt-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">Fresh Grocers</h3>
                  <p className="text-xs text-gray-400">Organic Market</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 text-sm">
                Your trusted source for fresh, high-quality groceries delivered right to your doorstep.
              </p>
              <div className="flex gap-3">
                <a href="#" className="bg-gray-800 hover:bg-green-600 p-2.5 rounded-xl transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="bg-gray-800 hover:bg-green-600 p-2.5 rounded-xl transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="bg-gray-800 hover:bg-green-600 p-2.5 rounded-xl transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Quick Links</h4>
              <ul className="space-y-2.5">
                <li><Link to={ROUTES.CUSTOMER_PRODUCTS} className="text-gray-400 hover:text-green-400 transition-colors text-sm">All Products</Link></li>
                <li><Link to={ROUTES.CUSTOMER_CART} className="text-gray-400 hover:text-green-400 transition-colors text-sm">Shopping Cart</Link></li>
                <li><Link to={ROUTES.CUSTOMER_ORDERS} className="text-gray-400 hover:text-green-400 transition-colors text-sm">My Orders</Link></li>
                <li><Link to={ROUTES.CUSTOMER_PROFILE} className="text-gray-400 hover:text-green-400 transition-colors text-sm">My Account</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Customer Service</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Track Order</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Returns</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Contact Us</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Contact Us</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>123 Grocery Street, Food City, FC 12345</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>support@freshgrocers.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+1 (555) 123-4567</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2024 Fresh Grocers. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />
    </div>
  );
};

export default CustomerHomePage;