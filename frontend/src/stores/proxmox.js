import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { proxmoxApi } from '@/services/api'
import { useNotificationStore } from './notification'

export const useProxmoxStore = defineStore('proxmox', () => {
  // State
  const hosts = ref([])
  const nodes = ref([])
  const vms = ref([])
  const containers = ref([])
  const isLoading = ref(false)
  const lastUpdated = ref(null)
  const searchQuery = ref('')
  const selectedHostId = ref(null)
  const expandedNodes = ref(new Set())
  const filters = ref({
    status: 'all', // all, running, stopped
    type: 'all', // all, vm, container
  })

  // Use notification store
  const notificationStore = useNotificationStore()

  // Getters (computed)
  const totalNodes = computed(() => nodes.value.length)
  
  const totalVMs = computed(() => vms.value.length)
  
  const totalContainers = computed(() => containers.value.length)
  
  const totalVMsRunning = computed(() => 
    vms.value.filter(vm => vm.status === 'running').length
  )
  
  const totalVMsStopped = computed(() => 
    vms.value.filter(vm => vm.status === 'stopped').length
  )
  
  const totalContainersRunning = computed(() => 
    containers.value.filter(container => container.status === 'running').length
  )
  
  const totalContainersStopped = computed(() => 
    containers.value.filter(container => container.status === 'stopped').length
  )

  const filteredVMs = computed(() => {
    let filtered = [...vms.value, ...containers.value]
    
    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.vmid?.toString().includes(query) ||
        item.node?.toLowerCase().includes(query)
      )
    }
    
    // Apply status filter
    if (filters.value.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.value.status)
    }
    
    // Apply type filter
    if (filters.value.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.value.type)
    }
    
    return filtered
  })

  const totalRAMUsage = computed(() => {
    // Calculate total RAM used by all VMs and containers
    const vmRAMUsed = vms.value.reduce((sum, vm) => {
      return sum + (vm.mem || 0)
    }, 0)
    
    const containerRAMUsed = containers.value.reduce((sum, container) => {
      return sum + (container.mem || 0)
    }, 0)
    
    const totalUsed = vmRAMUsed + containerRAMUsed
    
    if (totalUsed === 0) return '0 GB'
    
    // Convert bytes to appropriate unit (GB or TB)
    if (totalUsed >= 1099511627776) { // 1TB in bytes
      return `${(totalUsed / 1099511627776).toFixed(1)} TB`
    } else {
      return `${(totalUsed / 1073741824).toFixed(1)} GB` // 1GB in bytes
    }
  })

  const totalCPUUsage = computed(() => {
    // Calculate total CPU cores used by all VMs and containers
    const vmCores = vms.value.reduce((sum, vm) => {
      return sum + (vm.cpus || vm.maxcpu || 0)
    }, 0)
    
    const containerCores = containers.value.reduce((sum, container) => {
      return sum + (container.cpus || container.maxcpu || 0)
    }, 0)
    
    const totalCores = vmCores + containerCores
    return `${totalCores} Cores`
  })

  const totalDiskUsage = computed(() => {
    // Calculate total disk space used by all VMs and containers
    const vmDiskUsed = vms.value.reduce((sum, vm) => {
      return sum + (vm.disk || 0)
    }, 0)
    
    const containerDiskUsed = containers.value.reduce((sum, container) => {
      return sum + (container.disk || 0)
    }, 0)
    
    const totalUsed = vmDiskUsed + containerDiskUsed
    
    if (totalUsed === 0) return '0 GB'
    
    // Convert bytes to appropriate unit (GB or TB)
    if (totalUsed >= 1099511627776) { // 1TB in bytes
      return `${(totalUsed / 1099511627776).toFixed(1)} TB`
    } else {
      return `${(totalUsed / 1073741824).toFixed(1)} GB` // 1GB in bytes
    }
  })

  // Add new computed for node-level resource usage (for host monitoring)
  const nodeRAMUsage = computed(() => {
    const totalUsed = nodes.value.reduce((sum, node) => {
      return sum + (node.mem?.used || 0)
    }, 0)
    const totalMax = nodes.value.reduce((sum, node) => {
      return sum + (node.mem?.max || 0)
    }, 0)
    
    if (totalMax === 0) return '0%'
    return `${Math.round((totalUsed / totalMax) * 100)}%`
  })

  const nodeCPUUsage = computed(() => {
    const totalUsage = nodes.value.reduce((sum, node) => {
      return sum + (node.cpu || 0)
    }, 0)
    const avgUsage = totalUsage / nodes.value.length || 0
    return `${Math.round(avgUsage * 100)}%`
  })

  const nodeDiskUsage = computed(() => {
    const totalUsed = nodes.value.reduce((sum, node) => {
      return sum + (node.disk?.used || 0)
    }, 0)
    const totalMax = nodes.value.reduce((sum, node) => {
      return sum + (node.disk?.max || 0)
    }, 0)
    
    if (totalMax === 0) return '0%'
    return `${Math.round((totalUsed / totalMax) * 100)}%`
  })

  // Actions
  const initializeApp = async () => {
    isLoading.value = true
    try {
      await Promise.all([
        fetchHosts(),
        fetchAllData()
      ])
      notificationStore.success('Application initialized successfully')
    } catch (error) {
      console.error('Failed to initialize app:', error)
      notificationStore.error('Failed to initialize application')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const fetchHosts = async () => {
    try {
      const response = await proxmoxApi.getHosts()
      hosts.value = response.data
    } catch (error) {
      console.error('Failed to fetch hosts:', error)
      notificationStore.error('Failed to fetch hosts')
      throw error
    }
  }

  const fetchAllData = async () => {
    isLoading.value = true
    try {
      console.log('Fetching all data...')
      const response = await proxmoxApi.getAllData()
      const data = response.data
      
      console.log('Received data:', data)
      nodes.value = data.nodes || []
      vms.value = data.vms || []
      containers.value = data.containers || []
      lastUpdated.value = new Date()
      
      console.log('Data stored:', {
        nodes: nodes.value.length,
        vms: vms.value.length,
        containers: containers.value.length
      })
      
    } catch (error) {
      console.error('Failed to fetch all data:', error)
      notificationStore.error('Failed to fetch system data')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const fetchNodeVMs = async (hostId, node) => {
    try {
      const response = await proxmoxApi.getNodeVMs(hostId, node)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch VMs for node ${node}:`, error)
      notificationStore.error(`Failed to fetch VMs for node ${node}`)
      throw error
    }
  }

  const startVM = async (hostId, node, vmid) => {
    try {
      await proxmoxApi.startVM(hostId, node, vmid)
      notificationStore.success(`VM ${vmid} started successfully`)
      await fetchAllData() // Refresh data
    } catch (error) {
      console.error(`Failed to start VM ${vmid}:`, error)
      notificationStore.error(`Failed to start VM ${vmid}`)
      throw error
    }
  }

  const stopVM = async (hostId, node, vmid) => {
    try {
      await proxmoxApi.stopVM(hostId, node, vmid)
      notificationStore.success(`VM ${vmid} stopped successfully`)
      await fetchAllData() // Refresh data
    } catch (error) {
      console.error(`Failed to stop VM ${vmid}:`, error)
      notificationStore.error(`Failed to stop VM ${vmid}`)
      throw error
    }
  }

  const startContainer = async (hostId, node, vmid) => {
    try {
      await proxmoxApi.startContainer(hostId, node, vmid)
      notificationStore.success(`Container ${vmid} started successfully`)
      await fetchAllData() // Refresh data
    } catch (error) {
      console.error(`Failed to start container ${vmid}:`, error)
      notificationStore.error(`Failed to start container ${vmid}`)
      throw error
    }
  }

  const stopContainer = async (hostId, node, vmid) => {
    try {
      await proxmoxApi.stopContainer(hostId, node, vmid)
      notificationStore.success(`Container ${vmid} stopped successfully`)
      await fetchAllData() // Refresh data
    } catch (error) {
      console.error(`Failed to stop container ${vmid}:`, error)
      notificationStore.error(`Failed to stop container ${vmid}`)
      throw error
    }
  }

  const refreshData = async () => {
    await fetchAllData()
  }

  const toggleNodeExpansion = (hostId, node) => {
    const key = `${hostId}-${node}`
    if (expandedNodes.value.has(key)) {
      expandedNodes.value.delete(key)
    } else {
      expandedNodes.value.add(key)
    }
  }

  const isNodeExpanded = (hostId, node) => {
    return expandedNodes.value.has(`${hostId}-${node}`)
  }

  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  const setFilter = (key, value) => {
    filters.value[key] = value
  }

  const resetFilters = () => {
    filters.value = {
      status: 'all',
      type: 'all',
    }
    searchQuery.value = ''
  }

  return {
    // State
    hosts,
    nodes,
    vms,
    containers,
    isLoading,
    lastUpdated,
    searchQuery,
    selectedHostId,
    expandedNodes,
    filters,
    
    // Getters
    totalNodes,
    totalVMs,
    totalContainers,
    totalVMsRunning,
    totalVMsStopped,
    totalContainersRunning,
    totalContainersStopped,
    filteredVMs,
    totalRAMUsage,
    totalCPUUsage,
    totalDiskUsage,
    nodeRAMUsage,
    nodeCPUUsage,
    nodeDiskUsage,
    
    // Actions
    initializeApp,
    fetchHosts,
    fetchAllData,
    fetchNodeVMs,
    startVM,
    stopVM,
    startContainer,
    stopContainer,
    refreshData,
    toggleNodeExpansion,
    isNodeExpanded,
    setSearchQuery,
    setFilter,
    resetFilters,
  }
})
