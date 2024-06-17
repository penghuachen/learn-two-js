import { createRouter, createWebHistory } from 'vue-router'
import RectangleView from '../views/RectangleView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/rectangle',
      name: 'home',
      component: RectangleView
    },
    {
      path: '/robot-arm',
      name: 'robot-arm',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/RobotArm.vue')
    }
  ]
})

export default router
