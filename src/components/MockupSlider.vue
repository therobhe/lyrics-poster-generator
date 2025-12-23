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
</template>

<script>
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
          style: { top: '26%', left: '32.5%', width: '35%', height: '47%', transform: 'scale(0.98)' }
        },
        { 
          id: 'table', 
          name: 'Table', 
          image: mockupTable, 
          style: { top: '23%', left: '32%', width: '35%', height: '47%', transform: 'perspective(800px) rotateX(-4deg) rotateY(3deg)' }
        },
        { 
          id: 'angle', 
          name: 'Glass Frame', 
          image: mockupAngle, 
          style: { top: '15%', left: '38%', width: '33%', height: '44%', transform: 'perspective(1200px) skewY(12deg) rotateY(-25deg)' }
        },
        { 
          id: 'desk', 
          name: 'Workspace', 
          image: mockupDesk, 
          style: { top: '12%', left: '32%', width: '34.5%', height: '46%', transform: 'perspective(800px) rotateX(-3deg) rotateY(2deg)' } 
        }
      ],
      mockupsLoadedCount: 0,
      allMockupsLoaded: false
    }
  },
  watch: {
    songData() {
      this.resetMockupLoading()
    }
  },
  methods: {
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
  padding: 8% 8% 0 8%;
}

.mockup-title {
  font-size: 8px;
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
}
</style>
