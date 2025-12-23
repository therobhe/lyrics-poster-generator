<template>
  <div class="lyrics-poster">
    <div class="two-column-layout">
      <!-- Left Column - Poster Preview -->
      <div class="preview-column">
        <div class="poster-preview" :style="previewStyle">
          <div class="poster-container" :style="{ color: currentTemplate.color }">
            <!-- Song Info Header -->
            <div v-if="songData" class="poster-header">
              <div>
                <h2 class="poster-title" :style="{ color: currentTemplate.color, fontFamily: currentTemplate.fontFamily }">{{ songData.trackName }}</h2>
                <div class="artist-row">
                  <div class="artist-divider" :style="{ borderColor: currentTemplate.color }"></div>
                  <div class="poster-artist" :style="{ color: currentTemplate.color, fontFamily: currentTemplate.fontFamily }">{{ songData.artistName }}</div>
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
                <svg :viewBox="`0 0 ${svgSize} ${svgSize}`" class="spiral-svg">
                  <circle :cx="svgSize/2" :cy="svgSize/2" :r="circleRadius" fill="none" :stroke="currentTemplate.color" stroke-width="2"/>
                  <g class="spiral-group">
                    <text v-for="(char, index) in spiralLetters"
                      :key="index"
                      :fill="currentTemplate.color"
                      :style="{
                        fontSize: char.fontSize + 'px',
                        fontFamily: currentTemplate.fontFamily,
                        fontWeight: 'bold'
                      }"
                      :x="char.x"
                      :y="char.y"
                      :transform="`rotate(${char.angle} ${char.x} ${char.y})`"
                      text-anchor="middle"
                      alignment-baseline="middle"
                    >{{ char.char }}</text>
                  </g>
                </svg>
              </div>

              <div v-else class="empty-state">
                <p>Search for a song to create your poster</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mockups Slider -->
        <div v-if="songData && !loading" class="mockup-section">
          <h3>Visualize in Room</h3>
          <div class="mockup-slider">
            <div v-for="mockup in mockups" :key="mockup.id" class="mockup-card">
              <img :src="mockup.image" class="mockup-bg" />
              <div class="mockup-overlay" :style="mockup.style">
                <div class="mockup-poster-content" :style="{ background: currentTemplate.background, color: currentTemplate.color }">
                  <h2 class="mockup-title" :style="{ color: currentTemplate.color, fontFamily: currentTemplate.fontFamily }">{{ songData.trackName }}</h2>
                   <div class="mockup-artist-row">
                      <div class="mockup-artist-divider" :style="{ borderColor: currentTemplate.color }"></div>
                      <div class="mockup-artist" :style="{ color: currentTemplate.color, fontFamily: currentTemplate.fontFamily }">{{ songData.artistName }}</div>
                   </div>
                   <svg viewBox="0 0 650 650" class="mockup-svg">
                    <circle cx="325" cy="325" r="60" fill="none" :stroke="currentTemplate.color" stroke-width="2"/>
                    <g>
                      <text v-for="(char, index) in spiralLetters" :key="index" :fill="currentTemplate.color" :style="{ fontSize: char.fontSize + 'px', fontFamily: currentTemplate.fontFamily, fontWeight: 'bold' }" :x="char.x" :y="char.y" :transform="`rotate(${char.angle} ${char.x} ${char.y})`" text-anchor="middle" alignment-baseline="middle">{{ char.char }}</text>
                    </g>
                   </svg>
                </div>
              </div>
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

          <!-- Style Template Selection -->
          <div v-if="songData && !loading" class="style-selection">
            <h3>Choose a Style</h3>
            <div class="templates-grid">
              <div 
                v-for="(template, index) in templates" 
                :key="index"
                class="template-card"
                :class="{ active: selectedTemplateIndex === index }"
                :style="{ background: template.background, color: template.color, fontFamily: template.fontFamily }"
                @click="selectedTemplateIndex = index"
              >
                <div class="template-preview-content">
                  <span class="template-aa">Aa</span>
                  <span class="template-name">{{ template.name }}</span>
                </div>
              </div>
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
import mockupWall from '../assets/mockups/mockup_wall.png'
import mockupTable from '../assets/mockups/mockup_table.png'
import mockupAngle from '../assets/mockups/mockup_angle.png'
import mockupDesk from '../assets/mockups/mockup_desk.png'

export default {
  name: 'LyricsPoster',
  data() {
    return {
      // Mockups
      mockups: [
        { 
          id: 'wall', 
          name: 'Wall', 
          image: mockupWall, 
          style: { top: '26%', left: '32.5%', width: '35%', height: '47%', transform: 'scale(0.98)' } // Centered
        },
        { 
          id: 'table', 
          name: 'Table', 
          image: mockupTable, 
          style: { top: '23%', left: '32%', width: '35%', height: '47%', transform: 'perspective(800px) rotateX(-4deg) rotateY(3deg)' } // Leaning back slightly
        },
        { 
          id: 'angle', 
          name: 'Glass Frame', 
          image: mockupAngle, 
          style: { top: '15%', left: '38%', width: '33%', height: '44%', transform: 'perspective(1200px) skewY(12deg) rotateY(-25deg)' } // Strong angle
        },
        { 
          id: 'desk', 
          name: 'Workspace', 
          image: mockupDesk, 
          style: { top: '12%', left: '32%', width: '34.5%', height: '46%', transform: 'perspective(800px) rotateX(-3deg) rotateY(2deg)' } 
        }
      ],
      // Search related
      searchQuery: '',
      suggestions: [],
      showSuggestions: false,
      searchLoading: false,
      searchTimeout: null,
      abortController: null,

      songData: null,
      lyrics: '',
      loading: false,
      error: null,

      // Styling Templates
      selectedTemplateIndex: 0,
      templates: [
        {
          name: 'Classic',
          background: '#ffffff',
          color: '#000000',
          fontFamily: "'Inter', sans-serif"
        },
        {
          name: 'Mono',
          background: '#f0f0f0',
          color: '#333333',
          fontFamily: "'Courier New', monospace"
        },
        {
          name: 'Elegant',
          background: '#F9F5F0',
          color: '#3E2723',
          fontFamily: "'Times New Roman', serif"
        },
        {
          name: 'Dark',
          background: '#1a1a1a',
          color: '#ffffff',
          fontFamily: "'Inter', sans-serif"
        }
      ]
    }
  },
  computed: {
    svgSize() {
      return 650
    },
    currentTemplate() {
      return this.templates[this.selectedTemplateIndex]
    },
    previewStyle() {
      return {
        background: this.currentTemplate.background,
        color: this.currentTemplate.color
      }
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
      
      const len = this.lyrics.length
      
      // Fine-tuned start radius
      let startRadius = 85
      if(len > 2200 && len <= 4500) {
        startRadius = 75 // Intermediate reduction
      } else if(len > 4500) {
        startRadius = 95 // Maximum reduction for ultra-long
      }
      
      // Basic font size logic
      let fontSize

      // Heuristic adjustment for font size based on length
      if (len < 300) {
        fontSize = 28
      } else if (len < 600) {
        // Interpolate between 28 and 18
        fontSize = 28 - ((len - 300) / 300) * (28 - 18)
      } else if (len < 1500) {
        // Interpolate between 18 and 12
        fontSize = 18 - ((len - 600) / 900) * (18 - 12)
      } else {
        // Slowly decrease from 12 down to 8
        fontSize = Math.max(8, 12 - ((len - 1500) / 3000) * 4)
      }

      // Allow even smaller for ultra long lyrics to prevent cut off
      if (len > 4500) fontSize = 6
      
      // Slightly larger minimum for the "Jesus of Suburbia" range
      if (len > 2200 && len <= 4500) fontSize = Math.max(9, fontSize)

      // Allow even larger if very short
      if(len < 100) fontSize = 34

      // Increase spacing between rows (pitch)
      // Even more breathing room requested:
      let pitchMultiplier = 1.9 // Base increased from 1.6
      if (len < 600) pitchMultiplier = 2.4 // Significantly increased for short lyrics
      
      // Fine-tuned scaling for Long vs Ultra-Long
      if (len > 2200 && len <= 4500) {
        // "Jesus of Suburbia" range (Long)
        pitchMultiplier = 1.55 
      } else if (len > 4500) {
        // "Königsaura" range (Ultra-Long)
        pitchMultiplier = 1.35
      }
      
      const rotationGap = fontSize * pitchMultiplier

      let currentAngle = 0
      let currentRadius = startRadius
      
      // Char width factor
      const charWidthFactor = 0.6 

      for(let i = 0; i < len; i++) {
        const char = this.lyrics[i]
        
        const charWidth = fontSize * charWidthFactor
        
        // dTheta = arcLength / radius
        const angleStep = charWidth / currentRadius
        
        const x = centerX + currentRadius * Math.cos(currentAngle)
        const y = centerY + currentRadius * Math.sin(currentAngle)

        letters.push({
          char: char,
          x: x,
          y: y,
          angle: (currentAngle * 180 / Math.PI) + 90,
          fontSize: fontSize,
          letterSpacing: 0
        })
        
        currentAngle += angleStep
        
        currentRadius += (rotationGap / (2 * Math.PI)) * angleStep
      }

      return letters
    },
    printSpiralLetters() {
      if(!this.lyrics) return []

      const letters = []
      const centerX = this.svgSize / 2
      const centerY = this.svgSize / 2
      
      const len = this.lyrics.length
      
      // Fine-tuned start radius for print
      let startRadius = 90
      if(len > 2200 && len <= 4500) {
        startRadius = 80 // Intermediate
      } else if(len > 4500) {
        startRadius = 70 // Ultra-long
      }
      
      let fontSize
      
      if (len < 300) {
        fontSize = 28
      } else if (len < 600) {
        fontSize = 28 - ((len - 300) / 300) * (28 - 18)
      } else if (len < 1500) {
        fontSize = 18 - ((len - 600) / 900) * (18 - 12)
      } else {
        fontSize = Math.max(8, 12 - ((len - 1500) / 3000) * 4)
      }
      
      // Allow even smaller for ultra long lyrics to prevent cut off
      if (len > 4500) fontSize = 7
      
      // Slightly larger minimum for the "Jesus of Suburbia" range
      if (len > 2200 && len <= 4500) fontSize = Math.max(9, fontSize)
      
      if(len < 100) fontSize = 34

      let pitchMultiplier = 1.9
      if (len < 600) pitchMultiplier = 2.4
      
      // Fine-tuned scaling for Long vs Ultra-Long
      if (len > 2200 && len <= 4500) {
        pitchMultiplier = 1.55
      } else if (len > 4500) {
        pitchMultiplier = 1.35
      }

      const rotationGap = fontSize * pitchMultiplier

      let currentAngle = 0
      let currentRadius = startRadius
      const charWidthFactor = 0.6 

      for(let i = 0; i < len; i++) {
        const char = this.lyrics[i]
        const charWidth = fontSize * charWidthFactor
        const angleStep = charWidth / currentRadius
        
        const x = centerX + currentRadius * Math.cos(currentAngle)
        const y = centerY + currentRadius * Math.sin(currentAngle)

        letters.push({
          char: char,
          x: x,
          y: y,
          angle: (currentAngle * 180 / Math.PI) + 90,
          fontSize: fontSize,
          letterSpacing: 0
        })
        
        currentAngle += angleStep
        currentRadius += (rotationGap / (2 * Math.PI)) * angleStep
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
      }, 700) // Increased debounce time
    },

    async searchSongs() {
      if(!this.searchQuery.trim()) return

      this.searchLoading = true
      this.error = null

      // Cancel previous request if exists
      if (this.abortController) {
        this.abortController.abort()
      }
      this.abortController = new AbortController()

      try {
        // Call our proxy server which uses lrclib.net API
        const response = await axios.get('https://lyrics-poster-generator-be.onrender.com/api/search', {
          params: {
            q: this.searchQuery
          },
          signal: this.abortController.signal
        })

        // The proxy server already transforms the data to our expected format
        this.suggestions = response.data
      } catch(error) {
        if (axios.isCancel(error) || error.name === 'AbortError') {
          // Request cancelled, ignore
          return
        }
        console.error('Search error:', error)
        this.error = 'Failed to search songs. Please try again.'
      } finally {
        this.searchLoading = false
        this.abortController = null
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
        const response = await axios.get('https://lyrics-poster-generator-be.onrender.com/api/lyrics', {
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
            .replace(/\[.*?/g, '') // Remove timestamp tags from synced lyrics
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
      return syncedLyrics.replace(/\[\d{2}:\d{2}\.\d{2}/g, '').replace(/\n+/g, ' ').trim()
    },

    handleBlur() {
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    },

    printPoster() {
      const printWindow = window.open('', '_blank')
      // Generate SVG for print using printSpiralLetters
      const svgSize = this.svgSize
      const circleRadius = this.circleRadius
      const spiralLetters = this.printSpiralLetters
      const posterHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>${this.songData.trackName} - ${this.songData.artistName}</title>
          <style>
            :host, .lyrics-poster * {
              font-family: ${this.currentTemplate.fontFamily} !important;
              text-transform: uppercase !important;
            }
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: ${this.currentTemplate.background};
              color: ${this.currentTemplate.color};
            }
            .poster {
              text-align: center;
            }
            .poster-title {
              font-family: ${this.currentTemplate.fontFamily};
              color: ${this.currentTemplate.color};
              font-size: 24px;
              font-weight: 700;
              margin: 10px 0;
              text-align: left;
              text-transform: uppercase !important;
            }
            .poster-artist {
              font-family: ${this.currentTemplate.fontFamily};
              color: ${this.currentTemplate.color};
              font-size: 18px;
              font-weight: 400;
              margin: 5px 0 20px;
              text-align: left;
              text-transform: uppercase !important;
              white-space: normal; /* Allow wrapping */
            }
            .artist-row {
              display: flex;
              align-items: flex-start;
              width: 100%;
              margin-top: 16px;
              margin-bottom: 72px;
            }
            .artist-divider {
              width: 70%;
              height: 0;
              border-bottom: 4px solid ${this.currentTemplate.color};
              margin-right: 16px;
              margin-top: 12px; /* Align with text top approximately */
              display: inline-block;
            }
            svg {
              max-width: 100%;
              height: auto;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
                background: ${this.currentTemplate.background} !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="poster">
            <h1 class="poster-title">${this.songData.trackName}</h1>
            <div class="artist-row">
              <div class="artist-divider"></div>
              <span class="poster-artist">${this.songData.artistName}</span>
            </div>
            <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">
              <circle cx="${svgSize/2}" cy="${svgSize/2}" r="${circleRadius}" fill="none" stroke="${this.currentTemplate.color}" stroke-width="2"/>
              <g>
                ${spiralLetters.map(char =>
                  `<text fill="${this.currentTemplate.color}" style="text-transform: uppercase; font-family: ${this.currentTemplate.fontFamily}; font-weight: bold; font-size: ${char.fontSize}px;" x="${char.x}" y="${char.y}" transform="rotate(${char.angle} ${char.x} ${char.y})" text-anchor="middle" alignment-baseline="middle">${char.char}</text>`
                ).join('')}
              </g>
            </svg>
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
  border-radius: 2px; /* Sharper corners for poster look */
  /* Remove padding to allow spiral to go full width */
  padding: 0 !important;
  box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.2); /* Deep, soft shadow */
  border: 1px solid #eee;
  aspect-ratio: 3/4; /* Instagram portrait ratio */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* clean edges */
  width: 100%; /* Ensure it fills container */
}

.poster-preview, .poster-preview * {
  font-family: 'Inter', system-ui, sans-serif !important;
  text-transform: uppercase !important;
}

.poster-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

.poster-header {
  text-align: center;
  margin-bottom: 3rem;
  width: 100%;
  padding: 40px 40px 0 40px; /* Add padding here instead */
  box-sizing: border-box;
}

.poster-title {
  font-size: 2.5rem;
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
  align-items: flex-start; /* Align to top to handle multi-line */
  width: 100%;
  margin-top: 24px;
}

.artist-divider {
  flex-grow: 1; /* Take up available space */
  height: 0;
  border-bottom: 3px solid #000;
  margin-right: 16px;
  margin-top: 12px; /* Visual alignment with text */
}

.poster-artist {
  max-width: 40%;
  font-size: 1.2rem;
  font-weight: 500;
  color: #000;
  margin: 0;
  text-align: right; /* Right align the name */
  white-space: normal; /* Allow wrap */
  line-height: 1.2;
}

.spiral-display {
  width: 100%;
  flex-grow: 1; /* Fill remaining space */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* Prevent overflow */
  padding-bottom: 40px; /* Add padding at bottom matching header */
  box-sizing: border-box;
}

.spiral-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spiral-svg {
  width: 100%;
  height: 100%;
  max-width: 90%; /* Leave some margin */
  max-height: 100%;
  display: block;
}



/* Template Selection UI */
.style-selection {
  margin-bottom: 25px;
}

.style-selection h3 {
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 15px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.template-card {
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: poInter;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0,0,0,0.15);
}

.template-card.active {
  border-color: #764ba2;
  transform: scale(1.05);
}

.template-preview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.template-aa {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
}

.template-name {
  font-size: 9px;
  opacity: 0.8;
  text-transform: uppercase;
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
  cursor: poInter;
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
  cursor: poInter;
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
  cursor: poInter;
  transition: background 0.2s ease;
}

.retry-button:hover {
  background: #9b2c2c;
}

.poster-preview,
.search-controls {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
  padding: 40px;
}

/* Responsive */
@media (max-width: 1024px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }

  .preview-column {
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
    padding: 10px;
  }

  .spiral-svg {
    width: 100%;
    height: auto;
    max-width: 650px;
    display: block;
    margin: 0 auto;
    max-width: 320px;
  }

  .poster-title {
    font-size: 1.5rem;
  }

  .poster-artist {
    font-size: 1.1rem;
  }
}

/* Mockup Slider Styles */
.preview-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.mockup-section h3 {
  font-size: 1.2rem;
  color: #666;
  margin: 0 0 15px;
}

.mockup-slider {
  display: flex;
  overflow-x: auto;
  gap: 15px;
  padding-bottom: 15px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.mockup-card {
  flex: 0 0 220px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: #f0f0f0;
  scroll-snap-align: start;
}

.mockup-bg {
  width: 100%;
  height: auto;
  display: block;
}

.mockup-overlay {
  position: absolute;
  /* Perspective set in inline styles for specific mockups */
  overflow: hidden;
  pointer-events: none; /* Let clicks pass through */
}

.mockup-poster-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  padding: 8% 8% 0 8%; /* Mimic header padding */
}

.mockup-title {
  font-size: 8px; /* Tiny for thumbnail */
  font-weight: 700;
  margin: 0 0 2px;
  text-align: center;
  line-height: 1.1;
  width: 100%;
}

.mockup-artist-row {
  display: flex;
  width: 100%;
  margin-top: 2px;
  margin-bottom: 4px;
}

.mockup-artist-divider {
  width: 60%;
  height: 0;
  border-bottom: 1px solid currentColor;
  margin-right: 4px;
  margin-top: 3px;
}

.mockup-artist {
  font-size: 5px;
  font-weight: 500;
  white-space: normal;
  text-align: right;
  flex: 1;
  line-height: 1;
}

.mockup-svg {
  width: 100%;
  height: auto;
  flex: 1;
}</style>
