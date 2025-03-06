import { createRouter, createWebHistory } from 'vue-router'

import demoRoutes from './demoRoutes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...demoRoutes]
})

export default router
