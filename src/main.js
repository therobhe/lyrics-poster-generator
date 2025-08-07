import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import SearchPage from './components/SearchPage.vue'
import LyricsPage from './components/LyricsPage.vue'
import './style.css'

const routes = [
  { path: '/', component: SearchPage },
  { path: '/lyrics/:id', component: LyricsPage, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')