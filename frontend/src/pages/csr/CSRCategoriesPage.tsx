import { useEffect, useState } from 'react';
import { categoriesService } from '../../services/categories.service';
import type { Category } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { toast } from 'react-toastify';

const CSRCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoriesService.deleteCategory(id);
      toast.success('Category deleted successfully');
      const data = await categoriesService.getCategories();
      setCategories(data);
    } catch (error: any) {
      toast.error(error || 'Failed to delete category');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm mb-6">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-secondary">Category Management</h1>
            <div className="flex items-center gap-4">
              <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Cancel' : '+ Add Category'}
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
            {/* Add Category Form */}
            {showAddForm && (
              <div className="card mb-6">
                <h2 className="text-xl font-bold mb-4">Add New Category</h2>
                <p className="text-gray-500 mb-4">Category form will be implemented here</p>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No categories found. Add your first category!
                </div>
              ) : (
                categories.map((category: Category) => (
                  <div key={category._id} className="card">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      {category.imageUrl ? (
                        <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(category._id)}
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

export default CSRCategoriesPage;