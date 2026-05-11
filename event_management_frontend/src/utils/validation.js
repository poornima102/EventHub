/**
 * Form Validation Utilities
 * Provides validation functions for forms
 */

const validationRules = {
  /**
   * Validate email format
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   */
  isValidPassword: (password) => {
    return password && password.length >= 6;
  },

  /**
   * Validate required field
   */
  isRequired: (value) => {
    return value && value.toString().trim().length > 0;
  },

  /**
   * Validate number is positive
   */
  isPositive: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  },

  /**
   * Validate number is non-negative
   */
  isNonNegative: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  },

  /**
   * Validate date is in future
   */
  isFutureDate: (dateString) => {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  },

  /**
   * Validate event form
   */
  validateEventForm: (formData) => {
    const errors = {};

    if (!validationRules.isRequired(formData.title)) {
      errors.title = 'Title is required';
    }

    if (!validationRules.isRequired(formData.description)) {
      errors.description = 'Description is required';
    }

    if (!validationRules.isRequired(formData.venue)) {
      errors.venue = 'Venue is required';
    }

    if (!validationRules.isRequired(formData.event_date)) {
      errors.event_date = 'Event date is required';
    } else if (!validationRules.isFutureDate(formData.event_date)) {
      errors.event_date = 'Event date must be in the future';
    }

    if (!validationRules.isRequired(formData.event_time)) {
      errors.event_time = 'Event time is required';
    }

    if (!validationRules.isRequired(formData.total_seats)) {
      errors.total_seats = 'Total seats is required';
    } else if (!validationRules.isPositive(formData.total_seats)) {
      errors.total_seats = 'Total seats must be greater than 0';
    }

    if (!validationRules.isRequired(formData.ticket_price)) {
      errors.ticket_price = 'Ticket price is required';
    } else if (!validationRules.isNonNegative(formData.ticket_price)) {
      errors.ticket_price = 'Ticket price cannot be negative';
    }

    return errors;
  },

  /**
   * Validate login form
   */
  validateLoginForm: (formData) => {
    const errors = {};

    if (!validationRules.isRequired(formData.email)) {
      errors.email = 'Email is required';
    } else if (!validationRules.isValidEmail(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!validationRules.isRequired(formData.password)) {
      errors.password = 'Password is required';
    }

    return errors;
  },

  /**
   * Validate register form
   */
  validateRegisterForm: (formData) => {
    const errors = {};

    if (!validationRules.isRequired(formData.full_name)) {
      errors.full_name = 'Full name is required';
    }

    if (!validationRules.isRequired(formData.email)) {
      errors.email = 'Email is required';
    } else if (!validationRules.isValidEmail(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!validationRules.isRequired(formData.password)) {
      errors.password = 'Password is required';
    } else if (!validationRules.isValidPassword(formData.password)) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  },

  /**
   * Validate registration (seats) form
   */
  validateRegistrationForm: (formData) => {
    const errors = {};

    if (!validationRules.isRequired(formData.seats_reserved)) {
      errors.seats_reserved = 'Number of seats is required';
    } else if (!validationRules.isPositive(formData.seats_reserved)) {
      errors.seats_reserved = 'Seats must be greater than 0';
    }

    return errors;
  },
};

export default validationRules;
