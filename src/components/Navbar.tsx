import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, Package, ShoppingBag, BarChart2 } from 'lucide-react';

export default function Navbar() {
  const { user, userRole, signOut } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="flex items-center px-2 py-2 text-gray-700 hover:text-blue-600"
            >
              {userRole === 'seller' && <Package className="w-6 h-6" />}
              {userRole === 'buyer' && <ShoppingBag className="w-6 h-6" />}
              {userRole === 'admin' && <BarChart2 className="w-6 h-6" />}
              <span className="ml-2 font-semibold">Marketplace</span>
            </Link>
          </div>

          <div className="flex items-center">
            <span className="px-4 py-2 text-sm text-gray-700">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
            <button
              onClick={handleSignOut}
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}