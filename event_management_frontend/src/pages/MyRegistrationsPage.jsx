/**
 * MyRegistrationsPage Component
 * Display events the user has registered for
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import eventService from '../services/eventService';
import toastUtils from '../utils/toast';
import helpers from '../utils/helpers';

const MyRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getMyRegistrations();
      setRegistrations(response.results || response);
    } catch (err) {
      setError(toastUtils.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    try {
      await eventService.cancelRegistration(registrationId);
      toastUtils.success('Registration cancelled successfully');
      // Refresh the list
      await fetchMyRegistrations();
    } catch (err) {
      toastUtils.error(toastUtils.getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Registrations</h1>
        <p className="text-gray-600">Events you've registered for</p>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchMyRegistrations} />
      )}

      {/* Loading State */}
      {loading && <LoadingSpinner message="Loading your registrations..." />}

      {/* Registrations List */}
      {!loading && registrations.length > 0 && (
        <div className="space-y-6">
          {registrations.map((registration) => (
            <div key={registration.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {registration.event_banner && (
                  <img
                    src={registration.event_banner}
                    alt={registration.event_title}
                    className="h-40 w-full lg:w-56 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {registration.event_title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">📅 Date:</span>
                      <p>{helpers.formatDate(registration.event_date)}</p>
                    </div>
                    <div>
                      <span className="font-medium">⏰ Time:</span>
                      <p>{helpers.formatTime(registration.event_time)}</p>
                    </div>
                    <div>
                      <span className="font-medium">📍 Venue:</span>
                      <p>{registration.event_venue}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 items-center">
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">Registration Status:</span> {registration.registration_status}
                    </span>
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">Payment Status:</span> {registration.payment_status}
                    </span>
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">Seats Reserved:</span> {registration.seats_reserved}
                    </span>
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">Total Cost:</span> {helpers.formatCurrency(registration.total_cost)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 md:mt-0 md:ml-6 flex gap-3">
                  <Link
                    to={`/event/${registration.event}`}
                    className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition text-sm"
                  >
                    View Event
                  </Link>
                  {registration.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancelRegistration(registration.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && registrations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No registrations yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't registered for any events yet. Browse upcoming events to get started!
          </p>
          <Link
            to="/"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Browse Events
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyRegistrationsPage;