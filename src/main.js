import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomePage from './components/HomePage.vue'
import LyricsPoster from './components/LyricsPoster.vue'
import './style.css'

const routes = [
  { path: '/', component: HomePage },
  { path: '/lyrics-poster', component: LyricsPoster }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')