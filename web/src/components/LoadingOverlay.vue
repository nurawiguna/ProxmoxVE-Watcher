<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
  >
    <div class="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full mx-4">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Loading</h3>
        <p class="text-gray-600">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
  message: {
    type: String,
    default: 'Please wait...',
  },
})
</script>
