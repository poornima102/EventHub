/**
 * HomePage Component
 * Display all upcoming events with search and pagination
 */
import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import eventService from '../services/eventService';
import toastUtils from '../utils/toast';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [currentPage, searchTerm]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
      };

      if (searchTerm.trim()) {
        params.search = searchTerm;
      }

      const response = await eventService.getEvents(params);

      setEvents(response.results || response);
      setTotalPages(Math.ceil((response.count || response.length) / 10));
    } catch (err) {
      setError(toastUtils.getErrorMessage(err));
      toastUtils.error(toastUtils.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h1>
        <p className="text-gray-600 text-lg">
          Discover and register for amazing events happening near you
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search events by title, venue..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchEvents} />
      )}

      {/* Loading State */}
      {loading && <LoadingSpinner message="Loading events..." />}

      {/* Events Grid */}
      {!loading && events.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No events found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try a different search term' : 'Check back soon for upcoming events!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
