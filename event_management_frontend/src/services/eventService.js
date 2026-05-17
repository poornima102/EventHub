/**
 * Event Service
 * Handles all event-related API calls
 */
import apiClient from './api';

const unwrapResponse = (response) => {
  if (!response || !response.data) {
    return response;
  }

  // If API wraps payload in { success, message, data: {...}} return the internal data
  if (response.data.data !== undefined) {
    return response.data.data;
  }

  return response.data;
};

const eventService = {
  /**
   * Get all events (upcoming events)
   * @param {Object} params - Query parameters (page, search, venue, date_from, date_to, ordering)
   * @returns {Promise}
   */
  getEvents: async (params = {}) => {
    try {
      const response = await apiClient.get('/events/', { params });
      return unwrapResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get single event details
   * @param {Number} eventId - Event ID
   * @returns {Promise}
   */
  getEventDetails: async (eventId) => {
    try {
      const response = await apiClient.get(`/events/${eventId}/`);
      return unwrapResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new event
   * @param {Object} eventData - Event data
   * @returns {Promise}
   */
  createEvent: async (eventData) => {
    try {
      // If eventData is FormData, axios will set Content-Type: multipart/form-data automatically
      const config = eventData instanceof FormData ? {} : {};
      const response = await apiClient.post('/events/', eventData, config);
      return unwrapResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update event (full update)
   * @param {Number} eventId - Event ID
   * @param {Object} eventData - Updated event data
   * @returns {Promise}
   */
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await apiClient.put(`/events/${eventId}/`, eventData);
      return unwrapResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Partially update event
   * @param {Number} eventId - Event ID
   * @param {Object} eventData - Partial event data
   * @returns {Promise}
   */
  patchEvent: async (eventId, eventData) => {
    try {
      const response = await apiClient.patch(`/events/${eventId}/`, eventData);
      return unwrapResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete event
   * @param {Number} eventId - Event ID
   * @returns {Promise}
   */
  deleteEvent: async (eventId) => {
    try {
      const response = await apiClient.delete(`/events/${eventId}/`);
      return unwrapResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Register for an event
   * @param {Number} eventId - Event ID
   * @param {Object} registrationData - Registration data (seats_reserved)
   * @returns {Promise}
   */
  registerForEvent: async (eventId, registrationData) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/register/`, registrationData);
      return unwrapResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get user's registrations
   * @param {Object} params - Query parameters (status, page)
   * @returns {Promise}
   */
  getMyRegistrations: async (params = {}) => {
    try {
      const response = await apiClient.get('/my-registrations/', { params });
      return unwrapResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get user's created events
   * @param {Object} params - Query parameters (page)
   * @returns {Promise}
   */
  getMyEvents: async (params = {}) => {
    try {
      const response = await apiClient.get('/my-events/', { params });
      return unwrapResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get event registrations (creator only)
   * @param {Number} eventId - Event ID
   * @param {Object} params - Query parameters (status, page)
   * @returns {Promise}
   */
  getEventRegistrations: async (eventId, params = {}) => {
    try {
      const response = await apiClient.get(`/events/${eventId}/registrations/`, { params });
      return unwrapResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Cancel registration
   * @param {Number} registrationId - Registration ID
   * @returns {Promise}
   */
  cancelRegistration: async (registrationId) => {
    try {
      const response = await apiClient.post(`/registrations/${registrationId}/cancel/`);
      return unwrapResponse(response);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default eventService;
