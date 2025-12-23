<template>
  <div class="lyrics-poster">
    <div class="two-column-layout">
      <!-- Left Column - Poster Preview -->
      <div class="preview-column">
        <PosterPreview 
          :song-data="songData"
          :spiral-letters="spiralLetters"
          :current-template="currentTemplate"
          :loading="loading"
          :svg-size="svgSize"
          :circle-radius="circleRadius"
        />

        <!-- Mockups Slider -->
        <MockupSlider 
          v-if="showMockups"
          :song-data="songData"
          :spiral-letters="spiralLetters"
          :current-template="currentTemplate"
          :loading="loading"
        />
      </div>

      <!-- Right Column - Search and Controls -->
      <div class="search-controls">
        <PosterSearch 
          :song-data="songData"
          :loading="loading"
          @select-song="selectSong"
        />

        <!-- Style Template Selection -->
        <StyleSelector 
          v-if="songData && !loading"
          v-model="selectedTemplateIndex"
          :templates="templates"
        />

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
</template>

<script>
import axios from 'axios'
import { calculateSpiral } from '../utils/spiral'
import PosterSearch from './PosterSearch.vue'
import StyleSelector from './StyleSelector.vue'
import PosterPreview from './PosterPreview.vue'
import MockupSlider from './MockupSlider.vue'

export default {
  name: 'LyricsPoster',
  components: {
    PosterSearch,
    StyleSelector,
    PosterPreview,
    MockupSlider
  },
  data() {
    return {
      songData: null,
      lyrics: '',
      loading: false,
      showMockups: false,
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
    circleRadius() {
      return 60
    },
    spiralLetters() {
      return calculateSpiral(this.lyrics, { svgSize: this.svgSize })
    }
  },
  methods: {
    selectSong(song) {
      this.songData = song
      this.fetchLyrics()
    },

    async fetchLyrics() {
      if(!this.songData) return

      this.loading = true
      this.showMockups = false
      this.error = null
      this.lyrics = ''

      try {
        const response = await axios.get('https://lyrics-poster-generator-be.onrender.com/api/lyrics', {
          params: {
            artist: this.songData.artistName,
            track: this.songData.trackName,
            album: this.songData.albumName || undefined,
            duration: this.songData.duration || undefined
          }
        })

        if(response.data) {
          if(response.data.instrumental) {
            this.lyrics = `${this.songData.trackName} by ${this.songData.artistName} - This is an instrumental track with no lyrics. Enjoy the beautiful spiral design that represents the musical journey of this instrumental piece.`
            this.error = 'This is an instrumental track.'
          } else if(response.data.plainLyrics || response.data.lyrics) {
            const lyricsText = response.data.plainLyrics || response.data.lyrics || response.data.syncedLyrics

            const cleanedLyrics = lyricsText
            .replace(/\[.*?/g, '')
            .replace(/\n+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()

            this.lyrics = cleanedLyrics
            
            // Delay mockup rendering to keep UI responsive
            setTimeout(() => {
              this.showMockups = true
            }, 500)
          } else {
            throw new Error('No lyrics found')
          }
        } else {
          throw new Error('No lyrics found')
        }
      } catch(error) {
        console.error('Error fetching lyrics:', error)
        this.lyrics = `${this.songData.trackName} by ${this.songData.artistName} - These are placeholder lyrics for your beautiful spiral poster. The actual lyrics could not be loaded but you can still see how your poster would look. This spiral design creates a unique vinyl-inspired artwork that captures the essence of your favorite songs in a visually stunning way.`

        if(error.response && error.response.status === 404) {
          this.error = 'Lyrics not found for this song. Showing placeholder text.'
        } else {
          this.error = 'Could not load actual lyrics. Showing placeholder text.'
        }
        
        // Still show mockups for placeholder
        setTimeout(() => {
          this.showMockups = true
        }, 500)
      } finally {
        this.loading = false
      }
    },

    printPoster() {
      const printWindow = window.open('', '_blank')
      const svgSize = this.svgSize
      const circleRadius = this.circleRadius
      const spiralLetters = calculateSpiral(this.lyrics, { svgSize: this.svgSize, isPrint: true })
      
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
              white-space: normal;
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
              margin-top: 12px;
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

/* Right Column - Search and Controls */
.search-controls {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
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
}

.preview-column {
  display: flex;
  flex-direction: column;
  gap: 15px;
  transform: scale(0.925);
  transform-origin: top center;
  align-self: flex-start;
}
</style>
