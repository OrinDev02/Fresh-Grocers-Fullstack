import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { HomeIcon, ShoppingBagIcon, ShoppingCartIcon, UserIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, ShoppingBagIcon as ShoppingBagIconSolid, ShoppingCartIcon as ShoppingCartIconSolid, UserIcon as UserIconSolid, ClipboardDocumentListIcon as ClipboardDocumentListIconSolid } from '@heroicons/react/24/solid';
import { useAppSelector } from '../../store/hooks';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { cart } = useAppSelector((state) => state.cart);
  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: ROUTES.CUSTOMER_HOME, label: 'Home', icon: HomeIcon, iconSolid: HomeIconSolid },
    { path: ROUTES.CUSTOMER_PRODUCTS, label: 'Products', icon: ShoppingBagIcon, iconSolid: ShoppingBagIconSolid },
    { path: ROUTES.CUSTOMER_CART, label: 'Cart', icon: ShoppingCartIcon, iconSolid: ShoppingCartIconSolid, badge: cartItemCount },
    { path: ROUTES.CUSTOMER_ORDERS, label: 'Orders', icon: ClipboardDocumentListIcon, iconSolid: ClipboardDocumentListIconSolid },
    { path: ROUTES.CUSTOMER_PROFILE, label: 'Profile', icon: UserIcon, iconSolid: UserIconSolid },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = active ? item.iconSolid : item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full relative ${
                active ? 'text-secondary' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 ${active ? 'font-semibold' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;