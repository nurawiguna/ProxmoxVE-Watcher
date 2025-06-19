const API_BASE_URL = 'http://127.0.0.1:5000/api';
let currentHosts = [];
let currentNodes = [];
let currentVMs = [];
let currentContainers = [];
let selectedHostId = null;
let selectedNode = null;
let nodeStatusData = {}; // Store detailed node status information
let expandedNodes = {};

// Fetch all hosts
async function fetchHosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/hosts`);
        const hosts = await response.json();
        currentHosts = hosts;
        // Fetch nodes for each host
        for (const host of hosts) {
            await fetchNodes(host.id);
        }
    } catch (error) {
        console.error('Error fetching hosts:', error);
    }
}

// Fetch nodes for a specific host
async function fetchNodes(hostId) {
    try {
        const response = await fetch(`${API_BASE_URL}/hosts/${hostId}/nodes`);
        const nodes = await response.json();
        currentNodes = [...currentNodes, ...nodes];
        // Fetch detailed status for each node
        for (const node of nodes) {
            await fetchNodeStatus(hostId, node.node);
        }
        displayNodes();
        updateStats();
        // Fetch VMs and containers for each node
        for (const node of nodes) {
            await fetchVMs(hostId, node.node);
            await fetchContainers(hostId, node.node);
        }
    } catch (error) {
        console.error(`Error fetching nodes for host ${hostId}:`, error);
    }
}

// Fetch detailed node status
async function fetchNodeStatus(hostId, node) {
    try {
        const response = await fetch(`${API_BASE_URL}/hosts/${hostId}/nodes/${node}/status`);
        const status = await response.json();
        nodeStatusData[`${hostId}-${node}`] = status;
        displayNodes(); // Refresh display with new data
    } catch (error) {
        console.error(`Error fetching status for node ${node}:`, error);
        // Store basic info if status fetch fails
        nodeStatusData[`${hostId}-${node}`] = {
            status: 'error',
            error: error.message
        };
    }
}

// Fetch VMs for a specific node
async function fetchVMs(hostId, node) {
    try {
        const response = await fetch(`${API_BASE_URL}/hosts/${hostId}/nodes/${node}/vms`);
        const vms = await response.json();
        currentVMs = [...currentVMs, ...vms];
        displayVMs();
        updateStats();
    } catch (error) {
        console.error(`Error fetching VMs for node ${node}:`, error);
    }
}

// Fetch containers for a specific node
async function fetchContainers(hostId, node) {
    try {
        const response = await fetch(`${API_BASE_URL}/hosts/${hostId}/nodes/${node}/containers`);
        const containers = await response.json();
        currentContainers = [...currentContainers, ...containers];
        displayVMs(); // This will show both VMs and containers
        updateStats();
    } catch (error) {
        console.error(`Error fetching containers for node ${node}:`, error);
    }
}

// Display nodes in the nodes panel
function displayNodes() {
    const nodesList = document.getElementById('nodesList');
    // Group nodes by host_id
    const nodesByHost = {};
    currentNodes.forEach(node => {
        if (!nodesByHost[node.host_id]) nodesByHost[node.host_id] = [];
        nodesByHost[node.host_id].push(node);
    });
    // Render all node cards (no host heading)
    nodesList.innerHTML = currentHosts.map(host => {
        const nodes = nodesByHost[host.id] || [];
        if (nodes.length > 0) {
            return nodes.map(node => {
                const statusKey = `${node.host_id}-${node.node}`;
                const statusData = nodeStatusData[statusKey];
                const isExpanded = expandedNodes[statusKey];
                const totalCores = statusData && statusData.cpuinfo ? statusData.cpuinfo.cpus : '-';
                const totalMemory = statusData && statusData.memory ? formatMemory(statusData.memory.total) : '-';
                const statusOnline = statusData?.status === 'online' || statusData?.host_id;
                return `
                    <div class="server-item simple-card" data-host="${node.host_id}" data-node="${node.node}" style="margin-bottom:12px;padding:14px 16px 10px 16px;">
                        <div class="server-name" style="font-size:1.12rem;font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                                <i class="fas fa-server" style="font-size:1.2rem;"></i>${node.node}
                        </div>
                        <div class="server-name-divider"></div>
                        <div class="baremetal-summary-row" style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-bottom:2px;">
                            <div style="display:flex;align-items:center;gap:5px;font-size:0.98rem;">
                                <i class="fas fa-globe"></i>
                                <span>${statusData?.host_id ? host.host : 'N/A'}</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:5px;font-size:0.98rem;">
                                <i class="fas fa-microchip"></i>
                                <span>${totalCores} cores</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:5px;font-size:0.98rem;">
                                <i class="fas fa-memory"></i>
                                <span>${totalMemory}</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:5px;font-size:0.98rem;">
                                <span class="status-indicator ${statusOnline ? 'online' : 'offline'}" style="padding:2px 10px;border-radius:10px;font-weight:600;background:${statusOnline ? 'rgba(40,167,69,0.12)' : 'rgba(220,53,69,0.12)'};color:${statusOnline ? '#28a745' : '#dc3545'};border:1px solid ${statusOnline ? 'rgba(40,167,69,0.3)' : 'rgba(220,53,69,0.3)'};">
                                    <i class="fas ${statusOnline ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                    ${statusOnline ? 'online' : 'offline'}
                                </span>
                            </div>
                        </div>
                        <button class="show-more-btn" data-statuskey="${statusKey}" style="margin-top:4px;margin-bottom:2px;padding:2px 14px;font-size:0.95rem;border-radius:8px;border:none;background:#e9ecef;color:#495057;cursor:pointer;transition:all 0.2s;float:right;">
                            ${isExpanded ? 'Show Less' : 'Show More'}
                        </button>
                        <div style="clear:both;"></div>
                        ${isExpanded && statusData ? `
                            <div class="baremetal-details" style="margin-top:8px;padding-top:8px;border-top:1px solid #e0e0e0;">
                                ${statusData.cpuinfo ? `
                                    <div class="server-info-row" style="font-size:0.97rem;margin-bottom:2px;"><i class="fas fa-microchip"></i><span class="server-info-label">CPU:</span><span class="server-info-value">${statusData.cpuinfo.model}</span></div>
                                ` : ''}
                                ${statusData.loadavg ? `
                                    <div class="server-info-row" style="font-size:0.97rem;margin-bottom:2px;"><i class="fas fa-chart-line"></i><span class="server-info-label">Load:</span><span class="server-info-value">${statusData.loadavg.join(', ')}</span></div>
                                ` : ''}
                                ${statusData.rootfs ? `
                                    <div class="server-info-row" style="font-size:0.97rem;margin-bottom:2px;"><i class="fas fa-hdd"></i><span class="server-info-label">Storage:</span><span class="server-info-value">${formatStorage(statusData.rootfs.total)} (${formatStorage(statusData.rootfs.used)} used)</span></div>
                                ` : ''}
                                ${statusData.uptime ? `
                                    <div class="server-info-row" style="font-size:0.97rem;margin-bottom:2px;"><i class="fas fa-clock"></i><span class="server-info-label">Uptime:</span><span class="server-info-value">${formatUptime(statusData.uptime)}</span></div>
                                ` : ''}
                                ${statusData.pveversion ? `
                                    <div class="server-info-row" style="font-size:0.97rem;margin-bottom:2px;"><i class="fas fa-code-branch"></i><span class="server-info-label">Proxmox:</span><span class="server-info-value">${statusData.pveversion}</span></div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        } else {
            return `<div class="server-item simple-card" data-host="${host.id}" style="opacity:0.6;cursor:default;">
                <div class="server-name">
                    <i class="fas fa-exclamation-triangle"></i>(No nodes online)
                </div>
                <div class="server-info">
                    <div class="server-info-row">
                        <i class="fas fa-server"></i>
                        <span class="server-info-label">Host:</span>
                        <span class="server-info-value">${host.name}</span>
                    </div>
                    <div class="server-info-row">
                        <i class="fas fa-exclamation-circle"></i>
                        <span class="server-info-label">Status:</span>
                        <span class="status-indicator offline">
                            <i class="fas fa-times-circle"></i>
                            Offline
                        </span>
                    </div>
                </div>
            </div>`;
        }
    }).join('');

    // Show or hide the clear button
    document.getElementById('clearNodeSelectionBtn').style.display = (selectedHostId && selectedNode) ? 'inline-flex' : 'none';

    // Add click and double-click event listeners for real nodes only
    document.querySelectorAll('.server-item[data-node]').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.server-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedHostId = item.dataset.host;
            selectedNode = item.dataset.node;
            displayVMs();
            document.getElementById('clearNodeSelectionBtn').style.display = 'inline-flex';
        });
        item.addEventListener('dblclick', () => {
            // Double-click to clear selection
            selectedHostId = null;
            selectedNode = null;
            document.querySelectorAll('.server-item').forEach(i => i.classList.remove('selected'));
            displayVMs();
            document.getElementById('clearNodeSelectionBtn').style.display = 'none';
        });
    });

    // Add show more/less button listeners
    document.querySelectorAll('.show-more-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const key = btn.getAttribute('data-statuskey');
            expandedNodes[key] = !expandedNodes[key];
            displayNodes();
        });
    });
}

// Display VMs and containers
function displayVMs(filteredItems) {
    const vmsList = document.getElementById('vmsList');
    let allItems = filteredItems;
    if (!allItems) {
        if (selectedHostId && selectedNode) {
            // Filter by selected node
            const filteredVMs = currentVMs.filter(vm => vm.host_id === selectedHostId && vm.node === selectedNode);
            const filteredContainers = currentContainers.filter(container => container.host_id === selectedHostId && container.node === selectedNode);
            allItems = [...filteredVMs, ...filteredContainers];
        } else {
            // Show all
            allItems = [...currentVMs, ...currentContainers];
        }
    }
    // Sort items by name in ascending order
    const sortedItems = allItems.sort((a, b) => a.name.localeCompare(b.name));
    vmsList.innerHTML = sortedItems.map(item => `
        <div class="vm-card">
            <div class="vm-name">
                <i class="${item.type === 'lxc' ? 'fas fa-cube' : 'fas fa-desktop'}"></i>${item.name}
            </div>
            <div class="vm-details">
                <div><i class="fas fa-hashtag"></i><b>ID:</b> ${item.vmid || item.id || '-'}</div>
                <div><i class="fas fa-tag"></i>Type: ${item.type || 'VM'}</div>
                <div><i class="fas fa-server"></i>Baremetal: ${item.host_name}</div>
                <div><i class="fas fa-microchip"></i>Resource: ${formatMemory(item.maxmem || 0)} RAM, ${item.cpus || '-'} cores, ${item.maxdisk !== undefined ? `${formatStorage(item.maxdisk)}` : ''} DISK</div>
            </div>
            <div class="status ${item.status === 'running' ? 'running' : 'stopped'}">
                <i class="fas ${item.status === 'running' ? 'fa-play' : 'fa-stop'}"></i>${item.status || 'unknown'}
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    document.getElementById('totalNodes').textContent = currentNodes.length;
    document.getElementById('totalVMs').textContent = currentVMs.length;
    document.getElementById('totalContainers').textContent = currentContainers.length;
    // Running VMs and Containers
    const runningVMs = currentVMs.filter(vm => vm.status === 'running');
    const runningContainers = currentContainers.filter(c => c.status === 'running');
    document.getElementById('totalVMsRunning').textContent = runningVMs.length;
    document.getElementById('totalContainersRunning').textContent = runningContainers.length;
    // Stopped VMs and Containers
    const stoppedVMs = currentVMs.filter(vm => vm.status !== 'running');
    const stoppedContainers = currentContainers.filter(c => c.status !== 'running');
    document.getElementById('totalVMsStopped').textContent = stoppedVMs.length;
    document.getElementById('totalContainersStopped').textContent = stoppedContainers.length;
    // RAM Usage (sum of maxmem for running VMs and containers)
    const totalRAM = runningVMs.reduce((sum, vm) => sum + (vm.maxmem || 0), 0) +
                     runningContainers.reduce((sum, c) => sum + (c.maxmem || 0), 0);
    document.getElementById('totalRAM').textContent = formatMemory(totalRAM);
    // CPU Usage (sum of cpus for running VMs and containers)
    const totalCPU = runningVMs.reduce((sum, vm) => sum + (vm.cpus || 0), 0) +
                     runningContainers.reduce((sum, c) => sum + (c.cpus || 0), 0);
    document.getElementById('totalCPU').textContent = totalCPU;
    // Disk Usage (sum of maxdisk for running VMs and containers)
    const totalDisk = runningVMs.reduce((sum, vm) => sum + (vm.maxdisk || 0), 0) +
                      runningContainers.reduce((sum, c) => sum + (c.maxdisk || 0), 0);
    document.getElementById('totalDisk').textContent = formatStorage(totalDisk);
}

// Format memory size
function formatMemory(bytes) {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)}GB`;
}

// Format storage size
function formatStorage(bytes) {
    if (!bytes || bytes === 0) return 'N/A';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)}GB`;
}

// Format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// When search or filter is used, clear node selection
document.getElementById('searchInput').addEventListener('input', (e) => {
    selectedHostId = null;
    selectedNode = null;
    const searchTerm = e.target.value.toLowerCase();
    const filteredVMs = currentVMs.filter(vm => 
        vm.name.toLowerCase().includes(searchTerm) ||
        vm.node.toLowerCase().includes(searchTerm) ||
        vm.host_name.toLowerCase().includes(searchTerm)
    );
    const filteredContainers = currentContainers.filter(container =>
        container.name.toLowerCase().includes(searchTerm) ||
        container.node.toLowerCase().includes(searchTerm) ||
        container.host_name.toLowerCase().includes(searchTerm)
    );
    const allItems = [...filteredVMs, ...filteredContainers];
    displayVMs(allItems);
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Do not clear node selection when filtering
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        let filteredItems;
        if (selectedHostId && selectedNode) {
            // Filter only for selected node
            filteredItems = [...currentVMs, ...currentContainers].filter(item => item.host_id === selectedHostId && item.node === selectedNode);
        } else {
            filteredItems = [...currentVMs, ...currentContainers];
        }
        if (filter === 'running') {
            filteredItems = filteredItems.filter(item => item.status === 'running');
        } else if (filter === 'stopped') {
            filteredItems = filteredItems.filter(item => item.status === 'stopped');
        }
        displayVMs(filteredItems);
    });
});

// Clear Node Selection button handler
document.getElementById('clearNodeSelectionBtn').addEventListener('click', () => {
    selectedHostId = null;
    selectedNode = null;
    document.querySelectorAll('.server-item').forEach(i => i.classList.remove('selected'));
    displayVMs();
    document.getElementById('clearNodeSelectionBtn').style.display = 'none';
});

// Toggle stats-grid visibility
const toggleStatsBtn = document.getElementById('toggleStatsBtn');
const statsGrid = document.getElementById('statsGrid');
toggleStatsBtn.addEventListener('click', () => {
    if (statsGrid.style.display === 'none') {
        statsGrid.style.display = 'grid';
        toggleStatsBtn.textContent = 'Hide Summary';
    } else {
        statsGrid.style.display = 'none';
        toggleStatsBtn.textContent = 'Show Summary';
    }
});

// VM List toggle logic
const vmsList = document.getElementById('vmsList');
const filters = document.querySelector('.filters');
const toggleVmListBtn = document.getElementById('toggleVmListBtn');
let vmListVisible = false;

function setVmListVisibility(visible) {
    vmListVisible = visible;
    vmsList.style.display = visible ? '' : 'none';
    filters.style.display = visible ? '' : 'none';
    toggleVmListBtn.textContent = visible ? 'Hide VM List' : 'Show VM List';
}

// Hide VM list by default
setVmListVisibility(false);

toggleVmListBtn.addEventListener('click', () => {
    setVmListVisibility(!vmListVisible);
});

// Show VM list when searching
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
    setVmListVisibility(true);
    // ... existing code for search ...
});

// Initial data fetch
fetchHosts(); 