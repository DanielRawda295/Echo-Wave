
/**
 * Music Genres Array
 * 
 * Comprehensive list of music genres supported by the application.
 * Genres are selected based on popularity and availability in the iTunes API.
 * Each genre is mapped to appropriate iTunes search terms for optimal results.
 * 
 * @constant {Genre[]} genres - Array of music genre objects
 */
export const genres = [
  /**
   * Pop Music
   * Mainstream popular music characterized by catchy melodies and broad appeal
   */
  { title: 'Pop', value: 'POP' },
  
  /**
   * Hip-Hop and Rap
   * Urban music genre featuring rhythmic speech and electronic beats
   */
  { title: 'Hip-Hop', value: 'HIP_HOP_RAP' },
  
  /**
   * Dance Music
   * Upbeat music designed for dancing, often featuring electronic elements
   */
  { title: 'Dance', value: 'DANCE' },
  
  /**
   * Electronic Music
   * Music created using electronic instruments and technology
   */
  { title: 'Electronic', value: 'ELECTRONIC' },
  
  /**
   * Soul and R&B
   * Emotional music combining rhythm, blues, and soulful vocals
   */
  { title: 'Soul', value: 'SOUL_RNB' },
  
  /**
   * Alternative Music
   * Non-mainstream rock and pop music, often with experimental elements
   */
  { title: 'Alternative', value: 'ALTERNATIVE' },
  
  /**
   * Rock Music
   * Guitar-driven music with strong rhythms, originating from rock and roll
   */
  { title: 'Rock', value: 'ROCK' },
  
  /**
   * Latin Music
   * Music from Latin America and Spanish/Portuguese-speaking regions
   */
  { title: 'Latin', value: 'LATIN' },
  
  /**
   * Film and TV Soundtracks
   * Music composed for movies, television shows, and other visual media
   */
  { title: 'Film', value: 'FILM_TV' },
  
  /**
   * Country Music
   * American folk music with roots in rural Southern United States
   */
  { title: 'Country', value: 'COUNTRY' },
  
  /**
   * Worldwide Music
   * International music from various cultures and regions globally
   */
  { title: 'Worldwide', value: 'WORLDWIDE' },
  
  /**
   * Reggae and Dancehall
   * Jamaican music genres with distinctive rhythms and social commentary
   */
  { title: 'Reggae', value: 'REGGAE_DANCE_HALL' },
  
  /**
   * House Music
   * Electronic dance music with repetitive 4/4 beats and synthesized basslines
   */
  { title: 'House', value: 'HOUSE' },
  
  /**
   * K-Pop (Korean Pop)
   * South Korean popular music incorporating various genres and performance elements
   */
  { title: 'K-Pop', value: 'K_POP' },
];

/**
 * Usage Examples:
 * 
 * @example
 * // In Discover page for genre selection dropdown
 * <select onChange={(e) => setSelectedGenre(e.target.value)}>
 *   {genres.map((genre) => (
 *     <option key={genre.value} value={genre.value}>
 *       {genre.title}
 *     </option>
 *   ))}
 * </select>
 * 
 * @example
 * // In API service for genre-based searches
 * const getSongsByGenre = (genreValue: string) => {
 *   const genre = genres.find(g => g.value === genreValue);
 *   return api.get(`/search?term=${genre?.title}&entity=musicTrack`);
 * };
 * 
 * @example
 * // Displaying genre name from value
 * const getGenreTitle = (genreValue: string) => {
 *   const genre = genres.find(g => g.value === genreValue);
 *   return genre?.title || 'Unknown Genre';
 * };
 */

/**
 * Genre Selection Benefits:
 * 
 * 1. **User Experience**: Familiar genre names that users recognize
 * 2. **API Compatibility**: Values optimized for iTunes search API
 * 3. **Consistency**: Same genres available across all application features
 * 4. **Maintainability**: Centralized genre definitions for easy updates
 * 5. **Internationalization Ready**: Structure supports future translation
 * 
 * @example
 * // Future enhancement for internationalization
 * const genres = [
 *   { title: 'Pop', value: 'POP', i18nKey: 'genre.pop' },
 *   { title: 'Rock', value: 'ROCK', i18nKey: 'genre.rock' },
 *   // ...
 * ];
 */

/**
 * iTunes API Integration Notes:
 * 
 * The genre values are designed to work effectively with iTunes Search API:
 * - Simple, common terms that return good results
 * - Broad enough to return substantial music catalogs
 * - Specific enough to provide meaningful genre separation
 * - Compatible with iTunes genre taxonomy
 * 
 * @example
 * // iTunes API search using genre title
 * https://itunes.apple.com/search?term=pop&entity=musicTrack&limit=50
 * https://itunes.apple.com/search?term=rock&entity=musicTrack&limit=50
 */

/**
 * Future Enhancements:
 * 
 * Additional genres that could be added:
 * - Classical
 * - Jazz
 * - Blues
 * - Metal
 * - Folk
 * - Indie
 * - Punk
 * - Funk
 * - Disco
 * - Techno
 * - Trance
 * - Gospel
 * - Christmas
 * - Children's Music
 * - Comedy
 */

/**
 * Data Structure Benefits:
 * 
 * 1. **Easy Iteration**: Array format works seamlessly with .map() for UI rendering
 * 2. **Quick Lookup**: Can easily find genres by value or title
 * 3. **Type Safety**: Full TypeScript support with interface definition
 * 4. **Extensible**: Easy to add new properties (color, icon, description)
 * 
 * @example
 * // Enhanced genre structure with additional properties
 * interface EnhancedGenre extends Genre {
 *   color: string;    // Theme color for genre
 *   icon: string;     // Icon identifier
 *   description: string; // Genre description
 * }
 */