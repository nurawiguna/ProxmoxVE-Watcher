<template>
  <div class="space-y-4">
    <!-- Search input -->
    <div class="relative">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search nodes/baremetal servers..."
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
      />
    </div>

    <!-- Nodes list -->
    <div class="space-y-3">
      <div v-if="filteredNodes.length === 0 && searchQuery" class="text-center py-8">
        <ServerIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">No nodes found matching "{{ searchQuery }}"</p>
      </div>
      
      <div v-else-if="proxmoxStore.nodes.length === 0" class="text-center py-8">
        <ServerIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">No baremetal servers found</p>
      </div>
      
      <div
        v-for="node in filteredNodes"
        :key="`${node.host_id}-${node.node}`"
        :class="[
          'border rounded-lg p-4 transition-all cursor-pointer',
          isNodeSelected(node) 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 hover:shadow-md hover:border-gray-300'
        ]"
        @click="selectNode(node)"
      >
        <!-- Node header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div :class="getNodeStatusColor(node.status)" class="w-3 h-3 rounded-full"></div>
            <div>
              <h3 class="font-semibold text-gray-900 flex items-center">
                {{ node.node }}
                <span v-if="isNodeSelected(node)" class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Selected
                </span>
              </h3>
              <p class="text-sm text-gray-500">{{ node.host_name }}</p>
              <p v-if="isNodeSelected(node)" class="text-xs text-blue-600 mt-1">
                Click to show all VMs
              </p>
              <p v-else class="text-xs text-gray-500 mt-1">
                Click to filter VMs • <router-link to="/hosts" class="text-blue-600 hover:text-blue-800">View details</router-link>
              </p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <span :class="getStatusBadgeColor(node.status)" class="status-badge">
              {{ capitalize(node.status || 'unknown') }}
            </span>
          </div>
        </div>

        <!-- Node stats -->
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-gray-500">CPU</p>
            <p class="font-medium">
              {{ formatPercentage(node.cpu * 100, 100) }}
            </p>
          </div>
          <div>
            <p class="text-gray-500">Memory</p>
            <p class="font-medium">
              {{ formatBytes(node.mem) }} / {{ formatBytes(node.maxmem) }}
            </p>
          </div>
          <div>
            <p class="text-gray-500">Disk</p>
            <p class="font-medium">
              {{ formatBytes(node.disk) }} / {{ formatBytes(node.maxdisk) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProxmoxStore } from '@/stores/proxmox'
import { formatBytes, formatPercentage, capitalize } from '@/utils/formatters'
import {
  ServerIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'

const proxmoxStore = useProxmoxStore()
const searchQuery = ref('')

// Computed property to filter nodes based on search query
const filteredNodes = computed(() => {
  if (!searchQuery.value) {
    return proxmoxStore.nodes
  }
  
  const query = searchQuery.value.toLowerCase()
  return proxmoxStore.nodes.filter(node => 
    node.node?.toLowerCase().includes(query) ||
    node.host_name?.toLowerCase().includes(query)
  )
})

const getNodeStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'online':
      return 'bg-success-500'
    case 'offline':
      return 'bg-danger-500'
    default:
      return 'bg-gray-400'
  }
}

const getStatusBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'online':
      return 'status-running'
    case 'offline':
      return 'status-stopped'
    default:
      return 'status-unknown'
  }
}

const selectNode = (node) => {
  if (isNodeSelected(node)) {
    // If already selected, deselect it
    proxmoxStore.clearNodeFilter()
  } else {
    // Select the node
    proxmoxStore.setSelectedNodeFilter({
      host_id: node.host_id,
      node: node.node,
      host_name: node.host_name
    })
  }
}

const isNodeSelected = (node) => {
  const selected = proxmoxStore.selectedNodeFilter
  return selected && 
         selected.host_id === node.host_id && 
         selected.node === node.node
}
</script>
