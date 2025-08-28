<template>
  <div class="space-y-3">
    <div v-if="vms.length === 0" class="text-center py-8">
      <ComputerDesktopIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500">No virtual machines or containers found</p>
    </div>

    <div
      v-for="vm in vms"
      :key="`${vm.host_id}-${vm.node}-${vm.vmid}`"
      class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <!-- VM header -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-3">
          <div :class="getStatusColor(vm.status)" class="w-3 h-3 rounded-full"></div>
          <component
            :is="getVMIcon(vm.type)"
            class="h-5 w-5 text-gray-500"
          />
          <div>
            <h3 class="font-semibold text-gray-900">{{ vm.name || `VM ${vm.vmid}` }}</h3>
            <p class="text-sm text-gray-500">
              {{ capitalize(vm.type) }} {{ vm.vmid }} on {{ vm.node }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <span :class="getStatusBadgeColor(vm.status)" class="status-badge">
            {{ capitalize(vm.status || 'unknown') }}
          </span>
          
          <!-- VM Actions -->
          <div class="flex items-center space-x-1">
            <button
              v-if="vm.status === 'stopped'"
              @click="startVM(vm)"
              :disabled="isPerformingAction(vm)"
              class="p-2 rounded-md hover:bg-green-50 text-green-600 hover:text-green-700 disabled:opacity-50"
              title="Start VM"
            >
              <PlayIcon class="h-4 w-4" />
            </button>
            
            <button
              v-if="vm.status === 'running'"
              @click="stopVM(vm)"
              :disabled="isPerformingAction(vm)"
              class="p-2 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 disabled:opacity-50"
              title="Stop VM"
            >
              <StopIcon class="h-4 w-4" />
            </button>
            
            <button
              @click="toggleVMExpansion(vm)"
              class="p-2 rounded-md hover:bg-gray-100"
              :title="isVMExpanded(vm) ? 'Collapse' : 'Expand'"
            >
              <ChevronDownIcon
                :class="{ 'rotate-180': isVMExpanded(vm) }"
                class="h-4 w-4 text-gray-400 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- VM stats -->
      <div class="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p class="text-gray-500">CPU</p>
          <p class="font-medium">
            {{ vm.cpu ? formatPercentage(vm.cpu * 100, 100) : 'N/A' }}
          </p>
        </div>
        <div>
          <p class="text-gray-500">Memory</p>
          <p class="font-medium">
            {{ vm.mem ? formatBytes(vm.mem) : 'N/A' }}
            {{ vm.maxmem ? ` / ${formatBytes(vm.maxmem)}` : '' }}
          </p>
        </div>
        <div>
          <p class="text-gray-500">Disk</p>
          <p class="font-medium">
            {{ vm.disk ? formatBytes(vm.disk) : 'N/A' }}
            {{ vm.maxdisk ? ` / ${formatBytes(vm.maxdisk)}` : '' }}
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
        <div v-if="isVMExpanded(vm)" class="mt-4 pt-4 border-t border-gray-200">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500 font-medium mb-2">VM Details</p>
              <div class="space-y-1">
                <div class="flex justify-between">
                  <span>VMID:</span>
                  <span class="font-medium">{{ vm.vmid }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Type:</span>
                  <span class="font-medium">{{ capitalize(vm.type) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Node:</span>
                  <span class="font-medium">{{ vm.node }}</span>
                </div>
                <div v-if="vm.uptime" class="flex justify-between">
                  <span>Uptime:</span>
                  <span class="font-medium">{{ formatUptime(vm.uptime) }}</span>
                </div>
              </div>
            </div>
            <div>
              <p class="text-gray-500 font-medium mb-2">Configuration</p>
              <div class="space-y-1">
                <div v-if="vm.cpus" class="flex justify-between">
                  <span>vCPUs:</span>
                  <span class="font-medium">{{ vm.cpus }}</span>
                </div>
                <div v-if="vm.maxmem" class="flex justify-between">
                  <span>Max Memory:</span>
                  <span class="font-medium">{{ formatBytes(vm.maxmem) }}</span>
                </div>
                <div v-if="vm.maxdisk" class="flex justify-between">
                  <span>Max Disk:</span>
                  <span class="font-medium">{{ formatBytes(vm.maxdisk) }}</span>
                </div>
                <div v-if="vm.netin || vm.netout" class="flex justify-between">
                  <span>Network I/O:</span>
                  <span class="font-medium">
                    ↓{{ formatBytes(vm.netin) }} / ↑{{ formatBytes(vm.netout) }}
                  </span>
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
import { ref } from 'vue'
import { useProxmoxStore } from '@/stores/proxmox'
import { useNotificationStore } from '@/stores/notification'
import { formatBytes, formatPercentage, formatUptime, capitalize } from '@/utils/formatters'
import {
  ComputerDesktopIcon,
  CubeIcon,
  PlayIcon,
  StopIcon,
  ChevronDownIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  vms: {
    type: Array,
    default: () => [],
  },
})

const proxmoxStore = useProxmoxStore()
const notificationStore = useNotificationStore()
const performingActions = ref(new Set())
const expandedVMs = ref(new Set())

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'running':
      return 'bg-success-500'
    case 'stopped':
      return 'bg-danger-500'
    default:
      return 'bg-gray-400'
  }
}

const getStatusBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'running':
      return 'status-running'
    case 'stopped':
      return 'status-stopped'
    default:
      return 'status-unknown'
  }
}

const getVMIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'qemu':
    case 'vm':
      return ComputerDesktopIcon
    case 'lxc':
    case 'container':
      return CubeIcon
    default:
      return ComputerDesktopIcon
  }
}

const getVMKey = (vm) => `${vm.host_id}-${vm.node}-${vm.vmid}`

const isPerformingAction = (vm) => {
  return performingActions.value.has(getVMKey(vm))
}

const isVMExpanded = (vm) => {
  return expandedVMs.value.has(getVMKey(vm))
}

const toggleVMExpansion = (vm) => {
  const key = getVMKey(vm)
  if (expandedVMs.value.has(key)) {
    expandedVMs.value.delete(key)
  } else {
    expandedVMs.value.add(key)
  }
}

const startVM = async (vm) => {
  const key = getVMKey(vm)
  performingActions.value.add(key)
  
  try {
    if (vm.type === 'lxc') {
      await proxmoxStore.startContainer(vm.host_id, vm.node, vm.vmid)
    } else {
      await proxmoxStore.startVM(vm.host_id, vm.node, vm.vmid)
    }
  } catch (error) {
    console.error('Failed to start VM:', error)
  } finally {
    performingActions.value.delete(key)
  }
}

const stopVM = async (vm) => {
  const key = getVMKey(vm)
  performingActions.value.add(key)
  
  try {
    if (vm.type === 'lxc') {
      await proxmoxStore.stopContainer(vm.host_id, vm.node, vm.vmid)
    } else {
      await proxmoxStore.stopVM(vm.host_id, vm.node, vm.vmid)
    }
  } catch (error) {
    console.error('Failed to stop VM:', error)
  } finally {
    performingActions.value.delete(key)
  }
}
</script>
