import { 
  demoHosts, 
  demoNodes, 
  demoVMs, 
  demoContainers, 
  demoSummary,
  generateVariations
} from './demoData.js'

// Simulate network delay for realistic demo experience
const simulateDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Demo API that provides mock responses
export const demoApi = {
  // Hosts endpoints
  getHosts: async () => {
    await simulateDelay()
    return { data: [...demoHosts] }
  },

  // Data endpoints  
  getAllData: async () => {
    await simulateDelay(500)
    // Add some variation to make it feel live
    generateVariations()
    
    return {
      data: {
        nodes: [...demoNodes],
        vms: [...demoVMs],
        containers: [...demoContainers]
      }
    }
  },

  getNodes: async () => {
    await simulateDelay()
    generateVariations()
    return { data: [...demoNodes] }
  },

  getVMs: async () => {
    await simulateDelay()
    generateVariations()
    return { data: [...demoVMs] }
  },

  getContainers: async () => {
    await simulateDelay()
    generateVariations()
    return { data: [...demoContainers] }
  },

  // Node specific endpoints
  getNodeVMs: async (hostId, node) => {
    await simulateDelay()
    const nodeVMs = demoVMs.filter(vm => vm.node === node && vm.hostId === hostId)
    return { data: nodeVMs }
  },

  getNodeContainers: async (hostId, node) => {
    await simulateDelay()
    const nodeContainers = demoContainers.filter(ct => ct.node === node && ct.hostId === hostId)
    return { data: nodeContainers }
  },

  getNodeStatus: async (hostId, node) => {
    await simulateDelay()
    const nodeData = demoNodes.find(n => n.node === node && n.hostId === hostId)
    if (!nodeData) {
      throw new Error(`Node ${node} not found`)
    }
    return { data: nodeData }
  },

  // VM control endpoints (simulate actions)
  startVM: async (hostId, node, vmid) => {
    await simulateDelay(1000)
    const vm = demoVMs.find(v => v.vmid === vmid && v.node === node && v.hostId === hostId)
    if (vm && vm.status === 'stopped') {
      vm.status = 'running'
      vm.pid = Math.floor(Math.random() * 10000) + 1000
      vm.uptime = 0
    }
    return { data: { message: `VM ${vmid} start command sent` } }
  },

  stopVM: async (hostId, node, vmid) => {
    await simulateDelay(1000)
    const vm = demoVMs.find(v => v.vmid === vmid && v.node === node && v.hostId === hostId)
    if (vm && vm.status === 'running') {
      vm.status = 'stopped'
      vm.pid = 0
      vm.uptime = 0
      vm.cpu = 0
      vm.mem = 0
    }
    return { data: { message: `VM ${vmid} stop command sent` } }
  },

  rebootVM: async (hostId, node, vmid) => {
    await simulateDelay(1500)
    const vm = demoVMs.find(v => v.vmid === vmid && v.node === node && v.hostId === hostId)
    if (vm && vm.status === 'running') {
      vm.uptime = 0
    }
    return { data: { message: `VM ${vmid} reboot command sent` } }
  },

  // Container control endpoints (simulate actions)
  startContainer: async (hostId, node, vmid) => {
    await simulateDelay(800)
    const container = demoContainers.find(c => c.vmid === vmid && c.node === node && c.hostId === hostId)
    if (container && container.status === 'stopped') {
      container.status = 'running'
      container.pid = Math.floor(Math.random() * 10000) + 1000
      container.uptime = 0
    }
    return { data: { message: `Container ${vmid} start command sent` } }
  },

  stopContainer: async (hostId, node, vmid) => {
    await simulateDelay(800)
    const container = demoContainers.find(c => c.vmid === vmid && c.node === node && c.hostId === hostId)
    if (container && container.status === 'running') {
      container.status = 'stopped'
      container.pid = 0
      container.uptime = 0
      container.cpu = 0
      container.mem = 0
    }
    return { data: { message: `Container ${vmid} stop command sent` } }
  },

  rebootContainer: async (hostId, node, vmid) => {
    await simulateDelay(1000)
    const container = demoContainers.find(c => c.vmid === vmid && c.node === node && c.hostId === hostId)
    if (container && container.status === 'running') {
      container.uptime = 0
    }
    return { data: { message: `Container ${vmid} reboot command sent` } }
  },

  // Summary endpoints
  getSummary: async () => {
    await simulateDelay()
    // Recalculate summary with current data
    const summary = {
      hosts: {
        total: demoHosts.length,
        online: demoHosts.filter(h => h.status === 'online').length,
        offline: demoHosts.filter(h => h.status === 'offline').length
      },
      nodes: {
        total: demoNodes.length,
        online: demoNodes.filter(n => n.status === 'online').length,
        offline: demoNodes.filter(n => n.status === 'offline').length
      },
      vms: {
        total: demoVMs.length,
        running: demoVMs.filter(vm => vm.status === 'running').length,
        stopped: demoVMs.filter(vm => vm.status === 'stopped').length,
        paused: demoVMs.filter(vm => vm.status === 'paused').length
      },
      containers: {
        total: demoContainers.length,
        running: demoContainers.filter(ct => ct.status === 'running').length,
        stopped: demoContainers.filter(ct => ct.status === 'stopped').length,
        paused: demoContainers.filter(ct => ct.status === 'paused').length
      },
      resources: {
        totalCpu: demoNodes.reduce((acc, node) => acc + node.maxcpu, 0),
        usedCpu: demoNodes.reduce((acc, node) => acc + (node.cpu * node.maxcpu), 0),
        totalMemory: demoNodes.reduce((acc, node) => acc + node.maxmem, 0),
        usedMemory: demoNodes.reduce((acc, node) => acc + node.mem, 0),
        totalDisk: demoNodes.reduce((acc, node) => acc + node.maxdisk, 0),
        usedDisk: demoNodes.reduce((acc, node) => acc + node.disk, 0)
      }
    }
    
    return { data: summary }
  }
}

export default demoApi
