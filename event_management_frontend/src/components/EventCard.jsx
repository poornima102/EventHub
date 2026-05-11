/**
 * EventCard Component
 * Reusable component for displaying event details in a card format
 */
import React from 'react';
import { Link } from 'react-router-dom';
import helpers from '../utils/helpers';

const EventCard = ({ event, showActions = false, onEdit = null, onDelete = null }) => {
  const availableSeats = event.total_seats - event.seats_booked;
  const isFullyBooked = availableSeats <= 0;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      {/* Header with date badge */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold mb-1">{event.title}</h3>
            <p className="text-sm opacity-90">{event.venue}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{helpers.formatDate(event.event_date)}</div>
            <div className="text-sm">{helpers.formatTime(event.event_time)}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {helpers.truncateText(event.description, 100)}
        </p>

        {/* Details Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-500 text-xs uppercase">Available Seats</p>
            <p className={`text-lg font-bold ${isFullyBooked ? 'text-red-500' : 'text-green-500'}`}>
              {isFullyBooked ? 'Fully Booked' : availableSeats}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase">Ticket Price</p>
            <p className="text-lg font-bold text-primary-600">
              {helpers.formatCurrency(event.ticket_price)}
            </p>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-700">
            ⏰ {helpers.getTimeRemaining(event.event_date)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {showActions ? (
            <>
              <button
                onClick={() => onEdit(event.id)}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
              >
                Delete
              </button>
            </>
          ) : (
            <Link
              to={`/event/${event.id}`}
              className="w-full px-3 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition text-sm text-center"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
