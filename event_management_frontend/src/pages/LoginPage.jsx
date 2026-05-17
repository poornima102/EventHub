/**
 * LoginPage Component
 * User login form page
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import validationRules from '../utils/validation';
import toastUtils from '../utils/toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const formErrors = validationRules.validateLoginForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    const result = await login(formData);

    if (result.success) {
      toastUtils.success('Login successful! Welcome back.');
      navigate('/');
    } else {
      toastUtils.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white py-12 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_28%)] pointer-events-none"></div>
      <div className="relative max-w-md w-full bg-slate-900/95 border border-slate-800 shadow-2xl shadow-slate-950/30 rounded-3xl p-8 backdrop-blur-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-600/10 text-primary-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] mb-4">
            EventHub
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">EventHub</h1>
          <p className="text-slate-300 text-sm leading-6">
            Sign in to your account to manage events, attendees, and registrations.
          </p>
        </div>

        <div className="mb-6" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-3xl bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                errors.email ? 'border-red-500' : 'border-slate-700'
              }`}
              placeholder="you@domain.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-3xl bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                errors.password ? 'border-red-500' : 'border-slate-700'
              }`}
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white py-3 rounded-3xl font-semibold shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign in'}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center border-t border-slate-800 pt-5">
          <p className="text-slate-400 text-sm">
            New to EventHub?{' '}
            <Link to="/register" className="text-cyan-300 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
