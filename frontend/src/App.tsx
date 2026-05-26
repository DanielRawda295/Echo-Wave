/**
 * Main Application Component with Google OAuth Callback
 */

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MusicLayout from './Layouts/SIgnUpAndLoginLayout';
import api from './utils/api';
import ProtectedRoute from './components/ProtectedRoute';

// Import all page components for routing
import {
  Discover,
  TopArtists,
  TopCharts,
  AroundYou,
  ArtistDetails,
  SongDetails,
  Search,
  Favorites,
  Account,
  Playlists,
  PlaylistDetails,
  RecentlyPlayed,
  UploadSong,
  Community,
  MyUploads,
} from './pages';

// Import authentication page components
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';

/**
 * Google OAuth Callback Component
 * Handles the OAuth callback from Google
 */
const GoogleCallback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Google callback URL:', window.location.href);
        
        // Check URL hash for tokens (OIDC implicit flow)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const idToken = hashParams.get('id_token');
        const accessToken = hashParams.get('access_token');
        const hashError = hashParams.get('error');
        const hashErrorDescription = hashParams.get('error_description');

        const queryParams = new URLSearchParams(window.location.search);
        const queryError = queryParams.get('error');
        const queryErrorDescription = queryParams.get('error_description');
        const code = queryParams.get('code');
        
        console.log('URL hash:', hash);
        console.log('Access token from hash:', accessToken);
        console.log('ID token from hash:', idToken ? 'present' : 'missing');

        if (hashError || queryError) {
          setError(`Google authentication failed: ${hashErrorDescription || hashError || queryErrorDescription || queryError}`);
          return;
        }

        if (code && !idToken) {
          setError('Google returned an authorization code, but this app is configured for an ID token callback. Update Google OAuth settings or switch to code flow.');
          return;
        }
        
        if (idToken || accessToken) {
          // Backend expects an ID token (JWT). If only access_token exists, backend may reject it.
          try {
            const response = await api.post('/auth/google-login', {
              token: idToken || accessToken
            });
            
            if (response.data.access_token) {
              let persist = true;
              let next = '/';
              try {
                persist = sessionStorage.getItem('echowave.oauth.persist') !== '0';
                next = sessionStorage.getItem('echowave.oauth.next') || '/';
                sessionStorage.removeItem('echowave.oauth.persist');
                sessionStorage.removeItem('echowave.oauth.next');
              } catch {
                // ignore
              }

              login(response.data.access_token, { persist });
              navigate(next, { replace: true });
              return;
            }
          } catch (backendError) {
            console.error('Backend Google login error:', backendError);
            setError('Google authentication failed. Backend rejected the token.');
            return;
          }
        }
        
        // If we get here, something went wrong
        setError('Google authentication failed. No valid token received.');
        
      } catch (err) {
        console.error('Google callback error:', err);
        setError('Authentication failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [login, navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#2a2a3f'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h2 style={{ color: '#4f46e5' }}>Authenticating with Google...</h2>
          <p>Please wait while we log you in.</p>
          <div style={{ marginTop: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #4f46e5',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#2a2a3f'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h2 style={{ color: '#ff4d4f' }}>Authentication Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/login')}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3730a3'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

/**
 * Main App Component
 */
const App = () => {
  // Get authentication token from AuthContext
  const { token } = useAuth();

  return (
    <Routes>
      {/* 
        PUBLIC ROUTES - Accessible only when NOT authenticated
        If user is already authenticated, redirect to main app
      */}
      <Route 
        path="/login" 
        element={!token ? <Login /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/signup" 
        element={!token ? <Signup /> : <Navigate to="/" replace />} 
      />

      {/* Google OAuth Callback Route */}
      <Route 
        path="/auth/google/callback" 
        element={!token ? <GoogleCallback /> : <Navigate to="/" replace />} 
      />

      {/* 
        PROTECTED MUSIC ROUTES - Require valid authentication
        All music features are wrapped with MusicLayout for consistent UI
        If no token exists, redirect to login page
      */}
      
      {/* Discover - Main landing page with genre-based music discovery */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <Discover />
            </MusicLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Top Artists - Display popular artists */}
      <Route
        path="/top-artists"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <TopArtists />
            </MusicLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Top Charts - Show trending songs and charts */}
      <Route
        path="/top-charts"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <TopCharts />
            </MusicLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Around You - Location-based music recommendations */}
      <Route
        path="/around-you"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <AroundYou />
            </MusicLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Artist Details - Individual artist profile and songs */}
      <Route
        path="/artists/:id"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <ArtistDetails />
            </MusicLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Song Details - Individual song information and lyrics */}
      <Route
        path="/songs/:songid"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <SongDetails />
            </MusicLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Search - Music search results page */}
      <Route
        path="/search/:searchTerm"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <Search />
            </MusicLayout>
          </ProtectedRoute>
        }
      />

      {/* Favorites - Liked songs (stored locally) */}
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <Favorites />
            </MusicLayout>
          </ProtectedRoute>
        }
      />

      {/* Account - Per-user settings */}
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <Account />
            </MusicLayout>
          </ProtectedRoute>
        }
      />

      {/* Playlists - User-created playlists */}
      <Route
        path="/playlists"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <Playlists />
            </MusicLayout>
          </ProtectedRoute>
        }
      />

      {/* Playlist Details */}
      <Route
        path="/playlists/:id"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <PlaylistDetails />
            </MusicLayout>
          </ProtectedRoute>
        }
      />

      {/* Recently Played */}
      <Route
        path="/recently-played"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <RecentlyPlayed />
            </MusicLayout>
          </ProtectedRoute>
        }
      />

      {/* Upload song */}
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <UploadSong />
            </MusicLayout>
          </ProtectedRoute>
        }
      />

      {/* Community uploads */}
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <Community />
            </MusicLayout>
          </ProtectedRoute>
        }
      />

      {/* My uploads */}
      <Route
        path="/my-uploads"
        element={
          <ProtectedRoute>
            <MusicLayout>
              <MyUploads />
            </MusicLayout>
          </ProtectedRoute>
        }
      />

      {/* 
        CATCH-ALL ROUTE - Handle undefined paths
        Redirects to appropriate page based on authentication status:
        - Authenticated users: redirect to Discover page (/)
        - Unauthenticated users: redirect to Login page
      */}
      <Route 
        path="*" 
        element={<Navigate to={token ? "/" : "/login"} replace />} 
      />
    </Routes>
  );
};

export default App;
