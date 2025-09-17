// Demo data for Proxmox VE Watcher
// This provides realistic dummy data for preview purposes

export const demoHosts = [
  {
    id: 'demo-host-1',
    name: 'proxmox-prod-01',
    host: '192.168.1.100',
    port: 8006,
    user: 'root@pam',
    status: 'online',
    version: '8.0.4',
    subscription: 'enterprise'
  },
  {
    id: 'demo-host-2', 
    name: 'proxmox-prod-02',
    host: '192.168.1.101',
    port: 8006,
    user: 'root@pam',
    status: 'online',
    version: '8.0.3',
    subscription: 'community'
  },
  {
    id: 'demo-host-3',
    name: 'proxmox-backup-01',
    host: '192.168.1.102',
    port: 8006,
    user: 'root@pam',
    status: 'online',
    version: '7.4.17',
    subscription: 'enterprise'
  },
  {
    id: 'demo-host-4',
    name: 'proxmox-backup-02',
    host: '192.168.1.103',
    port: 8006,
    user: 'root@pam',
    status: 'offline',
    version: '7.4.17',
    subscription: 'enterprise'
  }
]

export const demoNodes = [
  {
    node: 'proxmox-prod-01',
    status: 'online',
    cpu: 0.24,
    maxcpu: 24,
    mem: 17179869184, // 16GB used
    maxmem: 68719476736, // 64GB total
    disk: 85899345920, // 80GB used
    maxdisk: 1099511627776, // 1TB total
    uptime: 2592000, // 30 days
    loadavg: [0.45, 0.38, 0.42],
    version: '8.0.4',
    hostId: 'demo-host-1',
    type: 'node'
  },
  {
    node: 'proxmox-prod-02',
    status: 'online',
    cpu: 0.18,
    maxcpu: 32,
    mem: 21474836480, // 20GB used
    maxmem: 137438953472, // 128GB total
    disk: 161061273600, // 150GB used
    maxdisk: 2199023255552, // 2TB total
    uptime: 1814400, // 21 days
    loadavg: [0.28, 0.31, 0.35],
    version: '8.0.3',
    hostId: 'demo-host-2',
    type: 'node'
  },
  {
    node: 'proxmox-backup-01',
    status: 'online',
    cpu: 0.05,
    maxcpu: 16,
    mem: 4294967296, // 4GB used
    maxmem: 34359738368, // 32GB total
    disk: 322122547200, // 300GB used
    maxdisk: 5497558138880, // 5TB total
    uptime: 86400, // 1 day
    loadavg: [0.12, 0.08, 0.10],
    version: '7.4.17',
    hostId: 'demo-host-3',
    type: 'node'
  },
  {
    node: 'proxmox-backup-02',
    status: 'offline',
    cpu: 0.05,
    maxcpu: 16,
    mem: 4294967296, // 4GB used
    maxmem: 34359738368, // 32GB total
    disk: 322122547200, // 300GB used
    maxdisk: 5497558138880, // 5TB total
    uptime: 86400, // 1 day
    loadavg: [0.12, 0.08, 0.10],
    version: '7.4.17',
    hostId: 'demo-host-4',
    type: 'node'
  }
]

export const demoVMs = [
  {
    vmid: 100,
    name: 'web-server-01',
    status: 'running',
    cpu: 0.15,
    maxcpu: 4,
    mem: 2147483648, // 2GB
    maxmem: 8589934592, // 8GB
    disk: 0,
    maxdisk: 107374182400, // 100GB
    pid: 1234,
    uptime: 604800, // 7 days
    node: 'proxmox-prod-01',
    hostId: 'demo-host-1',
    template: 0,
    tags: 'production,web',
    ostype: 'ubuntu'
  },
  {
    vmid: 101,
    name: 'database-server',
    status: 'running',
    cpu: 0.32,
    maxcpu: 8,
    mem: 16106127360, // 15GB
    maxmem: 17179869184, // 16GB
    disk: 0,
    maxdisk: 536870912000, // 500GB
    pid: 5678,
    uptime: 1209600, // 14 days
    node: 'proxmox-prod-01',
    hostId: 'demo-host-1',
    template: 0,
    tags: 'production,database',
    ostype: 'ubuntu'
  },
  {
    vmid: 102,
    name: 'app-server-01',
    status: 'running',
    cpu: 0.22,
    maxcpu: 6,
    mem: 6442450944, // 6GB
    maxmem: 12884901888, // 12GB
    disk: 0,
    maxdisk: 214748364800, // 200GB
    pid: 9012,
    uptime: 432000, // 5 days
    node: 'proxmox-prod-02',
    hostId: 'demo-host-2',
    template: 0,
    tags: 'production,application',
    ostype: 'centos'
  },
  {
    vmid: 103,
    name: 'dev-environment',
    status: 'stopped',
    cpu: 0,
    maxcpu: 2,
    mem: 0,
    maxmem: 4294967296, // 4GB
    disk: 0,
    maxdisk: 53687091200, // 50GB
    pid: 0,
    uptime: 0,
    node: 'proxmox-prod-02',
    hostId: 'demo-host-2',
    template: 0,
    tags: 'development',
    ostype: 'ubuntu'
  },
  {
    vmid: 104,
    name: 'backup-vm',
    status: 'running',
    cpu: 0.08,
    maxcpu: 2,
    mem: 2147483648, // 2GB
    maxmem: 4294967296, // 4GB
    disk: 0,
    maxdisk: 1073741824000, // 1TB
    pid: 3456,
    uptime: 86400, // 1 day
    node: 'proxmox-backup-01',
    hostId: 'demo-host-3',
    template: 0,
    tags: 'backup,utility',
    ostype: 'debian'
  }
]

export const demoContainers = [
  {
    vmid: 200,
    name: 'nginx-proxy',
    status: 'running',
    cpu: 0.05,
    maxcpu: 2,
    mem: 268435456, // 256MB
    maxmem: 1073741824, // 1GB
    disk: 1073741824, // 1GB used
    maxdisk: 10737418240, // 10GB
    pid: 7890,
    uptime: 1814400, // 21 days
    node: 'proxmox-prod-01',
    hostId: 'demo-host-1',
    template: 0,
    tags: 'production,proxy',
    ostype: 'alpine'
  },
  {
    vmid: 201,
    name: 'redis-cache',
    status: 'running',
    cpu: 0.12,
    maxcpu: 2,
    mem: 536870912, // 512MB
    maxmem: 2147483648, // 2GB
    disk: 2147483648, // 2GB used
    maxdisk: 21474836480, // 20GB
    pid: 2345,
    uptime: 604800, // 7 days
    node: 'proxmox-prod-01',
    hostId: 'demo-host-1',
    template: 0,
    tags: 'production,cache',
    ostype: 'alpine'
  },
  {
    vmid: 202,
    name: 'monitoring-stack',
    status: 'running',
    cpu: 0.18,
    maxcpu: 4,
    mem: 3221225472, // 3GB
    maxmem: 4294967296, // 4GB
    disk: 5368709120, // 5GB used
    maxdisk: 53687091200, // 50GB
    pid: 6789,
    uptime: 1209600, // 14 days
    node: 'proxmox-prod-02',
    hostId: 'demo-host-2',
    template: 0,
    tags: 'production,monitoring',
    ostype: 'ubuntu'
  },
  {
    vmid: 203,
    name: 'test-container',
    status: 'stopped',
    cpu: 0,
    maxcpu: 1,
    mem: 0,
    maxmem: 536870912, // 512MB
    disk: 1073741824, // 1GB used
    maxdisk: 10737418240, // 10GB
    pid: 0,
    uptime: 0,
    node: 'proxmox-prod-02',
    hostId: 'demo-host-2',
    template: 0,
    tags: 'testing',
    ostype: 'debian'
  },
  {
    vmid: 204,
    name: 'log-collector',
    status: 'running',
    cpu: 0.07,
    maxcpu: 2,
    mem: 805306368, // 768MB
    maxmem: 2147483648, // 2GB
    disk: 3221225472, // 3GB used
    maxdisk: 32212254720, // 30GB
    pid: 4567,
    uptime: 432000, // 5 days
    node: 'proxmox-backup-01',
    hostId: 'demo-host-3',
    template: 0,
    tags: 'logging,utility',
    ostype: 'centos'
  }
]

// Generate summary statistics from demo data
export const demoSummary = {
  hosts: {
    total: demoHosts.length,
    online: demoHosts.filter(h => h.status === 'online').length,
    offline: demoHosts.filter(h => h.status === 'offline').length,
    maintenance: demoHosts.filter(h => h.status === 'maintenance').length
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

// Simulate realistic variations for auto-refresh
export const generateVariations = () => {
  // Deep copy the demo data arrays to avoid mutating the originals
  const nodes = JSON.parse(JSON.stringify(demoNodes));
  const vms = JSON.parse(JSON.stringify(demoVMs));
  const containers = JSON.parse(JSON.stringify(demoContainers));

  // Add small random variations to CPU usage and memory
  nodes.forEach(node => {
    node.cpu = Math.max(0, Math.min(1, node.cpu + (Math.random() - 0.5) * 0.05));
    node.mem = Math.max(0, Math.min(node.maxmem, node.mem + (Math.random() - 0.5) * node.maxmem * 0.02));
  });

  vms.forEach(vm => {
    if (vm.status === 'running') {
      vm.cpu = Math.max(0, Math.min(1, vm.cpu + (Math.random() - 0.5) * 0.1));
      vm.mem = Math.max(0, Math.min(vm.maxmem, vm.mem + (Math.random() - 0.5) * vm.maxmem * 0.05));
    }
  });

  containers.forEach(ct => {
    if (ct.status === 'running') {
      ct.cpu = Math.max(0, Math.min(1, ct.cpu + (Math.random() - 0.5) * 0.08));
      ct.mem = Math.max(0, Math.min(ct.maxmem, ct.mem + (Math.random() - 0.5) * ct.maxmem * 0.03));
    }
  });

  // Return the updated arrays
  return {
    nodes,
    vms,
    containers
  };
}
