<template>
  <div v-if="songData && !loading" class="mockup-section">
    <h3>Visualize in Room</h3>
    <div class="mockup-slider">
      <!-- Skeleton loading state -->
      <template v-if="!allMockupsLoaded">
        <div v-for="n in 4" :key="'skeleton-' + n" class="mockup-card mockup-skeleton">
          <div class="skeleton-shimmer"></div>
        </div>
      </template>
      <!-- Actual mockups -->
      <div v-for="mockup in mockups" :key="mockup.id" class="mockup-card" :class="{ 'mockup-loaded': allMockupsLoaded }">
        <img :src="mockup.image" class="mockup-bg" @load="onMockupImageLoad" />
        <div class="mockup-overlay" :style="mockup.style">
          <div class="mockup-poster-content" :style="{ background: currentTemplate.background, color: currentTemplate.color }">
            <h2 class="mockup-title" :style="{ color: currentTemplate.color, fontFamily: currentTemplate.fontFamily }">{{ songData.trackName }}</h2>
             <div class="mockup-artist-row">
                <div class="mockup-artist-divider" :style="{ borderColor: currentTemplate.color }"></div>
                <div class="mockup-artist" :style="{ 
                  color: currentTemplate.color, 
                  fontFamily: currentTemplate.fontFamily,
                  fontSize: mockupArtistFontSize
                }">{{ songData.artistName }}</div>
             </div>
             <div class="mockup-image-container">
               <img v-if="posterImage" :src="posterImage" class="mockup-poster-img" />
             </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Hidden canvas for generating the poster image -->
    <canvas ref="posterCanvas" style="display: none;"></canvas>
  </div>
</template>

<script>
import { renderSpiralToCanvas } from '../utils/spiral'
import mockupWall from '../assets/mockups/mockup_wall.png'
import mockupTable from '../assets/mockups/mockup_table.png'
import mockupAngle from '../assets/mockups/mockup_angle.png'
import mockupDesk from '../assets/mockups/mockup_desk.png'

export default {
  name: 'MockupSlider',
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
    }
  },
  data() {
    return {
      mockups: [
        { 
          id: 'wall', 
          name: 'Wall', 
          image: mockupWall, 
          style: { top: '16%', left: '35.5%', width: '35%', height: '47%', transform: 'scale(0.8)' }
        },
        { 
          id: 'table', 
          name: 'Table', 
          image: mockupTable, 
          style: { top: '26%', left: '33%', width: '32%', height: '49%', transform: 'perspective(800px) rotateX(-4deg) rotateY(3deg)' }
        },
        { 
          id: 'angle', 
          name: 'Glass Frame', 
          image: mockupAngle, 
          style: { top: '26%', left: '33%', width: '32%', height: '49%', transform: 'perspective(700px) skewY(0deg) rotateY(-35deg)' }
        },
        { 
          id: 'desk', 
          name: 'Workspace', 
          image: mockupDesk, 
          style: { top: '25%', left: '24%', width: '29%', height: '49%', transform: 'perspective(1200px) rotateX(359deg) rotateY(36deg) rotateZ(358deg)' } 
        }
      ],
      mockupsLoadedCount: 0,
      allMockupsLoaded: false,
      posterImage: null,
      renderTimeout: null
    }
  },
  computed: {
    mockupArtistFontSize() {
      if (!this.songData?.artistName) return '5px';
      const len = this.songData.artistName.length;
      if (len > 30) return '3px';
      if (len > 20) return '4px';
      return '5px';
    }
  },
  watch: {
    songData() {
      this.resetMockupLoading()
    },
    spiralLetters: {
      handler() {
        this.debouncedRender()
      },
      immediate: true
    },
    currentTemplate: {
      handler() {
        this.debouncedRender()
      }
    }
  },
  methods: {
    debouncedRender() {
      clearTimeout(this.renderTimeout)
      // Delay rendering to keep UI responsive
      this.renderTimeout = setTimeout(() => {
        this.generatePosterImage()
      }, 300)
    },
    generatePosterImage() {
      if (!this.spiralLetters.length || !this.$refs.posterCanvas) return

      // For mockups, we can use a smaller scale to save memory and time
      renderSpiralToCanvas(this.$refs.posterCanvas, this.spiralLetters, this.currentTemplate, {
        scale: 0.5 // 325x325 is enough for thumbnails
      })
      
      this.posterImage = this.$refs.posterCanvas.toDataURL('image/png')
    },
    onMockupImageLoad() {
      this.mockupsLoadedCount++
      if (this.mockupsLoadedCount >= this.mockups.length) {
        setTimeout(() => {
          this.allMockupsLoaded = true
        }, 100)
      }
    },
    resetMockupLoading() {
      this.mockupsLoadedCount = 0
      this.allMockupsLoaded = false
    }
  }
}
</script>

<style scoped>
.mockup-section h3 {
  font-size: 1.2rem;
  color: #666;
  margin: 0 0 10px;
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
  flex: 0 0 180px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: #f0f0f0;
  scroll-snap-align: start;
  opacity: 0;
  transition: opacity 0.3s ease;
  content-visibility: auto;
}

.mockup-card.mockup-loaded {
  opacity: 1;
}

.mockup-skeleton {
  background: #e0e0e0;
  opacity: 1;
  position: relative;
  overflow: hidden;
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.mockup-bg {
  width: 100%;
  height: auto;
  display: block;
}

.mockup-overlay {
  position: absolute;
  overflow: hidden;
  pointer-events: none;
}

.mockup-poster-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  padding: 6% 6% 0 6%;
}

.mockup-title {
  font-size: 7px;
  font-weight: 700;
  margin: 0 0 1px;
  text-align: center;
  line-height: 1.1;
  width: 100%;
}

.mockup-artist-row {
  display: flex;
  width: 100%;
  margin-top: 1px;
  margin-bottom: 3px;
}

.mockup-artist-divider {
  width: 60%;
  height: 0;
  border-bottom: 1px solid currentColor;
  margin-right: 4px;
  margin-top: 3px;
}

.mockup-artist {
  font-weight: 500;
  white-space: nowrap;
  text-align: right;
  flex: 1;
  line-height: 1;
}

.mockup-image-container {
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.mockup-poster-img {
  width: 100%;
  height: auto;
  display: block;
}
</style>

