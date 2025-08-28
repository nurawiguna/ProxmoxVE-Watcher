<template>
  <nav class="bg-white shadow-lg border-b border-gray-200">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and title -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <ServerIcon class="h-8 w-8 text-blue-600" />
            <h1 class="text-xl font-bold gradient-text">
              Proxmox VE - Watcher
            </h1>
          </div>
        </div>

        <!-- Navigation links -->
        <div class="hidden md:flex items-center space-x-6">
          <router-link
            v-for="link in navigationLinks"
            :key="link.name"
            :to="link.to"
            class="nav-link"
            :class="{ 'nav-link-active': $route.name === link.name }"
          >
            <component :is="link.icon" class="h-4 w-4" />
            <span>{{ link.label }}</span>
          </router-link>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center space-x-4">
          <!-- Auto-refresh toggle -->
          <button
            @click="toggleAutoRefresh"
            :class="[
              'btn-secondary',
              autoRefresh.isActive.value ? 'bg-blue-50 text-blue-600 border-blue-200' : ''
            ]"
            :title="autoRefresh.isActive.value ? 'Auto-refresh is ON' : 'Auto-refresh is OFF'"
          >
            <ArrowPathIcon 
              class="h-4 w-4" 
              :class="{ 'animate-spin': proxmoxStore.isLoading }" 
            />
            <span class="hidden sm:inline ml-2">
              {{ autoRefresh.isActive.value ? 'Auto' : 'Manual' }}
            </span>
          </button>

          <!-- Manual refresh -->
          <button
            @click="handleRefresh"
            :disabled="proxmoxStore.isLoading"
            class="btn-primary"
            title="Refresh data"
          >
            <ArrowPathIcon 
              class="h-4 w-4" 
              :class="{ 'animate-spin': proxmoxStore.isLoading }" 
            />
            <span class="hidden sm:inline ml-2">Refresh</span>
          </button>

          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden btn-secondary"
          >
            <Bars3Icon v-if="!mobileMenuOpen" class="h-5 w-5" />
            <XMarkIcon v-else class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-show="mobileMenuOpen" class="md:hidden border-t border-gray-200 bg-gray-50">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <router-link
              v-for="link in navigationLinks"
              :key="link.name"
              :to="link.to"
              @click="mobileMenuOpen = false"
              class="mobile-nav-link"
              :class="{ 'mobile-nav-link-active': $route.name === link.name }"
            >
              <component :is="link.icon" class="h-5 w-5" />
              <span>{{ link.label }}</span>
            </router-link>
          </div>
        </div>
      </transition>
    </div>

    <!-- Loading bar -->
    <div 
      v-if="proxmoxStore.isLoading" 
      class="h-1 bg-blue-600 animate-pulse"
    />
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useProxmoxStore } from '@/stores/proxmox'
import { useAutoRefresh } from '@/composables/useAutoRefresh'
import {
  ServerIcon,
  HomeIcon,
  ComputerDesktopIcon,
  CubeIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

const proxmoxStore = useProxmoxStore()
const autoRefresh = useAutoRefresh()
const mobileMenuOpen = ref(false)

const navigationLinks = [
  {
    name: 'Dashboard',
    label: 'Dashboard',
    to: '/',
    icon: HomeIcon,
  },
  {
    name: 'Hosts',
    label: 'Hosts',
    to: '/hosts',
    icon: ServerIcon,
  },
  {
    name: 'VirtualMachines',
    label: 'VMs',
    to: '/vms',
    icon: ComputerDesktopIcon,
  },
  {
    name: 'Containers',
    label: 'Containers',
    to: '/containers',
    icon: CubeIcon,
  },
]

const toggleAutoRefresh = () => {
  autoRefresh.toggle()
}

const handleRefresh = async () => {
  try {
    await proxmoxStore.refreshData()
  } catch (error) {
    console.error('Manual refresh failed:', error)
  }
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors;
}

.nav-link-active {
  @apply text-blue-600 bg-blue-50;
}

.mobile-nav-link {
  @apply flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-white;
}

.mobile-nav-link-active {
  @apply text-blue-600 bg-white border-l-4 border-blue-500;
}
</style>
