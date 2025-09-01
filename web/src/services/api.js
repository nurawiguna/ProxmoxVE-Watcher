import axios from 'axios'

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: '/api', // Will be proxied to API by Vite
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed in the future
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data)
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.message)
    } else {
      // Something else happened
      console.error('Request Error:', error.message)
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const proxmoxApi = {
  // Hosts endpoints
  getHosts: () => apiClient.get('/hosts'),
  
  // Data endpoints
  getAllData: async () => {
    try {
      console.log('getAllData: Starting to fetch all data')
      // Get hosts first
      const hostsResponse = await apiClient.get('/hosts')
      const hosts = hostsResponse.data
      console.log('getAllData: Got hosts:', hosts)
      
      // Collect all data from all hosts
      const allNodes = []
      const allVMs = []
      const allContainers = []
      
      for (const host of hosts) {
        try {
          console.log(`getAllData: Processing host ${host.name} (${host.id})`)
          // Get nodes for this host
          const nodesResponse = await apiClient.get(`/hosts/${host.id}/nodes`)
          const nodes = nodesResponse.data
          console.log(`getAllData: Got ${nodes.length} nodes for host ${host.name}`)
          
          // Get detailed status for each node
          for (const node of nodes) {
            try {
              const statusResponse = await apiClient.get(`/hosts/${host.id}/nodes/${node.node}/status`)
              // Merge status data into node object
              Object.assign(node, statusResponse.data)
              console.log(`getAllData: Got status for ${host.name}/${node.node}`)
            } catch (error) {
              console.warn(`Failed to get status for ${host.name}/${node.node}:`, error.message)
            }
          }
          
          allNodes.push(...nodes)
          
          // Get VMs and containers for each node
          for (const node of nodes) {
            try {
              console.log(`getAllData: Getting VMs/containers for ${host.name}/${node.node}`)
              const [vmsResponse, containersResponse] = await Promise.all([
                apiClient.get(`/hosts/${host.id}/nodes/${node.node}/vms`),
                apiClient.get(`/hosts/${host.id}/nodes/${node.node}/containers`)
              ])
              console.log(`getAllData: Got ${vmsResponse.data.length} VMs and ${containersResponse.data.length} containers`)
              allVMs.push(...vmsResponse.data)
              allContainers.push(...containersResponse.data)
            } catch (error) {
              console.warn(`Failed to get VMs/containers for ${host.name}/${node.node}:`, error.message)
            }
          }
        } catch (error) {
          console.warn(`Failed to get data for host ${host.name}:`, error.message)
        }
      }
      
      console.log('getAllData: Final counts:', {
        nodes: allNodes.length,
        vms: allVMs.length,
        containers: allContainers.length
      })
      
      return {
        data: {
          nodes: allNodes,
          vms: allVMs,
          containers: allContainers
        }
      }
    } catch (error) {
      console.error('getAllData: Error:', error)
      throw error
    }
  },
  getNodes: async () => {
    const hostsResponse = await apiClient.get('/hosts')
    const hosts = hostsResponse.data
    const allNodes = []
    
    for (const host of hosts) {
      try {
        const response = await apiClient.get(`/hosts/${host.id}/nodes`)
        allNodes.push(...response.data)
      } catch (error) {
        console.warn(`Failed to get nodes for host ${host.name}:`, error.message)
      }
    }
    
    return { data: allNodes }
  },
  getVMs: async () => {
    const hostsResponse = await apiClient.get('/hosts')
    const hosts = hostsResponse.data
    const allVMs = []
    
    for (const host of hosts) {
      try {
        const nodesResponse = await apiClient.get(`/hosts/${host.id}/nodes`)
        const nodes = nodesResponse.data
        
        for (const node of nodes) {
          try {
            const response = await apiClient.get(`/hosts/${host.id}/nodes/${node.node}/vms`)
            allVMs.push(...response.data)
          } catch (error) {
            console.warn(`Failed to get VMs for ${host.name}/${node.node}:`, error.message)
          }
        }
      } catch (error) {
        console.warn(`Failed to get nodes for host ${host.name}:`, error.message)
      }
    }
    
    return { data: allVMs }
  },
  getContainers: async () => {
    const hostsResponse = await apiClient.get('/hosts')
    const hosts = hostsResponse.data
    const allContainers = []
    
    for (const host of hosts) {
      try {
        const nodesResponse = await apiClient.get(`/hosts/${host.id}/nodes`)
        const nodes = nodesResponse.data
        
        for (const node of nodes) {
          try {
            const response = await apiClient.get(`/hosts/${host.id}/nodes/${node.node}/containers`)
            allContainers.push(...response.data)
          } catch (error) {
            console.warn(`Failed to get containers for ${host.name}/${node.node}:`, error.message)
          }
        }
      } catch (error) {
        console.warn(`Failed to get nodes for host ${host.name}:`, error.message)
      }
    }
    
    return { data: allContainers }
  },
  
  // Node specific endpoints
  getNodeVMs: (hostId, node) => apiClient.get(`/hosts/${hostId}/nodes/${node}/vms`),
  getNodeContainers: (hostId, node) => apiClient.get(`/hosts/${hostId}/nodes/${node}/containers`),
  getNodeStatus: (hostId, node) => apiClient.get(`/hosts/${hostId}/nodes/${node}/status`),
  
  // VM control endpoints
  startVM: (hostId, node, vmid) => apiClient.post(`/hosts/${hostId}/nodes/${node}/vms/${vmid}/start`),
  stopVM: (hostId, node, vmid) => apiClient.post(`/hosts/${hostId}/nodes/${node}/vms/${vmid}/stop`),
  rebootVM: (hostId, node, vmid) => apiClient.post(`/hosts/${hostId}/nodes/${node}/vms/${vmid}/reboot`),
  
  // Container control endpoints
  startContainer: (hostId, node, vmid) => apiClient.post(`/hosts/${hostId}/nodes/${node}/containers/${vmid}/start`),
  stopContainer: (hostId, node, vmid) => apiClient.post(`/hosts/${hostId}/nodes/${node}/containers/${vmid}/stop`),
  rebootContainer: (hostId, node, vmid) => apiClient.post(`/hosts/${hostId}/nodes/${node}/containers/${vmid}/reboot`),
  
  // Summary endpoints
  getSummary: () => apiClient.get('/summary'),
}

export default apiClient
