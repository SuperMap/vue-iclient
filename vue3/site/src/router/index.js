import { createRouter, createWebHistory } from 'vue-router'

import demoRoutes from './demoRoutes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...demoRoutes]
  // scrollBehavior(to, from, savedPosition) {
  //   // 只有当这是一个 popstate 导航时才可用（由浏览器的后退/前进按钮触发）。
  //   // return 期望滚动到哪个的位置
  //   if (savedPosition) {
  //     return savedPosition
  //   } else {
  //     return { top: 0 }
  //   }
  // }
})

export default router
