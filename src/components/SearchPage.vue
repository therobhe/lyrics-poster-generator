<template>
  <div class="search-page">
    <div class="search-container">
      <h1>Vue Lyrics Poster</h1>
      <p>Search for songs and create beautiful spiral lyrics posters</p>
      
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
        
        <div v-if="loading" class="loading">
          Searching...
        </div>
        
        <div v-if="error" class="error">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'SearchPage',
  data() {
    return {
      searchQuery: '',
      suggestions: [],
      showSuggestions: false,
      loading: false,
      error: null,
      searchTimeout: null
    }
  },
  methods: {
    handleInput() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      if (this.searchQuery.length < 2) {
        this.suggestions = []
        this.showSuggestions = false
        return
      }
      
      this.searchTimeout = setTimeout(() => {
        this.searchSongs()
      }, 300) // Debounce search by 300ms
    },
    
    async searchSongs() {
      if (!this.searchQuery.trim()) return
      
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`https://lrclib.net/api/search`, {
          params: {
            q: this.searchQuery.trim()
          }
        })
        
        this.suggestions = response.data.slice(0, 10) // Limit to 10 suggestions
        this.showSuggestions = true
      } catch (err) {
        console.error('Error searching songs:', err)
        this.error = 'Failed to search songs. Please try again.'
        this.suggestions = []
      } finally {
        this.loading = false
      }
    },
    
    selectSong(song) {
      // Navigate to lyrics page with song data
      this.$router.push({
        path: `/lyrics/${song.id}`,
        query: {
          trackName: song.trackName,
          artistName: song.artistName,
          albumName: song.albumName || ''
        }
      })
    },
    
    handleBlur() {
      // Delay hiding suggestions to allow for click events
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    }
  }
}
</script>

<style scoped>
.search-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, black 0%, #764ba2 100%);
  padding: 20px;
}

.search-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 2.5em;
}

p {
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1em;
}

.search-input-container {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 15px 20px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 25px;
  outline: none;
  transition: border-color 0.3s ease;
  background: white;
  color: black;
}

.search-input:focus {
  border-color: black;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 15px 15px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
  text-align: left;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.track-name {
  font-weight: bold;
  color: #333;
  font-size: 16px;
}

.artist-name {
  color: #666;
  font-size: 14px;
}

.album-name {
  color: #999;
  font-size: 12px;
  font-style: italic;
}

.loading {
  text-align: center;
  padding: 15px;
  color: #666;
  font-style: italic;
}

.error {
  text-align: center;
  padding: 15px;
  color: #e74c3c;
  background-color: #fdf2f2;
  border-radius: 10px;
  margin-top: 10px;
}
</style>