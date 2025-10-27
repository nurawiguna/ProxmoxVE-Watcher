<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex flex-col">
    <!-- Demo mode indicator -->
    <div v-if="isDemoMode" class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 text-center">
      <div class="flex items-center justify-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <strong>Demo Mode:</strong> This is a preview with dummy data. All actions are simulated.
      </div>
    </div>

    <!-- Loading overlay -->
    <LoadingOverlay v-if="isLoading" />
    
    <!-- Navigation -->
    <Navigation />
    
    <!-- Main content -->
    <main class="container mx-auto px-4 py-6 sm:px-6 lg:px-8 flex-1 w-full">
      <router-view v-slot="{ Component }">
        <transition
          name="fade"
          mode="out-in"
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 transform translate-y-4"
          enter-to-class="opacity-100 transform translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 transform translate-y-0"
          leave-to-class="opacity-0 transform translate-y-4"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- Global notification system -->
    <NotificationSystem />

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useProxmoxStore } from '@/stores/proxmox'
import Navigation from '@/components/Navigation.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import NotificationSystem from '@/components/NotificationSystem.vue'
import Footer from '@/components/Footer.vue'

const proxmoxStore = useProxmoxStore()

// Check if we're in demo mode
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

// Computed properties
const isLoading = computed(() => proxmoxStore.isLoading)

// Initialize the application
onMounted(async () => {
  try {
    await proxmoxStore.initializeApp()
  } catch (error) {
    console.error('Failed to initialize application:', error)
  }
})
</script>

<style scoped>
/* Page transition styles are handled by Tailwind classes in the template */
</style>
