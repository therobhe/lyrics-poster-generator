<template>
  <div class="lyrics-page">
    <!-- Header with back button -->
    <div class="header">
      <button @click="goBack" class="back-button">
        ← Back to Search
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading lyrics...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h2>Oops! Something went wrong</h2>
        <p>{{ error }}</p>
        <button @click="fetchLyrics" class="retry-button">Try Again</button>
      </div>
    </div>

    <!-- Lyrics content -->
    <div v-else-if="songData" class="lyrics-container">
      <!-- Song info header -->
      <div class="song-header">
        <h1 class="song-title">{{ songData.trackName }}</h1>
        <h2 class="artist-name">{{ songData.artistName }}</h2>
        <p v-if="songData.albumName" class="album-name">{{ songData.albumName }}</p>
      </div>

      <!-- Lyrics display as circle -->
      <div class="lyrics-content circle-lyrics-content">
        <svg :width="svgSize" :height="svgSize" viewBox="0 0 400 400">
          <g v-if="spiralLetters.length">
            <text v-for="(char, i) in spiralLetters" :key="i"
                  :x="char.x" :y="char.y"
                  :transform="`rotate(${char.angle} ${char.x} ${char.y})`"
                  text-anchor="middle"
                  alignment-baseline="middle"
                  class="circle-lyrics-letter"
                  style="font-family: 'Inter', system-ui, sans-serif;">
              {{ char.char }}
            </text>
          </g>
        </svg>
        <div v-if="!spiralLetters.length" class="no-lyrics">
          <p>No lyrics available for this song.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'LyricsPage',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      songData: null,
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.fetchLyrics()
  },
  computed: {
    svgSize() {
      return 400;
    },
    circleRadius() {
      return 160; // radius for text path
    },
    spiralLetters() {
      // Use only plainLyrics for this effect, in uppercase
      if (!this.songData || !this.songData.plainLyrics) return [];
      const text = this.songData.plainLyrics.replace(/\n/g, ' ').toUpperCase();
      const chars = [...text];
      if (chars.length === 0) return [];
      const cx = 200, cy = 200;
      const startRadius = 60; // spiral starting radius
      const spiralTurns = 6; // how many full turns the spiral makes
      const totalAngle = spiralTurns * 2 * Math.PI;
      const angleStep = totalAngle / chars.length;
      const radiusStep = (140) / chars.length; // spiral outward
      return chars.map((char, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = startRadius + i * radiusStep;
        // Tangent angle for upright text: +90deg from path
        const tangent = angle + Math.PI / 2;
        return {
          char,
          angle: tangent * 180 / Math.PI,
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle)
        };
      });
    }
  },
  methods: {
    async fetchLyrics() {
      this.loading = true
      this.error = null
      
      try {
        // First try to get lyrics by ID
        const response = await axios.get(`https://lrclib.net/api/get/${this.id}`)
        this.songData = response.data
        
        // If no lyrics found by ID, try to get from query params
        if (!this.songData.plainLyrics && !this.songData.syncedLyrics) {
          const { trackName, artistName } = this.$route.query
          if (trackName && artistName) {
            const searchResponse = await axios.get('https://lrclib.net/api/get', {
              params: {
                artist_name: artistName,
                track_name: trackName
              }
            })
            this.songData = { ...this.songData, ...searchResponse.data }
          }
        }
        
        // Fallback to query params for song info if not in API response
        if (!this.songData.trackName) {
          this.songData = {
            ...this.songData,
            trackName: this.$route.query.trackName || 'Unknown Title',
            artistName: this.$route.query.artistName || 'Unknown Artist',
            albumName: this.$route.query.albumName || ''
          }
        }
        
      } catch (err) {
        console.error('Error fetching lyrics:', err)
        this.error = 'Failed to load lyrics. Please try again.'
        
        // Use query params as fallback
        this.songData = {
          trackName: this.$route.query.trackName || 'Unknown Title',
          artistName: this.$route.query.artistName || 'Unknown Artist',
          albumName: this.$route.query.albumName || '',
          plainLyrics: null,
          syncedLyrics: null
        }
      } finally {
        this.loading = false
      }
    },
    
    formatSyncedLyrics(syncedLyrics) {
      // Remove timestamp markers from synced lyrics
      return syncedLyrics.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim()
    },
    
    goBack() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.lyrics-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.error-message {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.error-message h2 {
  color: #e74c3c;
  margin-bottom: 15px;
  font-size: 1.8rem;
}

.error-message p {
  color: #666;
  margin-bottom: 25px;
  font-size: 1.1rem;
}

.retry-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: transform 0.2s ease;
}

.retry-button:hover {
  transform: translateY(-2px);
}

.lyrics-container {
  max-width: 800px;
  margin: 0 auto;
}

.song-header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.song-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.artist-name {
  font-size: 1.8rem;
  font-weight: 500;
  color: #667eea;
  margin-bottom: 8px;
}

.album-name {
  font-size: 1.2rem;
  color: #999;
  font-style: italic;
  margin: 0;
}

.lyrics-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
}

.lyrics-text {
  line-height: 1.8;
  font-size: 1.1rem;
  color: #333;
}

.lyrics-text pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  font-size: inherit;
  line-height: inherit;
}

.no-lyrics {
  text-align: center;
  color: #999;
  font-size: 1.2rem;
  padding: 40px 20px;
}

/* Responsive design */
@media (max-width: 768px) {
  .lyrics-page {
    padding: 15px;
  }
  
  .song-header {
    padding: 25px 20px;
    margin-bottom: 20px;
  }
  
  .song-title {
    font-size: 2rem;
  }
  
  .artist-name {
    font-size: 1.5rem;
  }
  
  .album-name {
    font-size: 1.1rem;
  }
  
  .lyrics-content {
    padding: 25px 20px;
  }
  
  .lyrics-text {
    font-size: 1rem;
    line-height: 1.6;
  }
}

@media (max-width: 480px) {
  .lyrics-page {
    padding: 10px;
  }
  
  .song-header {
    padding: 20px 15px;
  }
  
  .song-title {
    font-size: 1.8rem;
  }
  
  .artist-name {
    font-size: 1.3rem;
  }
  
  .lyrics-content {
    padding: 20px 15px;
  }
  
  .back-button {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}
</style>
