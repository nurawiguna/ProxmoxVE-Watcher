<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Virtual Machines</h1>
      <p class="text-gray-600 mt-1">
        Manage your Proxmox VE virtual machines
      </p>
    </div>

    <!-- Search and filters -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative flex-1 max-w-md">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search virtual machines..."
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>
      
      <div class="flex gap-2">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          @click="setStatusFilter(filter.value)"
          :class="[
            'btn text-sm',
            statusFilter === filter.value ? 'btn-primary' : 'btn-secondary'
          ]"
        >
          <component :is="filter.icon" class="h-4 w-4 mr-1" />
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- VM List -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-lg font-semibold text-gray-900">
          Virtual Machines ({{ filteredVMs.length }})
        </h2>
      </div>
      <div class="card-body">
        <VMList :vms="filteredVMs" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProxmoxStore } from '@/stores/proxmox'
import VMList from '@/components/VMList.vue'
import {
  MagnifyingGlassIcon,
  ListBulletIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/vue/24/outline'

const proxmoxStore = useProxmoxStore()
const searchQuery = ref('')
const statusFilter = ref('all')

const statusFilters = [
  { value: 'all', label: 'All', icon: ListBulletIcon },
  { value: 'running', label: 'Running', icon: PlayIcon },
  { value: 'stopped', label: 'Stopped', icon: StopIcon },
]

const filteredVMs = computed(() => {
  let vms = proxmoxStore.vms
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    vms = vms.filter(vm =>
      vm.name?.toLowerCase().includes(query) ||
      vm.vmid?.toString().includes(query) ||
      vm.node?.toLowerCase().includes(query)
    )
  }
  
  // Apply status filter
  if (statusFilter.value !== 'all') {
    vms = vms.filter(vm => vm.status === statusFilter.value)
  }
  
  return vms
})

const setStatusFilter = (filter) => {
  statusFilter.value = filter
}
</script>
