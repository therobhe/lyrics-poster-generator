<template>
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
            <g class="spiral-group" v-memo="[spiralLetters, currentTemplate]">
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
</template>

<script>
export default {
  name: 'PosterPreview',
  props: {
    songData: {
      type: Object,
      default: null
    },
    spiralLetters: {
      type: Array,
      default: () => []
    },
    currentTemplate: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    svgSize: {
      type: Number,
      default: 650
    },
    circleRadius: {
      type: Number,
      default: 60
    }
  },
  computed: {
    previewStyle() {
      return {
        background: this.currentTemplate.background,
        color: this.currentTemplate.color
      }
    }
  }
}
</script>

<style scoped>
.poster-preview {
  background: white;
  border-radius: 2px;
  padding: 0 !important;
  box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.2);
  border: 1px solid #eee;
  aspect-ratio: 3/4;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
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
  text-align: left;
  width: 100%;
  padding: 40px 40px 0 40px;
  box-sizing: border-box;
}

.poster-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 -24px;
}

.artist-row {
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-top: 24px;
}

.artist-divider {
  flex-grow: 1;
  height: 0;
  border-bottom: 3px solid currentColor;
  margin-right: 16px;
  margin-top: 12px;
}

.poster-artist {
  max-width: 40%;
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
  text-align: right;
  white-space: normal;
  line-height: 1.2;
}

.spiral-display {
  width: 100%;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding-bottom: 40px;
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
  max-width: 90%;
  max-height: 100%;
  display: block;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .spiral-svg {
    max-width: 320px;
  }

  .poster-title {
    font-size: 1.5rem;
  }

  .poster-artist {
    font-size: 1.1rem;
  }
}
</style>
