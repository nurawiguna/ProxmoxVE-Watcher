import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  let nextId = 1

  const addNotification = (type, message, duration = 5000) => {
    const notification = {
      id: nextId++,
      type,
      message,
      timestamp: Date.now(),
    }

    notifications.value.push(notification)

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(notification.id)
    }, duration)

    return notification.id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  // Convenience methods
  const success = (message, duration) => addNotification('success', message, duration)
  const error = (message, duration) => addNotification('error', message, duration)
  const warning = (message, duration) => addNotification('warning', message, duration)
  const info = (message, duration) => addNotification('info', message, duration)

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  }
})
