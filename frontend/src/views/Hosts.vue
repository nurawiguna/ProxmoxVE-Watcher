<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Hosts</h1>
      <p class="text-gray-600 mt-1">
        Manage your Proxmox VE baremetal servers
      </p>
    </div>

    <!-- Hosts list -->
    <div class="space-y-4">
      <div v-if="proxmoxStore.hosts.length === 0" class="text-center py-12">
        <ServerIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No hosts configured</h3>
        <p class="text-gray-500">Configure your Proxmox VE hosts in the backend configuration.</p>
      </div>

      <div
        v-for="host in proxmoxStore.hosts"
        :key="host.id"
        class="card"
      >
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
              <p class="text-sm text-gray-500">VMs</p>
              <p class="font-medium">{{ getHostVMCount(host.id) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProxmoxStore } from '@/stores/proxmox'
import { ServerIcon } from '@heroicons/vue/24/outline'

const proxmoxStore = useProxmoxStore()

const getHostNodeCount = (hostId) => {
  return proxmoxStore.nodes.filter(node => node.host_id === hostId).length
}

const getHostVMCount = (hostId) => {
  const vms = proxmoxStore.vms.filter(vm => vm.host_id === hostId).length
  const containers = proxmoxStore.containers.filter(container => container.host_id === hostId).length
  return vms + containers
}
</script>
