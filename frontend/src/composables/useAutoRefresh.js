import { ref, onMounted, onUnmounted } from 'vue'
import { useProxmoxStore } from '@/stores/proxmox'

/**
 * Auto-refresh composable
 * @param {number} interval - Refresh interval in milliseconds
 * @param {boolean} immediate - Whether to start immediately
 */
export const useAutoRefresh = (interval = 30000, immediate = false) => {
  const proxmoxStore = useProxmoxStore()
  const isActive = ref(false)
  let intervalId = null

  const start = () => {
    if (intervalId) return
    
    isActive.value = true
    intervalId = setInterval(async () => {
      try {
        await proxmoxStore.refreshData()
      } catch (error) {
        console.error('Auto-refresh failed:', error)
      }
    }, interval)
  }

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
      isActive.value = false
    }
  }

  const toggle = () => {
    if (isActive.value) {
      stop()
    } else {
      start()
    }
  }

  // Auto-start if immediate is true
  if (immediate) {
    onMounted(start)
  }

  // Cleanup on unmount
  onUnmounted(stop)

  // Pause when page is hidden, resume when visible
  const handleVisibilityChange = () => {
    if (document.hidden) {
      stop()
    } else if (immediate) {
      start()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    isActive,
    start,
    stop,
    toggle,
  }
}
