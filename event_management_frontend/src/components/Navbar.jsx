/**
 * Navbar Component
 * Navigation bar with authentication status
 * Shows user name, logout button if logged in
 * Shows login/register buttons if not logged in
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import helpers from '../utils/helpers';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo/Brand */}
        <Link to="/" className="text-2xl font-bold text-primary-600">
          EventHub
        </Link>

        {/* Center Navigation */}
        <div className="hidden md:flex gap-6">
          <Link
            to="/"
            className="text-gray-700 hover:text-primary-600 transition"
          >
            Home
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/my-events"
                className="text-gray-700 hover:text-primary-600 transition"
              >
                My Events
              </Link>
              <Link
                to="/my-registrations"
                className="text-gray-700 hover:text-primary-600 transition"
              >
                My Registrations
              </Link>
            </>
          )}
        </div>

        {/* Right Navigation */}
        <div className="flex gap-4 items-center">
          {isAuthenticated ? (
            <>
              {/* User Profile Section */}
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-500 text-white font-bold">
                  {helpers.getInitials(user?.full_name || 'User')}
                </div>
                <span className="text-gray-700 font-medium">
                  {user?.full_name?.split(' ')[0]}
                </span>
              </div>

              {/* Create Event Button */}
              <Link
                to="/create-event"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
              >
                Create Event
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login/Register Buttons */}
              <Link
                to="/login"
                className="px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
