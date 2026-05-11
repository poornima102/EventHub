/**
 * App Component
 * Main application component with routing setup
 */
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const EventDetailsPage = lazy(() => import('./pages/EventDetailsPage'));
const CreateEventPage = lazy(() => import('./pages/CreateEventPage'));
const EditEventPage = lazy(() => import('./pages/EditEventPage'));
const MyEventsPage = lazy(() => import('./pages/MyEventsPage'));
const MyRegistrationsPage = lazy(() => import('./pages/MyRegistrationsPage'));
const EventRegistrationsPage = lazy(() => import('./pages/EventRegistrationsPage'));

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1">
          <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/event/:id" element={<EventDetailsPage />} />

              {/* Protected Routes */}
              <Route
                path="/create-event"
                element={
                  <ProtectedRoute>
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-event/:id"
                element={
                  <ProtectedRoute>
                    <EditEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-events"
                element={
                  <ProtectedRoute>
                    <MyEventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-registrations"
                element={
                  <ProtectedRoute>
                    <MyRegistrationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/event/:id/registrations"
                element={
                  <ProtectedRoute>
                    <EventRegistrationsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 - Not Found */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; 2024 EventHub. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
