<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Create Your Vinyl Lyrics Poster</h1>
        <p class="hero-subtitle">Transform your favorite song lyrics into a beautiful spiral art poster</p>
        <router-link to="/lyrics-poster" class="cta-button">
          Start Creating
        </router-link>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">Why Choose Our Lyrics Poster?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎵</div>
            <h3>Any Song You Love</h3>
            <p>Search from millions of songs and instantly create your poster</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Unique Spiral Design</h3>
            <p>Beautiful vinyl-inspired spiral text arrangement</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🖨️</div>
            <h3>Print Ready</h3>
            <p>High-quality output ready for printing and framing</p>
          </div>
        </div>
      </div>
    </section>

<!--    &lt;!&ndash; Mood Gallery &ndash;&gt;
    <section class="mood-gallery">
      <div class="container">
        <h2 class="section-title">Gallery of Inspirations</h2>
        <div class="gallery-grid">
          <div class="gallery-item">
            <img src="https://via.placeholder.com/400x400/1a1a1a/ffffff?text=Vinyl+Poster+1" alt="Mood Image 1" />
            <div class="gallery-overlay">
              <p>Classic Rock Vibes</p>
            </div>
          </div>
          <div class="gallery-item">
            <img src="https://via.placeholder.com/400x400/2a2a2a/ffffff?text=Vinyl+Poster+2" alt="Mood Image 2" />
            <div class="gallery-overlay">
              <p>Indie Favorites</p>
            </div>
          </div>
          <div class="gallery-item">
            <img src="https://via.placeholder.com/400x400/3a3a3a/ffffff?text=Vinyl+Poster+3" alt="Mood Image 3" />
            <div class="gallery-overlay">
              <p>Pop Sensations</p>
            </div>
          </div>
          <div class="gallery-item">
            <img src="https://via.placeholder.com/400x400/4a4a4a/ffffff?text=Vinyl+Poster+4" alt="Mood Image 4" />
            <div class="gallery-overlay">
              <p>Timeless Classics</p>
            </div>
          </div>
        </div>
      </div>
    </section>-->
  </div>
</template>

<script>
export default {
  name: 'HomePage'
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Hero Section */
.hero {
  padding: 100px 20px;
  text-align: center;
  color: white;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 40px;
  opacity: 0.95;
}

.cta-button {
  display: inline-block;
  padding: 15px 40px;
  background: white;
  color: #764ba2;
  text-decoration: none;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* Features Section */
.features {
  padding: 80px 20px;
  background: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 50px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.feature-card {
  text-align: center;
  padding: 30px;
  border-radius: 15px;
  background: #f8f9fa;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 15px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/*!* Mood Gallery *!
.mood-gallery {
  padding: 80px 20px;
  background: #f8f9fa;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.gallery-item {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.gallery-item:hover {
  transform: scale(1.05);
}*/

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/*.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px;
  color: white;
}*/

.gallery-overlay p {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .features-grid,
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
</style>
