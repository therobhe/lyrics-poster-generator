<template>
  <div class="style-selection">
    <h3>Choose a Style</h3>
    <div class="templates-grid">
      <div 
        v-for="(template, index) in templates" 
        :key="index"
        class="template-card"
        :class="{ active: modelValue === index }"
        :style="{ background: template.background, color: template.color, fontFamily: template.fontFamily }"
        @click="$emit('update:modelValue', index)"
      >
        <div class="template-preview-content">
          <span class="template-aa">Aa</span>
          <span class="template-name">{{ template.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StyleSelector',
  props: {
    templates: {
      type: Array,
      required: true
    },
    modelValue: {
      type: Number,
      required: true
    }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
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
  cursor: pointer;
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
</style>
