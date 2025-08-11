<template>
  <div class="lyrics-poster">
    <div class="two-column-layout">
      <!-- Left Column - Poster Preview -->
      <div class="poster-preview">
        <div class="poster-container">
          <!-- Song Info Header -->
          <div v-if="songData" class="poster-header">
            <div class="poster-header">
              <h2 class="poster-title">{{ songData.trackName }}</h2>
              <div class="artist-row">
                <div class="artist-divider"></div>
                <div class="poster-artist">{{ songData.artistName }}</div>
              </div>
            </div>
          </div>

          <!-- Spiral Lyrics Display -->
          <div class="spiral-display">
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading lyrics...</p>
            </div>

            <div v-else-if="spiralLetters.length" class="spiral-container">
              <svg :width="svgSize" :height="svgSize" :viewBox="`0 0 ${svgSize} ${svgSize}`">
                <!-- Center circle -->
                <circle
                    :cx="svgSize/2"
                    :cy="svgSize/2"
                    :r="circleRadius"
                    fill="none"
                    stroke="black"
                    stroke-width="2"
                />
                <g>
                  <text v-for="(char, i) in spiralLetters" :key="i"
                        :x="char.x" :y="char.y"
                        :transform="`rotate(${char.angle} ${char.x} ${char.y})`"
                        text-anchor="middle"
                        alignment-baseline="middle"
                        class="circle-lyrics-letter"
                        :style="`font-family: 'Inter', system-ui, sans-serif; letter-spacing: ${char.letterSpacing}em; font-weight: bold; font-size: ${char.fontSize}px;`">
                    {{ char.char }}
                  </text>
                </g>
              </svg>
            </div>

            <div v-else class="empty-state">
              <p>Search for a song to create your poster</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Search and Controls -->
      <div class="search-controls">
        <div class="search-section">
          <h2>Find Your Song</h2>
          <p class="search-description">Type a song title to search from millions of tracks</p>

          <div class="search-input-container">
            <input
                v-model="searchQuery"
                @input="handleInput"
                @focus="showSuggestions = true"
                @blur="handleBlur"
                type="text"
                placeholder="Type a song title..."
                class="search-input"
            />

            <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
              <div
                  v-for="song in suggestions"
                  :key="`${song.artistName}-${song.trackName}-${song.id}`"
                  @mousedown="selectSong(song)"
                  class="suggestion-item"
              >
                <div class="song-info">
                  <div class="track-name">{{ song.trackName }}</div>
                  <div class="artist-name">{{ song.artistName }}</div>
                  <div class="album-name" v-if="song.albumName">{{ song.albumName }}</div>
                </div>
              </div>
            </div>

            <div v-if="searchLoading" class="search-loading">
              Searching...
            </div>
          </div>

          <!-- Selected Song Info -->
          <div v-if="songData && !loading" class="selected-song">
            <h3>Current Selection</h3>
            <div class="selected-song-info">
              <p class="selected-track">{{ songData.trackName }}</p>
              <p class="selected-artist">{{ songData.artistName }}</p>
              <p v-if="songData.albumName" class="selected-album">{{ songData.albumName }}</p>
            </div>
          </div>

          <!-- Print Button -->
          <button v-if="spiralLetters.length" @click="printPoster" class="print-button">
            🖨️ Print Poster
          </button>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            <p>{{ error }}</p>
            <button v-if="songData" @click="fetchLyrics" class="retry-button">Try Again</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'LyricsPoster',
  data() {
    return {
      // Search related
      searchQuery: '',
      suggestions: [],
      showSuggestions: false,
      searchLoading: false,
      searchTimeout: null,

      // Song and lyrics related
      songData: null,
      lyrics: '',
      loading: false,
      error: null
    }
  },
  computed: {
    svgSize() {
      return 650
    },
    circleRadius() {
      // Center circle radius
      return 60
    },
    spiralLetters() {
      if(!this.lyrics) return []

      const letters = []
      const centerX = this.svgSize / 2
      const centerY = this.svgSize / 2
      const startRadius = 120
      const totalRotations = 9

      // Font size logic
      const fontSize = Math.max(12, Math.min(32, 600 / this.lyrics.length))
      const charSpacingPx = fontSize * 1.1

      // Constant gap between each rotation
      const rotationGap = 22 // px

      // Total angle for spiral
      const totalAngle = Math.PI * 2 * totalRotations

      // Calculate angular step per character
      const angleStep = totalAngle / this.lyrics.length

      for(let i = 0; i < this.lyrics.length; i++) {
        const angle = i * angleStep
        // Each full rotation increases radius by rotationGap
        const currentRadius = startRadius + (rotationGap * angle / (Math.PI * 2))

        const x = centerX + currentRadius * Math.cos(angle)
        const y = centerY + currentRadius * Math.sin(angle)

        letters.push({
          char: this.lyrics[i],
          x: x,
          y: y,
          angle: (angle * 180 / Math.PI) + 90,
          fontSize: fontSize,
          letterSpacing: 0
        })
      }

      return letters
    }
  },
  methods: {
    handleInput() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        if(this.searchQuery.trim()) {
          this.searchSongs()
        } else {
          this.suggestions = []
        }
      }, 300)
    },

    async searchSongs() {
      if(!this.searchQuery.trim()) return

      this.searchLoading = true
      this.error = null

      try {
        // Call our proxy server which uses lrclib.net API
        const response = await axios.get('http://localhost:3001/api/search', {
          params: {
            q: this.searchQuery
          }
        })

        // The proxy server already transforms the data to our expected format
        this.suggestions = response.data
      } catch(error) {
        console.error('Search error:', error)
        this.error = 'Failed to search songs. Please try again.'
      } finally {
        this.searchLoading = false
      }
    },

    selectSong(song) {
      this.songData = song
      this.searchQuery = `${song.trackName} - ${song.artistName}`
      this.showSuggestions = false
      this.suggestions = []
      this.fetchLyrics()
    },

    async fetchLyrics() {
      if(!this.songData) return

      this.loading = true
      this.error = null
      this.lyrics = ''

      try {
        // Call our proxy server which fetches from lrclib.net API
        const response = await axios.get('http://localhost:3001/api/lyrics', {
          params: {
            artist: this.songData.artistName,
            track: this.songData.trackName,
            album: this.songData.albumName || undefined,
            duration: this.songData.duration || undefined
          }
        })

        if(response.data) {
          // Check if the song is instrumental
          if(response.data.instrumental) {
            this.lyrics = `${this.songData.trackName} by ${this.songData.artistName} - This is an instrumental track with no lyrics. Enjoy the beautiful spiral design that represents the musical journey of this instrumental piece.`
            this.error = 'This is an instrumental track.'
          } else if(response.data.plainLyrics || response.data.lyrics) {
            // Use plain lyrics if available, otherwise use synced lyrics
            const lyricsText = response.data.plainLyrics || response.data.lyrics || response.data.syncedLyrics

            // Clean and format the lyrics for spiral display
            const cleanedLyrics = lyricsText
            .replace(/\[.*?\]/g, '') // Remove timestamp tags from synced lyrics
            .replace(/\n+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()

            this.lyrics = cleanedLyrics
          } else {
            throw new Error('No lyrics found')
          }
        } else {
          throw new Error('No lyrics found')
        }
      } catch(error) {
        console.error('Error fetching lyrics:', error)

        // If API fails, use placeholder lyrics
        this.lyrics = `${this.songData.trackName} by ${this.songData.artistName} - These are placeholder lyrics for your beautiful spiral poster. The actual lyrics could not be loaded but you can still see how your poster would look. This spiral design creates a unique vinyl-inspired artwork that captures the essence of your favorite songs in a visually stunning way.`

        if(error.response && error.response.status === 404) {
          this.error = 'Lyrics not found for this song. Showing placeholder text.'
        } else {
          this.error = 'Could not load actual lyrics. Showing placeholder text.'
        }
      } finally {
        this.loading = false
      }
    },

    formatSyncedLyrics(syncedLyrics) {
      // Remove timestamps and clean up lyrics
      return syncedLyrics.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').replace(/\n+/g, ' ').trim()
    },

    handleBlur() {
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    },

    printPoster() {
      const printWindow = window.open('', '_blank')
      const posterHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${this.songData.trackName} - ${this.songData.artistName}</title>
          <style>
            :host, .lyrics-poster, .lyrics-poster * {
              font-family: 'Inter', system-ui, sans-serif !important;
              text-transform: uppercase !important;
            }
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
            }
            .poster {
              text-align: center;
            }
            .poster-title {
              font-family: 'Inter', system-ui, sans-serif;
              font-size: 24px;
              font-weight: 700;
              margin: 10px 0;
              text-align: left;
            }
            .poster-artist {
              font-family: 'Inter', system-ui, sans-serif;
              font-size: 18px;
              font-weight: 400;
              margin: 5px 0 20px;
            }
            svg {
              max-width: 100%;
              height: auto;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="poster">
            <h1 class="poster-title">${this.songData.trackName}</h1>
            <h2 class="poster-artist">${this.songData.artistName}</h2>
            ${this.$el.querySelector('.spiral-container').innerHTML}
          </div>
        </body>
        </html>
      `

      printWindow.document.write(posterHTML)
      printWindow.document.close()
      printWindow.focus()

      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }
}
</script>

<style scoped>
.lyrics-poster {
  min-height: calc(100vh - 70px);
  padding: 20px;
  background: #f8f9fa;
}

.two-column-layout {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

/* Left Column - Poster Preview */
.poster-preview {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.poster-preview, .poster-preview * {
  font-family: 'Inter', system-ui, sans-serif !important;
  text-transform: uppercase !important;
}

.poster-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.poster-header {
  text-align: center;
  margin-bottom: 30px;
  width: 100%;
}

.poster-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 10px;
}

.poster-header {
  text-align: left;
  margin-bottom: 30px;
  width: 100%;
}

.artist-row {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 16px;
}

.artist-divider {
  width: 70%;
  height: 0;
  border-bottom: 4px solid #000;
  margin-right: 16px;
}

.poster-artist {
  width: 30%;
  font-size: 1.3rem;
  font-weight: 400;
  color: #666;
  margin: 0;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spiral-display {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
}

.spiral-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.circle-lyrics-letter {
  fill: black;
}

.loading-state,
.empty-state {
  text-align: center;
  color: #999;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #764ba2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Right Column - Search and Controls */
.search-controls {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.search-section h2 {
  font-size: 2rem;
  color: #333;
  margin: 0 0 10px;
}

.search-description {
  color: #666;
  margin: 0 0 30px;
}

.search-input-container {
  position: relative;
  margin-bottom: 30px;
}

.search-input {
  width: 100%;
  padding: 15px 20px;
  font-size: 1.1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #764ba2;
  box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.1);
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-top: 5px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 15px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: #f8f9fa;
}

.track-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.artist-name {
  color: #666;
  font-size: 0.9rem;
}

.album-name {
  color: #999;
  font-size: 0.85rem;
  margin-top: 2px;
}

.search-loading {
  padding: 10px;
  text-align: center;
  color: #666;
}

.selected-song {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.selected-song h3 {
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 10px;
}

.selected-song-info {
  color: #333;
}

.selected-track {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 5px;
}

.selected-artist {
  font-size: 1rem;
  color: #666;
  margin: 0 0 5px;
}

.selected-album {
  font-size: 0.9rem;
  color: #999;
  margin: 0;
}

.print-button {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
}

.print-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(118, 75, 162, 0.4);
}

.error-message {
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 12px;
  padding: 15px;
  margin-top: 20px;
}

.error-message p {
  color: #c53030;
  margin: 0 0 10px;
}

.retry-button {
  padding: 8px 16px;
  background: #c53030;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.retry-button:hover {
  background: #9b2c2c;
}

/* Responsive */
@media (max-width: 1024px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }

  .poster-preview {
    order: 2;
  }

  .search-controls {
    order: 1;
  }
}

@media (max-width: 600px) {
  .lyrics-poster {
    padding: 10px;
  }

  .poster-preview,
  .search-controls {
    padding: 20px;
  }

  .poster-title {
    font-size: 1.5rem;
  }

  .poster-artist {
    font-size: 1.1rem;
  }
}
</style>
