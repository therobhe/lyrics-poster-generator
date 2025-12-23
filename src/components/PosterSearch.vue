<template>
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
    <div v-if="songData && !songData.isPlaceholder && !loading" class="selected-song">
      <h3>Current Selection</h3>
      <div class="selected-song-info">
        <p class="selected-track">{{ songData.trackName }}</p>
        <p class="selected-artist">{{ songData.artistName }}</p>
        <p v-if="songData.albumName" class="selected-album">{{ songData.albumName }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PosterSearch',
  props: {
    songData: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select-song'],
  data() {
    return {
      searchQuery: '',
      suggestions: [],
      showSuggestions: false,
      searchLoading: false,
      searchTimeout: null,
      abortController: null
    }
  },
  watch: {
    songData: {
      handler(newVal) {
        if (newVal && !newVal.isPlaceholder) {
          this.searchQuery = `${newVal.trackName} - ${newVal.artistName}`
        }
      },
      immediate: true
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
      }, 700)
    },

    async searchSongs() {
      if(!this.searchQuery.trim()) return

      this.searchLoading = true
      
      if (this.abortController) {
        this.abortController.abort()
      }
      this.abortController = new AbortController()

      try {
        const response = await axios.get('https://lyrics-poster-generator-be.onrender.com/api/search', {
          params: {
            q: this.searchQuery
          },
          signal: this.abortController.signal
        })
        this.suggestions = response.data
      } catch(error) {
        if (axios.isCancel(error) || error.name === 'AbortError') return
        console.error('Search error:', error)
      } finally {
        this.searchLoading = false
        this.abortController = null
      }
    },

    selectSong(song) {
      this.showSuggestions = false
      this.suggestions = []
      this.$emit('select-song', song)
    },

    handleBlur() {
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    }
  }
}
</script>

<style scoped>
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
</style>
