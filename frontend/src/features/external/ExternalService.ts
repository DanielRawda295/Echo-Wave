import axios from 'axios';

export async function searchExternalTracks(query: string) {
  const response = await axios.get(`/api/external/search?q=${encodeURIComponent(query)}`, {
    withCredentials: true,
  });
  return response.data;
}