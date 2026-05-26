// src/Layouts/SIgnUpAndLoginLayout.tsx (or wherever this file is located)

/**
 * MusicLayout Component - Main Application Layout Wrapper
 * 
 * This component provides the consistent layout structure for all music-related pages.
 * It includes the sidebar navigation, search bar, top play section, and music player
 * in a cohesive layout that persists across music pages.
 * 
 * Layout Structure:
 * - Sidebar: Left navigation menu
 * - Main Content Area: Search bar and page content
 * - TopPlay: Right sidebar with charts and artists (sticky on desktop)
 * - MusicPlayer: Bottom fixed audio player (conditionally rendered)
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content to be rendered in main area
 * @returns {JSX.Element} Complete music application layout with all UI elements
 */

import { Sidebar, Searchbar, TopPlay, MusicPlayer, Toasts } from '../components';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import ChatbotWidget from '../components/ChatbotWidget';

/**
 * MusicLayout Functional Component
 * 
 * Wraps all music pages with consistent navigation, search, and player interface.
 * Conditionally renders the music player only when a song is active.
 * 
 * @param props - Component properties
 * @param props.children - React nodes representing the main page content
 * @returns Layout container with all music app UI elements
 */
const MusicLayout = ({ children }: { children: React.ReactNode }) => {
  /**
   * Redux State Selection
   * 
   * Retrieves the active song from the player slice to conditionally render
   * the music player component at the bottom of the screen.
   */
  const { activeSong } = useSelector((state: RootState) => state.player);
  const chatbotBottomOffsetPx = activeSong?.title ? 24 + 112 : 24;

  return (
    /**
     * Main Layout Container
     * 
     * Uses relative positioning to allow absolute positioning of music player
     * Flex layout for responsive sidebar and content arrangement
     */
    <div className="relative flex">
      <Toasts />
      <ChatbotWidget bottomOffsetPx={chatbotBottomOffsetPx} rightOffsetPx={24} />
      {/**
       * Sidebar Navigation
       * 
       * Fixed left sidebar containing:
       * - App logo
       * - Navigation menu (Discover, Top Artists, Top Charts, Around You)
       * - Responsive mobile menu toggle
       */}
      <Sidebar />
      
      {/**
       * Main Content Area
       * 
       * Flexible container that takes remaining space after sidebar
       * Gradient background for visual appeal
       * Flex column layout for vertical stacking
       */}
      <div className="flex-1 flex flex-col bg-linear-to-br from-black to-[#121286]">
        {/**
         * Search Bar
         * 
         * Global search component positioned at top of content area
         * Accessible from all music pages for quick song/artist search
         */}
        <Searchbar />
        
        {/**
         * Content Container
         * 
         * Flexible area that holds the main page content and TopPlay sidebar
         * Responsive design: mobile (column-reverse) vs desktop (row)
         * Custom height calculation to account for search bar
         * Hidden scrollbar for cleaner appearance
         */}
        <div className="px-3 sm:px-6 h-[calc(100vh-72px)] overflow-y-scroll hide-scrollbar flex xl:flex-row flex-col-reverse">
          {/**
           * Main Page Content Area
           * 
           * Flexible container for the specific page content (Discover, Search, etc.)
           * Bottom padding to prevent content from being hidden behind music player
           * Height-fit to accommodate varying content lengths
           */}
          <div className="flex-1 h-fit pb-40">{children}</div>
          
          {/**
           * TopPlay Sidebar
           * 
           * Contains top charts and top artists sections
           * Sticky positioning on desktop for easy access while scrolling
           * Relative positioning on mobile for natural document flow
           */}
          <div className="xl:sticky relative top-0 h-fit">
            <TopPlay />
          </div>
        </div>
      </div>

      {/**
       * Conditional Music Player
       * 
       * Fixed bottom player that only renders when a song is active
       * Uses absolute positioning to overlay above other content
       * Smooth slide-up animation when appearing
       * High z-index to ensure it stays on top of other elements
       * 
       * Only renders when:
       * - activeSong exists in Redux state
       * - activeSong has a title property (valid song data)
       */}
      {activeSong?.title && (
        <div className="absolute h-28 bottom-0 left-0 right-0 flex animate-slideup bg-linear-to-br from-white/10 to-[#2a2a80] backdrop-blur-lg rounded-t-3xl z-10">
          <MusicPlayer />
        </div>
      )}
    </div>
  );
};

export default MusicLayout;

/**
 * Layout Behavior Notes:
 * 
 * Responsive Breakpoints:
 * - Mobile (default): TopPlay appears below main content (flex-col-reverse)
 * - Desktop (xl:): TopPlay appears as right sidebar (xl:flex-row)
 * 
 * Height Calculation:
 * - h-[calc(100vh-72px)]: Accounts for search bar height to prevent overflow
 * - pb-40: Prevents main content from being hidden behind music player
 * 
 * Conditional Rendering:
 * - Music player only shows when activeSong?.title exists
 * - Prevents empty player from showing when no song is selected
 * - Provides clean UI state for new users
 * 
 * Styling Features:
 * - Gradient backgrounds for visual depth
 * - Backdrop blur for modern glassmorphism effect
 * - Smooth animations for player appearance
 * - Rounded corners for aesthetic appeal
 * 
 * @example
 * // Usage in App.tsx routing
 * <Route
 *   path="/"
 *   element={
 *     <MusicLayout>
 *       <Discover />
 *     </MusicLayout>
 *   }
 * />
 * 
 * // All music pages follow the same pattern
 * <Route
 *   path="/search/:term"
 *   element={
 *     <MusicLayout>
 *       <Search />
 *     </MusicLayout>
 *   }
 * />
 */

/**
 * Component Integration Flow:
 * 
 * 1. User navigates to music page → Router renders MusicLayout with page component as children
 * 2. MusicLayout provides consistent UI framework around the page content
 * 3. Sidebar handles navigation between different music pages
 * 4. SearchBar provides global search functionality
 * 5. TopPlay shows trending content regardless of current page
 * 6. MusicPlayer appears when user selects a song to play
 * 7. All components share Redux state for seamless user experience
 */
