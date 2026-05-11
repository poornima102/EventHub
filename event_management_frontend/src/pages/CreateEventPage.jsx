/**
 * CreateEventPage Component
 * Form to create a new event
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import validationRules from '../utils/validation';
import toastUtils from '../utils/toast';
import helpers from '../utils/helpers';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    event_date: '',
    event_time: '',
    total_seats: '',
    ticket_price: '',
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
    const formErrors = validationRules.validateEventForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await eventService.createEvent({
        ...formData,
        total_seats: parseInt(formData.total_seats),
        ticket_price: parseFloat(formData.ticket_price),
      });

      toastUtils.success('Event created successfully!');
      navigate(`/event/${response.id}`);
    } catch (err) {
      toastUtils.error(toastUtils.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
        <p className="text-gray-600">Fill in the details to create your event</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter event title"
              disabled={loading}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your event"
              disabled={loading}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Venue */}
          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">
              Venue *
            </label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.venue ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Event location"
              disabled={loading}
            />
            {errors.venue && (
              <p className="text-red-500 text-sm mt-1">{errors.venue}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                id="event_date"
                name="event_date"
                min={helpers.getMinDate()}
                value={formData.event_date}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.event_date ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.event_date && (
                <p className="text-red-500 text-sm mt-1">{errors.event_date}</p>
              )}
            </div>

            <div>
              <label htmlFor="event_time" className="block text-sm font-medium text-gray-700 mb-1">
                Event Time *
              </label>
              <input
                type="time"
                id="event_time"
                name="event_time"
                value={formData.event_time}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.event_time ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.event_time && (
                <p className="text-red-500 text-sm mt-1">{errors.event_time}</p>
              )}
            </div>
          </div>

          {/* Seats and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="total_seats" className="block text-sm font-medium text-gray-700 mb-1">
                Total Seats *
              </label>
              <input
                type="number"
                id="total_seats"
                name="total_seats"
                min="1"
                value={formData.total_seats}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.total_seats ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="100"
                disabled={loading}
              />
              {errors.total_seats && (
                <p className="text-red-500 text-sm mt-1">{errors.total_seats}</p>
              )}
            </div>

            <div>
              <label htmlFor="ticket_price" className="block text-sm font-medium text-gray-700 mb-1">
                Ticket Price ($) *
              </label>
              <input
                type="number"
                id="ticket_price"
                name="ticket_price"
                min="0"
                step="0.01"
                value={formData.ticket_price}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.ticket_price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="25.00"
                disabled={loading}
              />
              {errors.ticket_price && (
                <p className="text-red-500 text-sm mt-1">{errors.ticket_price}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
