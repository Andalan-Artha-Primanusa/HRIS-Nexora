import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * 
 * Protects routes by checking if user has valid authentication token.
 * Token is already validated by login API, so we trust it here.
 */
export const ProtectedRoute: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    const hasValidToken = !!(token && token !== 'null' && token !== 'undefined');
    
    setIsAuthenticated(hasValidToken);
    setIsChecking(false);
  }, []);

  // While checking, show loading state
  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          fontSize: '1rem',
          color: '#666'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // Token exists = render protected routes
  if (isAuthenticated) {
    return <Outlet />;
  }

  // No token = redirect to login
  return <Navigate to="/login" replace />;
};
