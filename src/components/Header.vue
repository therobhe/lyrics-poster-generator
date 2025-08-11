<template>
  <header class="app-header">
    <div class="header-container">
      <div class="brand">
        <router-link to="/" class="brand-link">
          <span class="brand-icon">🎵</span>
          <span class="brand-text">Vinyl Lyrics</span>
        </router-link>
      </div>
      
      <nav class="navigation">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          Home
        </router-link>
        <router-link to="/lyrics-poster" class="nav-link" :class="{ active: $route.path === '/lyrics-poster' }">
          LyricsPoster
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  transition: opacity 0.3s ease;
}

.brand-link:hover {
  opacity: 0.8;
}

.brand-icon {
  font-size: 1.8rem;
  margin-right: 10px;
}

.brand-text {
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navigation {
  display: flex;
  gap: 30px;
}

.nav-link {
  position: relative;
  padding: 10px 20px;
  text-decoration: none;
  color: #666;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.nav-link:hover {
  color: #764ba2;
  background: rgba(118, 75, 162, 0.05);
}

.nav-link.active {
  color: #764ba2;
  background: rgba(118, 75, 162, 0.1);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 20px;
  right: 20px;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

/* Mobile responsive */
@media (max-width: 600px) {
  .header-container {
    height: 60px;
  }
  
  .brand-icon {
    font-size: 1.5rem;
  }
  
  .brand-text {
    font-size: 1.2rem;
  }
  
  .navigation {
    gap: 15px;
  }
  
  .nav-link {
    padding: 8px 15px;
    font-size: 1rem;
  }
}
</style>
