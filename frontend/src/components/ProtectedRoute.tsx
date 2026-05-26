// src/components/ProtectedRoute.tsx

import type { JSX } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * 🔒 ProtectedRoute Component
 *
 * Ensures that only authenticated users can access certain routes.
 * - Checks for a valid authentication token from context.
 * - Redirects unauthenticated users to the login page.
 *
 * @component
 * @param {{ children: JSX.Element }} props - The protected content to render
 * @returns {JSX.Element} Either the protected content or a redirect to login
 */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // Get authentication token from context
  const { token } = useAuth();
  const location = useLocation();
  
  /**
   * Redirect Logic
   * - If token is missing, navigate to login page
   */
  if (!token) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  
  // Render the protected children if token exists
  return children;
};

export default ProtectedRoute;
