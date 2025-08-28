<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-1">
          Manage and monitor your Proxmox VE infrastructure
        </p>
      </div>
      
      <div class="flex items-center space-x-4">
        <!-- Last updated indicator -->
        <div v-if="proxmoxStore.lastUpdated" class="text-sm text-gray-500">
          Last updated: {{ formatRelativeTime(proxmoxStore.lastUpdated) }}
        </div>
        
        <!-- Stats toggle -->
        <button
          @click="statsVisible = !statsVisible"
          class="btn-secondary"
        >
          {{ statsVisible ? 'Hide' : 'Show' }} Summary
        </button>
      </div>
    </div>

    <!-- Search bar -->
    <div class="relative max-w-md">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search VMs, containers..."
        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    </div>

    <!-- Statistics grid -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 transform -translate-y-4"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform -translate-y-4"
    >
      <div v-show="statsVisible" class="space-y-6">
        <!-- VM & Container Stats -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Infrastructure Overview</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              title="Baremetal Servers"
              :value="proxmoxStore.totalNodes"
              icon="server"
              color="blue"
            />
            <StatCard
              title="Virtual Machines"
              :value="proxmoxStore.totalVMs"
              icon="computer-desktop"
              color="green"
            />
            <StatCard
              title="VMs Running"
              :value="proxmoxStore.totalVMsRunning"
              icon="play"
              color="emerald"
            />
            <StatCard
              title="VMs Stopped"
              :value="proxmoxStore.totalVMsStopped"
              icon="stop"
              color="red"
            />
            <StatCard
              title="Containers"
              :value="proxmoxStore.totalContainers"
              icon="cube"
              color="purple"
            />
            <StatCard
              title="Containers Running"
              :value="proxmoxStore.totalContainersRunning"
              icon="play-circle"
              color="teal"
            />
            <StatCard
              title="Containers Stopped"
              :value="proxmoxStore.totalContainersStopped"
              icon="stop-circle"
              color="orange"
            />
          </div>
        </div>

        <!-- Resource Usage Stats -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">VM & Container Resource Usage</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total RAM Allocated"
              :value="proxmoxStore.totalRAMUsage"
              icon="memory"
              color="indigo"
            />
            <StatCard
              title="Total CPU Cores Allocated"
              :value="proxmoxStore.totalCPUUsage"
              icon="cpu"
              color="pink"
            />
            <StatCard
              title="Total Disk Space Allocated"
              :value="proxmoxStore.totalDiskUsage"
              icon="hard-drive"
              color="yellow"
            />
          </div>
        </div>

        <!-- Node Performance Stats -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Physical Server Performance</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Node CPU Usage"
              :value="proxmoxStore.nodeCPUUsage"
              icon="cpu"
              color="red"
            />
            <StatCard
              title="Node RAM Usage"
              :value="proxmoxStore.nodeRAMUsage"
              icon="memory"
              color="blue"
            />
            <StatCard
              title="Node Disk Usage"
              :value="proxmoxStore.nodeDiskUsage"
              icon="hard-drive"
              color="green"
            />
          </div>
        </div>
      </div>
    </transition>

    <!-- Main content grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Baremetal Servers Panel -->
      <div class="card">
        <div class="card-header">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center">
              <ServerIcon class="h-5 w-5 mr-2 text-blue-600" />
              Baremetal Servers
            </h2>
            <button
              @click="serversVisible = !serversVisible"
              class="btn-secondary text-sm"
            >
              {{ serversVisible ? 'Hide' : 'Show' }} List
            </button>
          </div>
        </div>
        
        <div class="card-body" v-show="serversVisible">
          <HostsList />
        </div>
      </div>

      <!-- Virtual Machines & Containers Panel -->
      <div class="card">
        <div class="card-header">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center">
              <ComputerDesktopIcon class="h-5 w-5 mr-2 text-blue-600" />
              Virtual Machines & Containers
            </h2>
            <button
              @click="vmsVisible = !vmsVisible"
              class="btn-secondary text-sm"
            >
              {{ vmsVisible ? 'Hide' : 'Show' }} List
            </button>
          </div>
        </div>
        
        <div class="card-body" v-show="vmsVisible">
          <!-- Filters -->
          <div class="flex flex-wrap gap-2 mb-4">
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
          
          <VMList :vms="filteredVMs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProxmoxStore } from '@/stores/proxmox'
import { formatRelativeTime } from '@/utils/formatters'
import {
  MagnifyingGlassIcon,
  ServerIcon,
  ComputerDesktopIcon,
  ListBulletIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/vue/24/outline'
import StatCard from '@/components/StatCard.vue'
import HostsList from '@/components/HostsList.vue'
import VMList from '@/components/VMList.vue'

const proxmoxStore = useProxmoxStore()

// Local state
const statsVisible = ref(true)
const serversVisible = ref(true)
const vmsVisible = ref(true)
const searchQuery = ref('')
const statusFilter = ref('all')

// Status filter options
const statusFilters = [
  { value: 'all', label: 'All', icon: ListBulletIcon },
  { value: 'running', label: 'Running', icon: PlayIcon },
  { value: 'stopped', label: 'Stopped', icon: StopIcon },
]

// Computed properties
const filteredVMs = computed(() => {
  let vms = [...proxmoxStore.vms, ...proxmoxStore.containers]
  
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

// Methods
const setStatusFilter = (filter) => {
  statusFilter.value = filter
}

// Watch search query and update store
watch(searchQuery, (newQuery) => {
  proxmoxStore.setSearchQuery(newQuery)
})
</script>
