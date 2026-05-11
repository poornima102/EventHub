/**
 * Toast Notification Utilities
 * Provides helper functions for showing toast notifications
 */
import toast from 'react-hot-toast';

const toastUtils = {
  /**
   * Show success toast
   */
  success: (message) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  },

  /**
   * Show error toast
   */
  error: (message) => {
    toast.error(message, {
      duration: 3000,
      position: 'top-right',
    });
  },

  /**
   * Show loading toast
   */
  loading: (message) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },

  /**
   * Show info toast
   */
  info: (message) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: 'ℹ️',
    });
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
  },

  /**
   * Show confirmation dialog
   */
  confirm: (message) => {
    return new Promise((resolve) => {
      toast((t) => (
        <div>
          <p className="mb-4">{message}</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Confirm
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-4 py-2 bg-gray-300 text-black rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
        position: 'top-right',
      });
    });
  },

  /**
   * Extract error message from API response
   */
  getErrorMessage: (error) => {
    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    if (error.data?.message) {
      return error.data.message;
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }

    return 'An error occurred. Please try again.';
  },
};

export default toastUtils;
