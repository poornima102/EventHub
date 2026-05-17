/**
 * RegisterPage Component
 * User registration form page
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import validationRules from '../utils/validation';
import toastUtils from '../utils/toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    const formErrors = validationRules.validateRegisterForm(formData);

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      formErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);

    // Prepare data without confirmPassword
    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);

    if (result.success) {
      toastUtils.success('Registration successful! Welcome to EventHub.');
      navigate('/');
    } else {
      toastUtils.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white py-12 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.08),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.06),_transparent_28%)] pointer-events-none"></div>
      <div className="relative max-w-md w-full bg-slate-900/95 border border-slate-800 shadow-2xl shadow-slate-950/30 rounded-3xl p-8 backdrop-blur-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Create your account</h1>
          <p className="text-slate-300 text-sm leading-6">Register to manage events, attendees, and registrations.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Field */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-slate-200 mb-1">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-3xl bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.full_name ? 'border-red-500' : 'border-slate-700'}`}
              placeholder="John Doe"
              disabled={loading}
            />
            {errors.full_name && (<p className="text-red-400 text-sm mt-1">{errors.full_name}</p>)}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-3xl bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.email ? 'border-red-500' : 'border-slate-700'}`}
              placeholder="you@domain.com"
              disabled={loading}
            />
            {errors.email && (<p className="text-red-400 text-sm mt-1">{errors.email}</p>)}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-3xl bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.password ? 'border-red-500' : 'border-slate-700'}`}
              placeholder="Create a password"
              disabled={loading}
            />
            {errors.password && (<p className="text-red-400 text-sm mt-1">{errors.password}</p>)}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-1">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-3xl bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-700'}`}
              placeholder="Confirm your password"
              disabled={loading}
            />
            {errors.confirmPassword && (<p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>)}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white py-3 rounded-3xl font-semibold shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Create account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center border-t border-slate-800 pt-5">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-300 font-semibold hover:underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
