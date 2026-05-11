/**
 * Helper Utilities
 * Common utility functions
 */

const helpers = {
  /**
   * Format date to readable format
   */
  formatDate: (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  },

  /**
   * Format date and time
   */
  formatDateTime: (dateString, timeString) => {
    const date = new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return `${date} at ${timeString}`;
  },

  /**
   * Format currency
   */
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  /**
   * Truncate text
   */
  truncateText: (text, length = 100) => {
    if (!text || text.length <= length) {
      return text;
    }
    return `${text.substring(0, length)}...`;
  },

  /**
   * Get initials from name
   */
  getInitials: (fullName) => {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  },

  /**
   * Convert time to 12-hour format
   */
  formatTime: (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  },

  /**
   * Get time remaining until event
   */
  getTimeRemaining: (eventDate) => {
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    const diff = eventDateTime - now;

    if (diff <= 0) {
      return 'Event has started';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  },

  /**
   * Get minimum date (today)
   */
  getMinDate: () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Parse error response
   */
  parseError: (error) => {
    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    if (error.data?.message) {
      return error.data.message;
    }

    if (Array.isArray(error)) {
      return error[0];
    }

    return 'An error occurred';
  },
};

export default helpers;
