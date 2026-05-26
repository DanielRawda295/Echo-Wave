// src/services/authService.js (or wherever this file is located)

/**
 * Authentication Service Module
 * 
 * This service layer provides clean, reusable functions for authentication-related
 * API operations. It abstracts the actual HTTP implementation details from components.
 * 
 * Purpose:
 * - Centralize all authentication API calls
 * - Provide consistent interface for auth operations
 * - Easy maintenance and updates to auth endpoints
 * - Separation of concerns between UI and API logic
 * 
 * @module authService
 */

import api from '../utils/api';

/**
 * Register a new user account
 * 
 * Sends user registration data to the backend API to create a new user account.
 * Typically expects user data like email, password, username, etc.
 * 
 * @async
 * @function register
 * @param {Object} userData - User registration information
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @param {string} userData.username - User's display name (optional)
 * @param {Object} userData.profile - Additional profile information (optional)
 * @returns {Promise<Object>} Axios response containing user data and auth token
 * @throws {Error} When registration fails (duplicate email, invalid data, etc.)
 * 
 * @example
 * try {
 *   const response = await register({
 *     email: 'user@example.com',
 *     password: 'securepassword123',
 *     username: 'musiclover'
 *   });
 *   console.log('Registration successful:', response.data);
 * } catch (error) {
 *   console.error('Registration failed:', error.response.data);
 * }
 */
export const register = (userData: any) => api.post('/auth/register', userData);

/**
 * Authenticate an existing user
 * 
 * Sends user credentials to the backend API to verify identity and obtain
 * an authentication token for subsequent API requests.
 * 
 * @async
 * @function login
 * @param {Object} userData - User login credentials
 * @param {string} userData.email - User's registered email address
 * @param {string} userData.password - User's password
 * @returns {Promise<Object>} Axios response containing user data and auth token
 * @throws {Error} When authentication fails (invalid credentials, user not found, etc.)
 * 
 * @example
 * try {
 *   const response = await login({
 *     email: 'user@example.com',
 *     password: 'securepassword123'
 *   });
 *   const { token, user } = response.data;
 *   // Store token and update auth state
 * } catch (error) {
 *   console.error('Login failed:', error.response.data);
 * }
 */
export const login = (userData: any) => api.post('/auth/login', userData);

/**
 * Future Service Function Extensions:
 * 
 * Additional authentication-related functions that could be added:
 * 
 * @example
 * // Logout function (if backend invalidation is needed)
 * export const logout = () => api.post('/auth/logout');
 * 
 * // Password reset request
 * export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
 * 
 * // Verify email address
 * export const verifyEmail = (token) => api.post('/auth/verify-email', { token });
 * 
 * // Refresh access token
 * export const refreshToken = (refreshToken) => api.post('/auth/refresh', { refreshToken });
 * 
 * // Get current user profile
 * export const getProfile = () => api.get('/auth/profile');
 * 
 * // Update user profile
 * export const updateProfile = (userData) => api.put('/auth/profile', userData);
 */

/**
 * Service Architecture Benefits:
 * 
 * 1. **Consistency**: All auth calls use the same base API configuration
 * 2. **Reusability**: Functions can be used across multiple components
 * 3. **Testability**: Easy to mock for unit testing components
 * 4. **Maintainability**: API endpoint changes only affect this file
 * 5. **Error Handling**: Centralized error processing can be added
 * 
 * @example
 * // In React components, import and use:
 * import { register, login } from '../services/authService';
 * 
 * const SignupForm = () => {
 *   const handleSubmit = async (formData) => {
 *     try {
 *       await register(formData);
 *       // Handle success
 *     } catch (error) {
 *       // Handle error
 *     }
 *   };
 * };
 */
