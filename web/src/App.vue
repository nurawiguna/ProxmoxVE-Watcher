<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
    <!-- Loading overlay -->
    <LoadingOverlay v-if="isLoading" />
    
    <!-- Navigation -->
    <Navigation />
    
    <!-- Main content -->
    <main class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
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
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useProxmoxStore } from '@/stores/proxmox'
import Navigation from '@/components/Navigation.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import NotificationSystem from '@/components/NotificationSystem.vue'

const proxmoxStore = useProxmoxStore()

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
