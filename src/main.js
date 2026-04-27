import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import DashboardView from './views/DashboardView.vue'
import URLDetailView from './views/URLDetailView.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: DashboardView },
    { path: '/urls/:id', component: URLDetailView, props: true },
  ],
})

createApp(App).use(router).mount('#app')
