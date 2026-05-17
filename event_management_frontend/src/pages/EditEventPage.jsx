/**
 * EditEventPage Component
 * Form to edit an existing event
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import validationRules from '../utils/validation';
import toastUtils from '../utils/toast';
import helpers from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    event_date: '',
    event_hour: '09',
    event_minute: '00',
    event_time_period: 'AM',
    total_seats: '',
    ticket_price: '',
    banner_image: null,
    banner_image_url: '',
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const convertTo12Hour = (time24) => {
    if (!time24) {
      return { hour: '09', minute: '00', period: 'AM' };
    }
    const [hourStr, minuteStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    let period = 'AM';

    if (hour === 0) {
      hour = 12;
      period = 'AM';
    } else if (hour === 12) {
      period = 'PM';
    } else if (hour > 12) {
      hour -= 12;
      period = 'PM';
    }

    return {
      hour: String(hour).padStart(2, '0'),
      minute: minuteStr || '00',
      period,
    };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
      if (!allowedTypes.includes(file.type)) {
        toastUtils.error('Please upload JPG, PNG, GIF, WEBP or AVIF format only');
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        toastUtils.error('File size exceeds 20MB limit');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        banner_image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange({ target: { files } });
    }
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEventDetails(id);
      const { hour, minute, period } = convertTo12Hour(response.event_time);

      setFormData({
        title: response.title,
        description: response.description,
        venue: response.venue,
        event_date: response.event_date,
        event_hour: hour,
        event_minute: minute,
        event_time_period: period,
        total_seats: response.total_seats.toString(),
        ticket_price: response.ticket_price.toString(),
        banner_image: null,
        banner_image_url: response.banner_image || '',
      });
      setImagePreview(response.banner_image || null);
    } catch (err) {
      setError(toastUtils.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

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

    const hours = formData.event_hour || '00';
    const minutes = formData.event_minute || '00';
    let hourNum = parseInt(hours, 10);
    if (formData.event_time_period === 'PM' && hourNum !== 12) hourNum += 12;
    if (formData.event_time_period === 'AM' && hourNum === 12) hourNum = 0;
    const eventTimeIn24Hour = `${String(hourNum).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    const validatedForm = {
      ...formData,
      event_time: eventTimeIn24Hour,
    };

    const formErrors = validationRules.validateEventForm(validatedForm);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSaving(true);

    try {
      let payload;
      if (formData.banner_image) {
        payload = new FormData();
        payload.append('title', formData.title);
        payload.append('description', formData.description);
        payload.append('venue', formData.venue);
        payload.append('event_date', formData.event_date);
        payload.append('event_time', eventTimeIn24Hour);
        payload.append('total_seats', parseInt(formData.total_seats, 10));
        payload.append('ticket_price', parseFloat(formData.ticket_price));
        payload.append('banner_image', formData.banner_image);
      } else {
        payload = {
          title: formData.title,
          description: formData.description,
          venue: formData.venue,
          event_date: formData.event_date,
          event_time: eventTimeIn24Hour,
          total_seats: parseInt(formData.total_seats, 10),
          ticket_price: parseFloat(formData.ticket_price),
        };
      }

      await eventService.patchEvent(id, payload);

      toastUtils.success('Event updated successfully!');
      navigate(`/event/${id}`);
    } catch (err) {
      toastUtils.error(toastUtils.getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading event details..." />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <ErrorMessage message={error} onRetry={fetchEventDetails} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Event</h1>
        <p className="text-gray-600">Update your event details</p>
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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
            />
            {errors.venue && (
              <p className="text-red-500 text-sm mt-1">{errors.venue}</p>
            )}
          </div>

          {/* Banner Image Upload */}
          <div>
            <label htmlFor="banner_image" className="block text-sm font-medium text-gray-700 mb-2">
              Event Banner Image
            </label>
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition p-6 text-center cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="banner_image"
                  name="banner_image"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.avif,image/jpeg,image/png,image/gif,image/webp,image/avif"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={saving}
                />
                {imagePreview ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-600">Image selected</span>
                  </div>
                ) : (
                  <div>
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-700 font-medium mb-2">Drag image here or click to browse</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition mb-2"
                    >
                      Choose File
                    </button>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF • Max 20,480 KB (20 MB)</p>
                  </div>
                )}
              </div>

              {imagePreview && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-24 w-32 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formData.banner_image?.name || 'Current image'}
                          </p>
                          <div className="mt-2 space-y-1">
                            {formData.banner_image && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">File Size:</span> {(formData.banner_image?.size / 1024).toFixed(2)} KB ({(formData.banner_image?.size / (1024*1024)).toFixed(2)} MB)
                              </p>
                            )}
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Max Allowed:</span> 20,480 KB (20 MB)
                            </p>
                            <p className="text-xs text-green-600 font-medium">✓ Ready to upload</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, banner_image: null }));
                            setImagePreview(formData.banner_image_url || null);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded px-2 py-1 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                disabled={saving}
              />
              {errors.event_date && (
                <p className="text-red-500 text-sm mt-1">{errors.event_date}</p>
              )}
            </div>

            <div>
              <label htmlFor="event_time" className="block text-sm font-medium text-gray-700 mb-1">
                Event Time *
              </label>
              <div className="flex gap-2">
                <select
                  name="event_hour"
                  value={formData.event_hour}
                  onChange={handleChange}
                  className="w-1/3 px-3 py-2 border rounded-lg bg-white"
                  disabled={saving}
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const hour = String(i + 1).padStart(2, '0');
                    return (
                      <option key={hour} value={hour}>{hour}</option>
                    );
                  })}
                </select>

                <select
                  name="event_minute"
                  value={formData.event_minute}
                  onChange={handleChange}
                  className="w-1/3 px-3 py-2 border rounded-lg bg-white"
                  disabled={saving}
                >
                  {Array.from({ length: 60 }, (_, i) => {
                    const m = String(i).padStart(2, '0');
                    return <option key={m} value={m}>{m}</option>;
                  })}
                </select>

                <select
                  name="event_time_period"
                  value={formData.event_time_period}
                  onChange={handleChange}
                  className="w-1/3 px-3 py-2 border rounded-lg bg-white"
                  disabled={saving}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
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
                disabled={saving}
              />
              {errors.total_seats && (
                <p className="text-red-500 text-sm mt-1">{errors.total_seats}</p>
              )}
            </div>

            <div>
              <label htmlFor="ticket_price" className="block text-sm font-medium text-gray-700 mb-1">
                Ticket Price (₹) *
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
                placeholder="₹ 250.00"
                disabled={saving}
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
              onClick={() => navigate(`/event/${id}`)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Updating Event...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventPage;
