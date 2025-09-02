import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard - Proxmox VE Watcher'
    }
  },
  {
    path: '/hosts',
    name: 'Hosts',
    component: () => import('@/views/Hosts.vue'),
    meta: {
      title: 'Hosts - Proxmox VE Watcher'
    }
  },
  {
    path: '/vms',
    name: 'VirtualMachines',
    component: () => import('@/views/VirtualMachines.vue'),
    meta: {
      title: 'Virtual Machines - Proxmox VE Watcher'
    }
  },
  {
    path: '/containers',
    name: 'Containers',
    component: () => import('@/views/Containers.vue'),
    meta: {
      title: 'Containers - Proxmox VE Watcher'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: 'Page Not Found'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to update page title
router.beforeEach((to) => {
  document.title = to.meta.title || 'Proxmox VE Watcher'
})

export default router
