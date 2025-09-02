<template>
  <div :class="cardClasses" class="card p-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div :class="iconWrapperClasses" class="p-3 rounded-lg">
          <component :is="iconComponent" :class="iconClasses" class="h-6 w-6" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-600">{{ title }}</p>
          <p :class="valueClasses" class="text-2xl font-bold">
            {{ displayValue }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  ServerIcon,
  ComputerDesktopIcon,
  CubeIcon,
  PlayIcon,
  StopIcon,
  PlayCircleIcon,
  StopCircleIcon,
  CpuChipIcon,
  CircleStackIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'blue',
  },
})

const iconMap = {
  'server': ServerIcon,
  'computer-desktop': ComputerDesktopIcon,
  'cube': CubeIcon,
  'play': PlayIcon,
  'stop': StopIcon,
  'play-circle': PlayCircleIcon,
  'stop-circle': StopCircleIcon,
  'cpu': CpuChipIcon,
  'memory': CircleStackIcon,
  'hard-drive': CircleStackIcon,
}

const colorClasses = {
  blue: {
    card: 'border-blue-200 hover:border-blue-300',
    iconWrapper: 'bg-blue-50',
    icon: 'text-blue-500',
    value: 'text-blue-600',
  },
  green: {
    card: 'border-green-200 hover:border-green-300',
    iconWrapper: 'bg-green-50',
    icon: 'text-green-500',
    value: 'text-green-600',
  },
  red: {
    card: 'border-red-200 hover:border-red-300',
    iconWrapper: 'bg-red-50',
    icon: 'text-red-500',
    value: 'text-red-600',
  },
  purple: {
    card: 'border-purple-200 hover:border-purple-300',
    iconWrapper: 'bg-purple-50',
    icon: 'text-purple-500',
    value: 'text-purple-600',
  },
  emerald: {
    card: 'border-emerald-200 hover:border-emerald-300',
    iconWrapper: 'bg-emerald-50',
    icon: 'text-emerald-500',
    value: 'text-emerald-600',
  },
  teal: {
    card: 'border-teal-200 hover:border-teal-300',
    iconWrapper: 'bg-teal-50',
    icon: 'text-teal-500',
    value: 'text-teal-600',
  },
  orange: {
    card: 'border-orange-200 hover:border-orange-300',
    iconWrapper: 'bg-orange-50',
    icon: 'text-orange-500',
    value: 'text-orange-600',
  },
  indigo: {
    card: 'border-indigo-200 hover:border-indigo-300',
    iconWrapper: 'bg-indigo-50',
    icon: 'text-indigo-500',
    value: 'text-indigo-600',
  },
  pink: {
    card: 'border-pink-200 hover:border-pink-300',
    iconWrapper: 'bg-pink-50',
    icon: 'text-pink-500',
    value: 'text-pink-600',
  },
  yellow: {
    card: 'border-yellow-200 hover:border-yellow-300',
    iconWrapper: 'bg-yellow-50',
    icon: 'text-yellow-500',
    value: 'text-yellow-600',
  },
}

const iconComponent = computed(() => iconMap[props.icon] || ServerIcon)
const colors = computed(() => colorClasses[props.color] || colorClasses.blue)

const cardClasses = computed(() => colors.value.card)
const iconWrapperClasses = computed(() => colors.value.iconWrapper)
const iconClasses = computed(() => colors.value.icon)
const valueClasses = computed(() => colors.value.value)

const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value || '-'
})
</script>
