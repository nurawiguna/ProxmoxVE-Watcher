<template>
  <teleport to="body">
    <transition-group
      name="notification"
      tag="div"
      class="fixed top-4 right-4 z-50 space-y-2"
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 transform translate-x-full"
      enter-to-class="opacity-100 transform translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-x-0"
      leave-to-class="opacity-0 transform translate-x-full"
    >
      <div
        v-for="notification in notificationStore.notifications"
        :key="notification.id"
        :class="getNotificationClasses(notification.type)"
        class="max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component
                :is="getNotificationIcon(notification.type)"
                :class="getIconClasses(notification.type)"
                class="h-5 w-5"
              />
            </div>
            <div class="ml-3 w-0 flex-1">
              <p :class="getTextClasses(notification.type)" class="text-sm font-medium">
                {{ notification.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="notificationStore.removeNotification(notification.id)"
                :class="getCloseButtonClasses(notification.type)"
                class="rounded-md inline-flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notification'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

const notificationStore = useNotificationStore()

const getNotificationClasses = (type) => {
  const baseClasses = 'bg-white border-l-4'
  
  switch (type) {
    case 'success':
      return `${baseClasses} border-success-500`
    case 'error':
      return `${baseClasses} border-danger-500`
    case 'warning':
      return `${baseClasses} border-warning-500`
    case 'info':
      return `${baseClasses} border-primary-500`
    default:
      return `${baseClasses} border-gray-500`
  }
}

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return CheckCircleIcon
    case 'error':
      return XCircleIcon
    case 'warning':
      return ExclamationTriangleIcon
    case 'info':
      return InformationCircleIcon
    default:
      return InformationCircleIcon
  }
}

const getIconClasses = (type) => {
  switch (type) {
    case 'success':
      return 'text-success-500'
    case 'error':
      return 'text-danger-500'
    case 'warning':
      return 'text-warning-500'
    case 'info':
      return 'text-primary-500'
    default:
      return 'text-gray-500'
  }
}

const getTextClasses = (type) => {
  return 'text-gray-900'
}

const getCloseButtonClasses = (type) => {
  switch (type) {
    case 'success':
      return 'text-success-400 hover:text-success-500 focus:ring-success-500'
    case 'error':
      return 'text-danger-400 hover:text-danger-500 focus:ring-danger-500'
    case 'warning':
      return 'text-warning-400 hover:text-warning-500 focus:ring-warning-500'
    case 'info':
      return 'text-primary-400 hover:text-primary-500 focus:ring-primary-500'
    default:
      return 'text-gray-400 hover:text-gray-500 focus:ring-gray-500'
  }
}
</script>
