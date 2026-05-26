// src/context/AuthContext.tsx

/**
 * Authentication Context - Global Authentication State Management
 * 
 * This context provides authentication state and methods to the entire React application.
 * It manages user authentication tokens and persists them in localStorage for session continuity.
 * 
 * Features:
 * - Global authentication state management
 * - Token persistence across browser sessions
 * - Login/logout functionality
 * - Type-safe authentication context
 * 
 * @module AuthContext
 */

import { createContext, useContext, useState } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { useRecentlyPlayed } from '../hooks/useRecentlyPlayed';

/**
 * Authentication Context Interface
 * 
 * Defines the shape of the authentication context value that will be
 * provided to consuming components throughout the application.
 */
interface AuthContextType {
  /**
   * Current authentication token
   * 
   * Represents the user's authentication state:
   * - `string`: User is authenticated (valid token present)
   * - `null`: User is not authenticated (no token or invalid token)
   * 
   * @type {string | null}
   */
  token: string | null;
  
  /**
   * Login function - Authenticate user and store token
   * 
   * @param {string} token - Authentication token received from backend API
   * @returns {void}
   */
  login: (token: string, options?: { persist?: boolean }) => void;
  
  /**
   * Logout function - Clear authentication state
   * 
   * Removes token from both memory and persistent storage,
   * effectively logging the user out of the application.
   * 
   * @returns {void}
   */
  logout: () => void;
}

/**
 * Authentication Context Creation
 * 
 * Creates a React context for authentication with an undefined initial value.
 * The context will be properly initialized by the AuthProvider component.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication state and methods
 * to all child components via React Context.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that need access to auth context
 * @returns {JSX.Element} Context provider wrapping the application
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  /**
   * Authentication Token State
   * 
   * Manages the current authentication token in React state.
   * Initializes from localStorage to maintain session persistence.
   * 
   * @state {string | null} token - Current authentication token
   */
  const [token, setToken] = useState<string | null>(() => {
    const raw = localStorage.getItem('token') || sessionStorage.getItem('token');
    const cleaned = (raw || '').trim();
    if (!cleaned || cleaned === 'null' || cleaned === 'undefined') return null;
    return cleaned;
  });

  /**
   * Login Function
   * 
   * Authenticates a user by storing their token in both:
   * - React state (for immediate UI updates)
   * - localStorage (for session persistence)
   * 
   * @param {string} newToken - Authentication token from successful login
   * @returns {void}
   */
  const login = (newToken: string, options?: { persist?: boolean }) => {
    const cleaned = (newToken || '').trim();
    if (!cleaned) return;
    const persist = options?.persist !== false;

    // Clear any locally persisted favorites when switching accounts
    // to avoid showing favorites from a previous user session.
    try {
      useFavorites.getState().clearFavorites();
    } catch {
      // ignore storage errors
    }
    // Clear recently played for the same reason (per-account state)
    try {
      useRecentlyPlayed.getState().clear();
    } catch {
      // ignore storage errors
    }

    if (persist) {
      localStorage.setItem('token', cleaned);
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', cleaned);
      localStorage.removeItem('token');
    }
    setToken(cleaned);
  };

  /**
   * Logout Function
   * 
   * Logs out the user by removing the authentication token from:
   * - React state (immediate UI update)
   * - localStorage (clear persisted session)
   * 
   * @returns {void}
   */
  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // Clear favorites on logout so the next user starts fresh
    try {
      useFavorites.getState().clearFavorites();
    } catch {
      // ignore storage errors
    }
    // Clear recently played as well
    try {
      useRecentlyPlayed.getState().clear();
    } catch {
      // ignore storage errors
    }
    // Clear token from React state
    setToken(null);
  };

  /**
   * Context Value
   * 
   * The authentication state and methods that will be provided
   * to all consuming components in the application.
   */
  const contextValue: AuthContextType = {
    token,    // Current authentication token
    login,    // Function to authenticate user
    logout,   // Function to log out user
  };

  return (
    /**
     * Context Provider
     * 
     * Makes the authentication context available to all child components.
     * Any component in the tree can access auth state via useAuth hook.
     */
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom Authentication Hook
 * 
 * Provides easy access to the authentication context with proper error handling.
 * This hook should be used instead of directly using useContext(AuthContext).
 * 
 * @hook
 * @returns {AuthContextType} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 * 
 * @example
 * const { token, login, logout } = useAuth();
 * 
 * if (token) {
 *   // User is authenticated
 * } else {
 *   // User is not authenticated
 * }
 */
export const useAuth = () => {
  // Access the authentication context
  const context = useContext(AuthContext);
  
  /**
   * Error Handling
   * 
   * Ensures the hook is only used within components that are
   * children of the AuthProvider component.
   */
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};

/**
 * Usage Examples:
 * 
 * @example
 * // In login component
 * const LoginForm = () => {
 *   const { login } = useAuth();
 *   
 *   const handleSubmit = async (credentials) => {
 *     try {
 *       const response = await authAPI.login(credentials);
 *       login(response.data.token); // Store token in context
 *     } catch (error) {
 *       // Handle login error
 *     }
 *   };
 * };
 * 
 * @example
 * // In protected route component
 * const ProtectedRoute = ({ children }) => {
 *   const { token } = useAuth();
 *   
 *   if (!token) {
 *     return <Navigate to="/login" replace />;
 *   }
 *   
 *   return children;
 * };
 * 
 * @example
 * // In navbar component
 * const Navbar = () => {
 *   const { token, logout } = useAuth();
 *   
 *   return (
 *     <nav>
 *       {token ? (
 *         <button onClick={logout}>Logout</button>
 *       ) : (
 *         <Link to="/login">Login</Link>
 *       )}
 *     </nav>
 *   );
 * };
 */

/**
 * Security Considerations:
 * 
 * 1. Token Storage: Tokens are stored in localStorage which is accessible to JavaScript.
 *    For enhanced security, consider HTTP-only cookies for production.
 * 
 * 2. Token Validation: This context doesn't validate token expiration.
 *    Consider adding token expiration checks and automatic logout.
 * 
 * 3. Secure Logout: Ensure sensitive data is cleared from the application state
 *    when logout is called.
 * 
 * Future Enhancements:
 * 
 * - Add token refresh functionality
 * - Implement token expiration checks
 * - Add user profile data to context
 * - Support for multiple authentication providers
 * - Add authentication event listeners
 */

/**
 * Integration with Application:
 * 
 * The AuthProvider should wrap the entire application in main.tsx:
 * 
 * @example
 * // In main.tsx
 * ReactDOM.render(
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>,
 *   document.getElementById('root')
 * );
 */
