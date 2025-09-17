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

    <!-- Sort controls -->
    <div class="flex items-center space-x-3">
      <span class="text-sm text-gray-600 font-medium">Sort by:</span>
      <button
        @click="toggleSort('name')"
        :class="[
          'flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          sortField === 'name' 
            ? 'bg-blue-100 text-blue-700 border border-blue-300' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
        ]"
        title="Sort by name"
      >
        <span>Name</span>
        <component
          :is="getSortIconComponent('name')"
          class="h-4 w-4"
        />
      </button>
      <button
        @click="toggleSort('vmid')"
        :class="[
          'flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          sortField === 'vmid' 
            ? 'bg-blue-100 text-blue-700 border border-blue-300' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
        ]"
        title="Sort by VM ID"
      >
        <span>ID</span>
        <component
          :is="getSortIconComponent('vmid')"
          class="h-4 w-4"
        />
      </button>
      <button
        @click="toggleSort('uptime')"
        :class="[
          'flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          sortField === 'uptime' 
            ? 'bg-blue-100 text-blue-700 border border-blue-300' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
        ]"
        title="Sort by uptime"
      >
        <span>Uptime</span>
        <component
          :is="getSortIconComponent('uptime')"
          class="h-4 w-4"
        />
      </button>
    </div>

    <!-- VM List -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-lg font-semibold text-gray-900">
          Virtual Machines ({{ sortedFilteredVMs.length }})
        </h2>
      </div>
      <div class="card-body">
        <VMList :vms="sortedFilteredVMs" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProxmoxStore } from '@/stores/proxmox'
import { useSorting } from '@/composables/useSorting'
import VMList from '@/components/VMList.vue'
import {
  MagnifyingGlassIcon,
  ListBulletIcon,
  PlayIcon,
  StopIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
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
  let vms = proxmoxStore.vms.map(vm => ({
    ...vm,
    name: vm.name || `VM ${vm.vmid}`
  }))
  
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

// Sorting functionality
const { sortedData: sortedFilteredVMs, sortField, sortDirection, toggleSort } = useSorting(filteredVMs, 'name', 'asc')

// Get sort icon component based on current sort state
const getSortIconComponent = (field) => {
  if (sortField.value === field) {
    return sortDirection.value === 'asc' ? Bars3BottomLeftIcon : Bars3BottomRightIcon
  }
  return Bars3BottomLeftIcon
}

const setStatusFilter = (filter) => {
  statusFilter.value = filter
}
</script>
