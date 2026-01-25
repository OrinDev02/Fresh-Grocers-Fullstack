import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCartAsync, updateCartItemAsync, removeFromCartAsync } from '../../store/features/cart/cartSlice';
import BottomNavigation from '../../components/customer/BottomNavigation';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { ROUTES } from '../../utils/constants';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const CustomerCartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cart, isLoading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCartAsync());
  }, [dispatch]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await dispatch(updateCartItemAsync({ itemId, quantity: newQuantity })).unwrap();
    } catch (error: any) {
      toast.error('Failed to update cart item');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await dispatch(removeFromCartAsync(itemId)).unwrap();
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error('Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 lg:pb-0">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-white shadow-sm lg:hidden">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-secondary">Shopping Cart</h1>
        </div>
      </header>

      <div className="container-main py-6">
        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link to={ROUTES.CUSTOMER_PRODUCTS}>
              <Button variant="primary">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cart.items.map((item) => {
                const itemId = item._id || item.productId; // Fallback to productId if _id not available
                if (!itemId) return null; // Skip if no identifier
                return (
                  <div key={itemId} className="card flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Product ID: {item.productId}</h4>
                      <p className="text-gray-600">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(itemId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(itemId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemove(itemId)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-secondary">${cart.totalAmount.toFixed(2)}</span>
              </div>
              <Link to={ROUTES.CUSTOMER_HOME}>
                <Button variant="primary" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CustomerCartPage;