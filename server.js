import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy server is running' });
});

// Search songs endpoint using lrclib.net
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Search using lrclib.net API
    const response = await axios.get('https://lrclib.net/api/search', {
      params: {
        q: q
      }
    });

    // Transform the response to match our frontend expectations
    const songs = response.data.slice(0, 10).map(song => ({
      id: song.id,
      trackName: song.trackName || song.name,
      artistName: song.artistName || song.artist,
      albumName: song.albumName || song.album,
      duration: song.duration
    }));

    res.json(songs);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ 
      error: 'Failed to search songs',
      details: error.message 
    });
  }
});

// Fetch lyrics endpoint
app.get('/api/lyrics', async (req, res) => {
  try {
    const { artist, track, album, duration } = req.query;
    
    if (!artist || !track) {
      return res.status(400).json({ error: 'Artist and track name are required' });
    }

    // Build the query parameters for lrclib.net
    const params = {
      artist_name: artist,
      track_name: track
    };

    if (album) {
      params.album_name = album;
    }

    if (duration) {
      params.duration = duration;
    }

    // Fetch lyrics from lrclib.net
    const response = await axios.get('https://lrclib.net/api/get', {
      params
    });

    if (response.data) {
      // Return the lyrics data
      res.json({
        lyrics: response.data.plainLyrics || response.data.syncedLyrics || '',
        syncedLyrics: response.data.syncedLyrics || '',
        plainLyrics: response.data.plainLyrics || '',
        instrumental: response.data.instrumental || false
      });
    } else {
      res.status(404).json({ error: 'No lyrics found' });
    }
  } catch (error) {
    console.error('Lyrics fetch error:', error.message);
    
    // If it's a 404, return a more specific message
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'No lyrics found for this song' });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch lyrics',
        details: error.message 
      });
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - GET /api/health - Health check`);
  console.log(`  - GET /api/search?q={query} - Search songs`);
  console.log(`  - GET /api/lyrics?artist={artist}&track={track} - Fetch lyrics`);
});
