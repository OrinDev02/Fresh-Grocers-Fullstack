import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProductsAsync } from '../../store/features/products/productsSlice';
import { productsService } from '../../services/products.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import type { Product } from '../../types';
import { toast } from 'react-toastify';

const CSRProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.products);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    dispatch(fetchProductsAsync({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsService.deleteProduct(id);
      toast.success('Product deleted successfully');
      dispatch(fetchProductsAsync({ page: 1, limit: 100 }));
    } catch (error: any) {
      toast.error(error || 'Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm mb-6">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-secondary">Product Management</h1>
            <div className="flex items-center gap-4">
              <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Cancel' : '+ Add Product'}
              </Button>
              <Link to={ROUTES.CSR_DASHBOARD} className="text-gray-700 hover:text-secondary">
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container-main py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Add Product Form */}
            {showAddForm && (
              <div className="card mb-6">
                <h2 className="text-xl font-bold mb-4">Add New Product</h2>
                <p className="text-gray-500 mb-4">Product form will be implemented here</p>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No products found. Add your first product!
                </div>
              ) : (
                products.map((product: Product) => (
                  <div key={product._id} className="card">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                    <p className="text-secondary font-bold mb-2">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 mb-3">Stock: {product.stock}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CSRProductsPage;