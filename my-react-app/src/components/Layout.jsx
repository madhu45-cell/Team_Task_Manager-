import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  FolderIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">TeamTask Manager</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  <HomeIcon className="h-5 w-5 mr-1" />
                  Dashboard
                </Link>
                <Link
                  to="/projects"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <FolderIcon className="h-5 w-5 mr-1" />
                  Projects
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-md">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};