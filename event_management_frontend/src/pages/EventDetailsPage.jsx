/**
 * EventDetailsPage Component
 * Display detailed event information and registration form
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import eventService from '../services/eventService';
import validationRules from '../utils/validation';
import toastUtils from '../utils/toast';
import helpers from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [seatsReserved, setSeatsReserved] = useState(1);
  const [registrationError, setRegistrationError] = useState('');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEventDetails(id);
      setEvent(response);
    } catch (err) {
      setError(toastUtils.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    // Validate seats
    const validation = validationRules.validateRegistrationForm({ seats_reserved: seatsReserved });
    if (Object.keys(validation).length > 0) {
      setRegistrationError(validation.seats_reserved);
      return;
    }

    setRegistering(true);
    setRegistrationError('');

    try {
      await eventService.registerForEvent(id, { seats_reserved: parseInt(seatsReserved) });
      toastUtils.success('Registration successful!');
      setSeatsReserved(1);
      navigate('/my-registrations');
    } catch (err) {
      setRegistrationError(toastUtils.getErrorMessage(err));
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading event details..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorMessage message={error} onRetry={fetchEventDetails} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Event not found</h2>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const availableSeats = event.available_seats ?? 0;
  const isFullyBooked = availableSeats <= 0;
  const isPastEvent = new Date(event.event_date) < new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
            <div>
              <span className="font-semibold">📅 Date:</span>
              <p>{helpers.formatDate(event.event_date)}</p>
            </div>
            <div>
              <span className="font-semibold">⏰ Time:</span>
              <p>{helpers.formatTime(event.event_time)}</p>
            </div>
            <div>
              <span className="font-semibold">📍 Venue:</span>
              <p>{event.venue}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Available Seats</h3>
              <p className={`text-2xl font-bold ${isFullyBooked ? 'text-red-600' : 'text-green-600'}`}>
                {isFullyBooked ? 'Fully Booked' : availableSeats}
              </p>
              <p className="text-sm text-gray-600">out of {event.total_seats} total</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Ticket Price</h3>
              <p className="text-2xl font-bold text-green-600">
                {helpers.formatCurrency(event.ticket_price)}
              </p>
              <p className="text-sm text-gray-600">per ticket</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Time Remaining</h3>
              <p className="text-lg font-bold text-purple-600">
                {helpers.getTimeRemaining(event.event_date)}
              </p>
            </div>
          </div>

          {/* Registration Section */}
          {!isPastEvent && (
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Register for Event</h2>

              {isAuthenticated ? (
                <div className="space-y-4">
                  {!isFullyBooked ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Seats
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={availableSeats}
                          value={seatsReserved}
                          onChange={(e) => setSeatsReserved(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={registering}
                        />
                        {registrationError && (
                          <p className="text-red-500 text-sm mt-1">{registrationError}</p>
                        )}
                      </div>

                      <button
                        onClick={handleRegister}
                        disabled={registering}
                        className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {registering ? 'Registering...' : `Register for ${seatsReserved} seat${seatsReserved > 1 ? 's' : ''}`}
                      </button>
                    </>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-medium">This event is fully booked</p>
                      <p className="text-red-600 text-sm mt-1">
                        All {event.total_seats} seats have been reserved.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium">Login required</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Please{' '}
                    <button
                      onClick={() => navigate('/login')}
                      className="text-primary-600 font-medium hover:underline"
                    >
                      login
                    </button>{' '}
                    to register for this event.
                  </p>
                </div>
              )}
            </div>
          )}

          {isPastEvent && (
            <div className="border-t pt-8">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-800 font-medium">This event has already occurred</p>
                <p className="text-gray-600 text-sm mt-1">
                  Event date: {helpers.formatDate(event.event_date)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;