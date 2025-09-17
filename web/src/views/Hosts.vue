<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Hosts</h1>
      <p class="text-gray-600 mt-1">
        Manage your Proxmox VE baremetal servers and nodes
      </p>
    </div>

    <!-- Search bar -->
    <div class="relative max-w-md">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search hosts, nodes..."
        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
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

    <!-- Hosts list -->
    <div class="space-y-6">
      <div v-if="sortedFilteredHosts.length === 0 && searchQuery" class="text-center py-12">
        <ServerIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No hosts found</h3>
        <p class="text-gray-500">No hosts or nodes found matching "{{ searchQuery }}"</p>
      </div>
      
      <div v-else-if="proxmoxStore.hosts.length === 0" class="text-center py-12">
        <ServerIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No hosts configured</h3>
        <p class="text-gray-500">Configure your Proxmox VE hosts in the api configuration.</p>
      </div>

      <!-- Host details with nodes -->
      <div
        v-for="host in sortedFilteredHosts"
        :key="host.id"
        class="space-y-4"
      >
        <!-- Host header card -->
        <div class="card">
          <div class="card-header">
            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ host.name }}</h3>
                  <p class="text-sm text-gray-500">{{ host.host }}</p>
                </div>
              </div>
              
              <span class="status-running">Connected</span>
            </div>
          </div>
          
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="text-center">
                <p class="text-sm text-gray-500">User</p>
                <p class="font-medium">{{ host.user }}</p>
              </div>
              <div class="text-center">
                <p class="text-sm text-gray-500">SSL Verification</p>
                <p class="font-medium">{{ host.verify_ssl ? 'Enabled' : 'Disabled' }}</p>
              </div>
              <div class="text-center">
                <p class="text-sm text-gray-500">Nodes</p>
                <p class="font-medium">{{ getHostNodeCount(host.id) }}</p>
              </div>
              <div class="text-center">
                <p class="text-sm text-gray-500">VMs & Containers</p>
                <p class="font-medium">{{ getHostVMCount(host.id) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Nodes list for this host -->
        <div class="ml-6 space-y-3">
          <h4 class="text-md font-medium text-gray-700 flex items-center">
            <ServerIcon class="h-4 w-4 mr-2" />
            Nodes ({{ getFilteredHostNodes(host.id).length }})
          </h4>
          
          <div v-if="getFilteredHostNodes(host.id).length === 0" class="text-sm text-gray-500 ml-6">
            {{ searchQuery ? `No nodes found matching "${searchQuery}"` : 'No nodes found for this host' }}
          </div>

          <div
            v-for="node in getFilteredHostNodes(host.id)"
            :key="`${node.host_id}-${node.node}`"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <!-- Node header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div :class="getNodeStatusColor(node.status)" class="w-3 h-3 rounded-full"></div>
                <div>
                  <h5 class="font-semibold text-gray-900">{{ node.node }}</h5>
                  <p class="text-sm text-gray-500">{{ host.name }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <span :class="getStatusBadgeColor(node.status)" class="status-badge">
                  {{ capitalize(node.status || 'unknown') }}
                </span>
                <button
                  @click="toggleNodeExpansion(node)"
                  class="p-1 rounded-md hover:bg-gray-100"
                  :title="isNodeExpanded(node) ? 'Collapse' : 'Expand'"
                >
                  <ChevronDownIcon
                    :class="{ 'rotate-180': isNodeExpanded(node) }"
                    class="h-5 w-5 text-gray-400 transition-transform"
                  />
                </button>
              </div>
            </div>

            <!-- Node basic stats -->
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-gray-500">CPU Usage</p>
                <p class="font-medium">
                  {{ formatPercentage(node.cpu * 100, 100) }}
                </p>
              </div>
              <div>
                <p class="text-gray-500">Memory Usage</p>
                <p class="font-medium">
                  {{ formatBytes(node.mem) }} / {{ formatBytes(node.maxmem) }}
                  <span class="text-xs text-gray-400">
                    ({{ formatPercentage((node.mem / node.maxmem) * 100, 100) }})
                  </span>
                </p>
              </div>
              <div>
                <p class="text-gray-500">Disk Usage</p>
                <p class="font-medium">
                  {{ formatBytes(node.disk) }} / {{ formatBytes(node.maxdisk) }}
                  <span class="text-xs text-gray-400">
                    ({{ formatPercentage((node.disk / node.maxdisk) * 100, 100) }})
                  </span>
                </p>
              </div>
            </div>

            <!-- Expanded node details -->
            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 transform -translate-y-2"
              enter-to-class="opacity-100 transform translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 transform translate-y-0"
              leave-to-class="opacity-0 transform -translate-y-2"
            >
              <div v-if="isNodeExpanded(node)" class="mt-4 pt-4 border-t border-gray-200">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
                  <!-- System Information -->
                  <div>
                    <p class="text-gray-500 font-medium mb-3 flex items-center">
                      <CpuChipIcon class="h-4 w-4 mr-1" />
                      System Information
                    </p>
                    <div class="space-y-2">
                      <div class="flex justify-between">
                        <span class="text-gray-600">CPU Model:</span>
                        <span class="font-medium text-right max-w-[200px] truncate" :title="node.cpuinfo?.model">
                          {{ node.cpuinfo?.model || 'N/A' }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">CPU Sockets:</span>
                        <span class="font-medium">{{ node.cpuinfo?.sockets || 0 }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">CPU Cores:</span>
                        <span class="font-medium">{{ node.maxcpu || 'N/A' }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Uptime:</span>
                        <span class="font-medium">{{ formatUptime(node.uptime) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">PVE Version:</span>
                        <span class="font-medium">{{ extractPVEVersion(node.pveversion) || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Resource Details -->
                  <div>
                    <p class="text-gray-500 font-medium mb-3 flex items-center">
                      <CircleStackIcon class="h-4 w-4 mr-1" />
                      Resource Details
                    </p>
                    <div class="space-y-2">
                      <div class="flex justify-between">
                        <span class="text-gray-600">Total Memory:</span>
                        <span class="font-medium">{{ formatBytes(node.maxmem) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Used Memory:</span>
                        <span class="font-medium">{{ formatBytes(node.mem) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Free Memory:</span>
                        <span class="font-medium">{{ formatBytes(node.maxmem - node.mem) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Total Disk:</span>
                        <span class="font-medium">{{ formatBytes(node.maxdisk) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Used Disk:</span>
                        <span class="font-medium">{{ formatBytes(node.disk) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Free Disk:</span>
                        <span class="font-medium">{{ formatBytes(node.maxdisk - node.disk) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- VMs on this Node -->
                  <div>
                    <p class="text-gray-500 font-medium mb-3 flex items-center">
                      <ComputerDesktopIcon class="h-4 w-4 mr-1" />
                      VMs & Containers ({{ getNodeVMCount(node) }})
                    </p>
                    <div class="space-y-1 max-h-48 overflow-y-auto">
                      <div 
                        v-for="vm in getNodeVMs(node)" 
                        :key="`${vm.host_id}-${vm.node}-${vm.vmid}`"
                        class="flex justify-between items-center p-2 bg-gray-50 rounded text-xs"
                      >
                        <div>
                          <span class="font-medium">{{ vm.name || `${vm.type.toUpperCase()} ${vm.vmid}` }}</span>
                          <span class="text-gray-500 ml-1">({{ vm.vmid }})</span>
                        </div>
                        <span :class="getVMStatusColor(vm.status)" class="px-2 py-1 rounded-full text-xs">
                          {{ capitalize(vm.status || 'unknown') }}
                        </span>
                      </div>
                      <div v-if="getNodeVMs(node).length === 0" class="text-xs text-gray-500 italic">
                        No VMs or containers on this node
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProxmoxStore } from '@/stores/proxmox'
import { useSorting } from '@/composables/useSorting'
import { formatBytes, formatPercentage, formatUptime, capitalize } from '@/utils/formatters'
import { 
  ServerIcon, 
  ChevronDownIcon,
  CpuChipIcon,
  CircleStackIcon,
  ComputerDesktopIcon,
  MagnifyingGlassIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
} from '@heroicons/vue/24/outline'

const proxmoxStore = useProxmoxStore()
const expandedNodes = ref(new Set())
const searchQuery = ref('')

// Computed property to filter hosts and their nodes based on search query
const filteredHosts = computed(() => {
  if (!searchQuery.value) {
    return proxmoxStore.hosts
  }
  
  const query = searchQuery.value.toLowerCase()
  return proxmoxStore.hosts.filter(host => {
    // Check if host name or host address matches
    const hostMatches = host.name?.toLowerCase().includes(query) ||
                       host.host?.toLowerCase().includes(query)
    
    // Check if any node in this host matches
    const nodeMatches = proxmoxStore.nodes.some(node => 
      node.host_id === host.id && (
        node.node?.toLowerCase().includes(query) ||
        node.host_name?.toLowerCase().includes(query)
      )
    )
    
    return hostMatches || nodeMatches
  })
})

// Sorting functionality
const { sortedData: sortedFilteredHosts, sortField, sortDirection, toggleSort } = useSorting(filteredHosts, 'name', 'asc')

// Get sort icon component based on current sort state
const getSortIconComponent = (field) => {
  if (sortField.value === field) {
    return sortDirection.value === 'asc' ? Bars3BottomLeftIcon : Bars3BottomRightIcon
  }
  return Bars3BottomLeftIcon
}

// Filter nodes for a specific host based on search query
const getFilteredHostNodes = (hostId) => {
  const allNodesForHost = proxmoxStore.nodes.filter(node => node.host_id === hostId)
  
  if (!searchQuery.value) {
    return allNodesForHost
  }
  
  const query = searchQuery.value.toLowerCase()
  return allNodesForHost.filter(node => 
    node.node?.toLowerCase().includes(query) ||
    node.host_name?.toLowerCase().includes(query)
  )
}

const getHostNodeCount = (hostId) => {
  return proxmoxStore.nodes.filter(node => node.host_id === hostId).length
}

const getHostVMCount = (hostId) => {
  const vms = proxmoxStore.vms.filter(vm => vm.host_id === hostId).length
  const containers = proxmoxStore.containers.filter(container => container.host_id === hostId).length
  return vms + containers
}

const getHostNodes = (hostId) => {
  return proxmoxStore.nodes.filter(node => node.host_id === hostId)
}

const getNodeVMCount = (node) => {
  const vms = proxmoxStore.vms.filter(vm => vm.host_id === node.host_id && vm.node === node.node).length
  const containers = proxmoxStore.containers.filter(container => container.host_id === node.host_id && container.node === node.node).length
  return vms + containers
}

const getNodeVMs = (node) => {
  const vms = proxmoxStore.vms.filter(vm => vm.host_id === node.host_id && vm.node === node.node)
  const containers = proxmoxStore.containers.filter(container => container.host_id === node.host_id && container.node === node.node)
  return [...vms, ...containers].sort((a, b) => a.vmid - b.vmid)
}

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

const getVMStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'running':
      return 'bg-green-100 text-green-800'
    case 'stopped':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const toggleNodeExpansion = (node) => {
  const key = `${node.host_id}-${node.node}`
  if (expandedNodes.value.has(key)) {
    expandedNodes.value.delete(key)
  } else {
    expandedNodes.value.add(key)
  }
}

const isNodeExpanded = (node) => {
  return expandedNodes.value.has(`${node.host_id}-${node.node}`)
}

const extractPVEVersion = (pveversion) => {
  if (!pveversion) return null
  // Extract version number from strings like:
  // "pve-manager/8.0.3/bbf3993334bfa916" -> "8.0.3"
  // "pve-manager/7.3-3/c3928077" -> "7.3-3"
  const match = pveversion.match(/\/(\d+\.\d+[.-]\d+)\//)
  return match ? match[1] : pveversion
}
</script>
