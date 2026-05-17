/**
 * EventRegistrationsPage Component
 * Display registrations for a specific event (creator only)
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import eventService from '../services/eventService';
import toastUtils from '../utils/toast';
import helpers from '../utils/helpers';

const getFormattedStatus = (status) => {
  const normalizedStatus = typeof status === 'string' ? status.trim().toLowerCase() : '';
  if (!normalizedStatus) return 'Unknown';
  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
};

const getStatusClasses = (status) => {
  const normalizedStatus = typeof status === 'string' ? status.trim().toLowerCase() : '';
  if (normalizedStatus === 'confirmed') return 'bg-green-100 text-green-800';
  if (normalizedStatus === 'cancelled') return 'bg-red-100 text-red-800';
  return 'bg-yellow-100 text-yellow-800';
};

const EventRegistrationsPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalSeatsReserved: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchEventAndRegistrations();
  }, [id]);

  const fetchEventAndRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch event details and registrations in parallel
      const [eventResponse, registrationsResponse] = await Promise.all([
        eventService.getEventDetails(id),
        eventService.getEventRegistrations(id),
      ]);

      setEvent(eventResponse);
      setRegistrations(registrationsResponse.results || registrationsResponse);

      // Calculate stats
      const regs = registrationsResponse.results || registrationsResponse;
      const totalSeats = regs.reduce((sum, reg) => sum + reg.seats_reserved, 0);
      const totalRevenue = regs.reduce((sum, reg) => sum + reg.total_cost, 0);

      setStats({
        totalRegistrations: regs.length,
        totalSeatsReserved: totalSeats,
        totalRevenue: totalRevenue,
      });
    } catch (err) {
      setError(toastUtils.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading registrations..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ErrorMessage message={error} onRetry={fetchEventAndRegistrations} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Registrations for "{event?.title}"
        </h1>
        <p className="text-gray-600">Manage registrations for your event</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Registrations</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalRegistrations}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Seats Reserved</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalSeatsReserved}</p>
          <p className="text-sm text-gray-600">out of {event?.total_seats} total</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-blue-600">
            {helpers.formatCurrency(stats.totalRevenue)}
          </p>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Registration Details</h2>
        </div>

        {registrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seats Reserved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {registration.user?.full_name || 'Guest'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{registration.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{registration.seats_reserved ?? '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {helpers.formatCurrency(registration.total_cost ?? 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {helpers.formatDate(registration.registered_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(registration.registration_status)}`}>
                        {getFormattedStatus(registration.registration_status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No registrations yet</h3>
            <p className="text-gray-600">
              No one has registered for this event yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistrationsPage;