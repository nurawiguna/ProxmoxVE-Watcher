<template>
  <div class="space-y-3">
    <div v-if="proxmoxStore.nodes.length === 0" class="text-center py-8">
      <ServerIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500">No baremetal servers found</p>
    </div>
    
    <div
      v-for="node in proxmoxStore.nodes"
      :key="`${node.host_id}-${node.node}`"
      class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <!-- Node header -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-3">
          <div :class="getNodeStatusColor(node.status)" class="w-3 h-3 rounded-full"></div>
          <div>
            <h3 class="font-semibold text-gray-900">{{ node.node }}</h3>
            <p class="text-sm text-gray-500">{{ node.host_name }}</p>
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

      <!-- Expanded content -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 transform -translate-y-2"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-2"
      >
        <div v-if="isNodeExpanded(node)" class="mt-4 pt-4 border-t border-gray-200">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500 font-medium mb-2">Node Information</p>
              <div class="space-y-1">
                <div class="flex justify-between">
                  <span>CPU Model:</span>
                  <span class="font-medium">{{ node.cpuinfo.model || 'N/A' }} x{{ node.cpuinfo.sockets || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Uptime:</span>
                  <span class="font-medium">{{ formatUptime(node.uptime) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>PVE Version:</span>
                  <span class="font-medium">{{ extractPVEVersion(node.pveversion) || 'N/A' }}</span>
                </div>
              </div>
            </div>
            <div>
              <p class="text-gray-500 font-medium mb-2">Resources</p>
              <div class="space-y-1">
                <div class="flex justify-between">
                  <span>CPU Cores:</span>
                  <span class="font-medium">{{ node.maxcpu || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Total Memory:</span>
                  <span class="font-medium">{{ formatBytes(node.maxmem) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Total Disk:</span>
                  <span class="font-medium">{{ formatBytes(node.maxdisk) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { useProxmoxStore } from '@/stores/proxmox'
import { formatBytes, formatPercentage, formatUptime, capitalize } from '@/utils/formatters'
import {
  ServerIcon,
  ChevronDownIcon,
} from '@heroicons/vue/24/outline'

const proxmoxStore = useProxmoxStore()

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

const toggleNodeExpansion = (node) => {
  proxmoxStore.toggleNodeExpansion(node.host_id, node.node)
}

const isNodeExpanded = (node) => {
  return proxmoxStore.isNodeExpanded(node.host_id, node.node)
}

const extractPVEVersion = (pveversion) => {
  if (!pveversion) return null
  // Extract version number from string like "pve-manager/8.0.3/bbf3993334bfa916"
  const match = pveversion.match(/\/(\d+\.\d+\.\d+)\//)
  return match ? match[1] : pveversion
}
</script>
