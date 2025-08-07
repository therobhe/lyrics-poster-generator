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
        <div class="spiral-container">
          <svg :width="svgSize" :height="svgSize" :viewBox="`-50 -50 ${svgSize + 100} ${svgSize + 100}`">
            <g v-if="spiralLetters.length">
              <text v-for="(char, i) in spiralLetters" :key="i"
                    :x="char.x" :y="char.y"
                    :transform="`rotate(${char.angle} ${char.x} ${char.y})`"
                    text-anchor="middle"
                    alignment-baseline="middle"
                    class="circle-lyrics-letter"
                    :style="`font-family: 'Inter', system-ui, sans-serif; letter-spacing: ${char.letterSpacing}em; font-weight: bold;`">
                {{ char.char }}
              </text>
            </g>
          </svg>
        </div>
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
      // Increase SVG size to fit more text
      return Math.min(Math.max(window.innerWidth * 0.8, 600), 1000);
    },
    circleRadius() {
      return this.svgSize / 2 - 60;
    },
    spiralLetters() {
      if (!this.songData || !this.songData.plainLyrics) return [];
      const text = this.songData.plainLyrics.replace(/\n/g, ' ').toUpperCase();
      const chars = [...text];
      if (chars.length === 0) return [];

      const cx = this.svgSize / 2, cy = this.svgSize / 2;

      // Calculate parameters based on text length for optimal display
      const contentLength = chars.length;
      const safetyMargin = 30; // Reduced safety margin
      const maxRadius = (this.svgSize / 2) - safetyMargin;

      // Adjust starting radius and growth parameters
      const startRadius = this.svgSize * 0.12; // Reduced center void

      // Calculate spiral parameters to fit all text
      // Increase growth to accommodate longer texts
      const totalAngle = Math.min(contentLength * 8, 2000) / 180 * Math.PI;
      const spiralGrowth = (maxRadius - startRadius) / totalAngle;

      // Use variable spacing that adjusts based on text length
      const baseSpacing = contentLength > 1000 ? 1.5 : (contentLength > 500 ? 2 : 2.5);
      const spacing = Math.max(1.5, Math.min(baseSpacing, 600 / contentLength));

      let result = [];
      let lastChar = null;
      let actualCharCount = 0; // Track how many characters we've actually placed

      for (let i = 0; i < chars.length; i++) {
        // Calculate angle based on index and spacing
        const angle = (actualCharCount * spacing) / 180 * Math.PI;

        // Create growing spiral using angle
        const r = startRadius + (angle * spiralGrowth);

        // Skip if radius exceeds maximum safe radius
        if (r > maxRadius * 1.2) break; // Allow slightly exceeding max radius

        // Calculate position
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        // Calculate rotation for upright text
        const rotation = (angle * 180 / Math.PI) + 90;

        // Skip consecutive spaces to prevent crowding
        if ((chars[i] === ' ' && lastChar === ' ') ||
            (chars[i] === ' ' && i < 10)) {
          continue;
        }

        lastChar = chars[i];
        actualCharCount++; // Only increment for characters we actually place

        // Calculate dynamic letter spacing based on position in spiral
        // More spacing near the center, less as we move outward
        const progress = r / maxRadius; // 0 to 1
        const letterSpacing = 2.5 - (1.8 * progress); // Range from 2.5em (center) to 0.7em (outer)

        result.push({
          char: chars[i],
          angle: rotation,
          x,
          y,
          letterSpacing: letterSpacing.toFixed(1) // Format to 1 decimal place
        });
      }

      return result;
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
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  overflow: visible;
  min-height: 650px; /* Ensure enough height for the spiral */
  margin: 0 auto 30px;
  max-width: 95vw;
}

.spiral-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  overflow: visible;
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
}

.spiral-container svg {
  max-width: 100%;
  height: auto;
  overflow: visible;
  display: block;
  margin: 0 auto;
}

.circle-lyrics-letter {
  font-size: 10px;
  fill: #667eea;
  transition: fill 0.3s ease;
}

/* Make inner text slightly larger for better readability */
.circle-lyrics-letter:nth-child(-n+30) {
  font-size: 12px;
  font-weight: 700;
}

/* Special styling for the very first characters to improve visibility in the center */
.circle-lyrics-letter:nth-child(-n+10) {
  font-size: 14px;
  font-weight: 900;
  fill: #5046b5;
}

.circle-lyrics-letter:hover {
  fill: #764ba2;
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
    min-height: 550px;
    padding: 15px;
  }

  .circle-lyrics-letter {
    font-size: 8px;
  }

  .circle-lyrics-letter:nth-child(-n+30) {
    font-size: 10px;
  }
  
  .circle-lyrics-letter:nth-child(-n+10) {
    font-size: 12px;
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
    min-height: 450px;
    padding: 10px;
  }

  .circle-lyrics-letter {
    font-size: 6px;
  }

  .circle-lyrics-letter:nth-child(-n+30) {
    font-size: 8px;
  }

  .circle-lyrics-letter:nth-child(-n+10) {
    font-size: 10px;
  }
  
  .back-button {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}
</style>
