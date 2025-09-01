<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
    <div class="text-center">
      <ExclamationTriangleIcon class="h-24 w-24 text-gray-400 mx-auto mb-6" />
      
      <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
      
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      
      <p class="text-gray-600 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <div class="space-x-4">
        <router-link to="/" class="btn-primary">
          <HomeIcon class="h-4 w-4 mr-2" />
          Go Home
        </router-link>
        
        <button @click="$router.go(-1)" class="btn-secondary">
          <ArrowLeftIcon class="h-4 w-4 mr-2" />
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
} from '@heroicons/vue/24/outline'
</script>
