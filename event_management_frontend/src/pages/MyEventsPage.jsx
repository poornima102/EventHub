/**
 * MyEventsPage Component
 * Display events created by the logged-in user
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import eventService from '../services/eventService';
import toastUtils from '../utils/toast';

const MyEventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getMyEvents();
      setEvents(response.results || response);
    } catch (err) {
      setError(toastUtils.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (eventId) => {
    navigate(`/edit-event/${eventId}`);
  };

  const handleDelete = async (eventId) => {
    try {
      await eventService.deleteEvent(eventId);
      toastUtils.success('Event deleted successfully');
      // Refresh the list
      await fetchMyEvents();
    } catch (err) {
      toastUtils.error(toastUtils.getErrorMessage(err));
    }
  };

  const handleViewRegistrations = (eventId) => {
    navigate(`/event/${eventId}/registrations`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
        <p className="text-gray-600">Manage the events you've created</p>
      </div>

      {/* Create Event Button */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/create-event')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
        >
          + Create New Event
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchMyEvents} />
      )}

      {/* Loading State */}
      {loading && <LoadingSpinner message="Loading your events..." />}

      {/* Events Grid */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="relative">
              <EventCard
                event={event}
                showActions={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              {/* View Registrations Button */}
              <button
                onClick={() => handleViewRegistrations(event.id)}
                className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
              >
                View Registrations
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No events created yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't created any events yet. Start by creating your first event!
          </p>
          <button
            onClick={() => navigate('/create-event')}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Create Your First Event
          </button>
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;
