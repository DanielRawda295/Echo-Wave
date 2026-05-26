import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TrackUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [tracks, setTracks] = useState<any[]>([]);

  const handleUpload = async () => {
    if (!file || !title) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('artist', artist);

    /*const res = await axios.post('/tracks/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    */

    setTitle('');
    setArtist('');
    setFile(null);
    fetchTracks(); // refresh list
  };

  const fetchTracks = async () => {
    const res = await axios.get('/tracks');
    setTracks(res.data);
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Upload Track</h2>
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input type="text" placeholder="Artist" value={artist} onChange={e => setArtist(e.target.value)} />
      <input type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} disabled={!file || !title}>Upload</button>

      <h3 style={{ marginTop: '2rem' }}>Uploaded Tracks</h3>
      {tracks.map(track => (
        <div key={track.id} style={{ marginBottom: '1rem' }}>
          <strong>{track.title}</strong> by {track.artist}
          <audio controls src={track.fileUrl} style={{ display: 'block', marginTop: '0.5rem' }} />
        </div>
      ))}
    </div>
  );
}