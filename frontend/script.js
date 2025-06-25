// Configuration and Constants
const API_BASE_URL = 'http://127.0.0.1:5000/api';
const DEBOUNCE_DELAY = 300;

// Application State
class AppState {
    constructor() {
        this.hosts = [];
        this.nodes = [];
        this.vms = [];
        this.containers = [];
        this.selectedHostId = null;
        this.selectedNode = null;
        this.nodeStatusData = new Map();
        this.expandedNodes = new Set();
        this.uiState = {
            vmListVisible: false,
            baremetalListVisible: false,
            statsVisible: false
        };
    }

    reset() {
        this.hosts = [];
        this.nodes = [];
        this.vms = [];
        this.containers = [];
        this.nodeStatusData.clear();
    }

    getStatusKey(hostId, node) {
        return `${hostId}-${node}`;
    }

    setNodeStatus(hostId, node, status) {
        this.nodeStatusData.set(this.getStatusKey(hostId, node), status);
    }

    getNodeStatus(hostId, node) {
        return this.nodeStatusData.get(this.getStatusKey(hostId, node));
    }

    toggleNodeExpansion(hostId, node) {
        const key = this.getStatusKey(hostId, node);
        if (this.expandedNodes.has(key)) {
            this.expandedNodes.delete(key);
        } else {
            this.expandedNodes.add(key);
        }
    }

    isNodeExpanded(hostId, node) {
        return this.expandedNodes.has(this.getStatusKey(hostId, node));
    }
}

// DOM Element Cache
class DOMCache {
    constructor() {
        this.elements = new Map();
        this.cacheElements();
    }

    cacheElements() {
        const elementIds = [
            'nodesList', 'vmsList', 'statsGrid', 'searchInput',
            'totalNodes', 'totalVMs', 'totalContainers',
            'totalVMsRunning', 'totalContainersRunning',
            'totalVMsStopped', 'totalContainersStopped',
            'totalRAM', 'totalCPU', 'totalDisk',
            'clearNodeSelectionBtn', 'toggleStatsBtn',
            'toggleVmListBtn', 'toggleBaremetalListBtn'
        ];

        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.elements.set(id, element);
            }
        });

        // Cache filter buttons
        this.elements.set('filterBtns', document.querySelectorAll('.filter-btn'));
        this.elements.set('filters', document.querySelector('.filters'));
    }

    get(elementId) {
        return this.elements.get(elementId);
    }
}

// Utility Functions
const Utils = {
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    formatMemory(bytes) {
        if (!bytes || bytes === 0) return 'N/A';
        const tb = bytes / (1024 ** 4);
        if (tb >= 1) {
            return Number.isInteger(tb) ? `${tb}TB` : `${tb.toFixed(2)}TB`;
        }
        const gb = bytes / (1024 ** 3);
        return Number.isInteger(gb) ? `${gb}GB` : `${gb.toFixed(2)}GB`;
    },

    formatStorage(bytes) {
        return this.formatMemory(bytes);
    },

    formatUptime(seconds) {
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
    },

    async fetchWithErrorHandling(url, context = '') {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${context} from ${url}:`, error);
            throw error;
        }
    }
};

// Global instances
const appState = new AppState();
const domCache = new DOMCache();

// API Functions with optimized parallel processing
class APIService {
    static async fetchHosts() {
        try {
            const hosts = await Utils.fetchWithErrorHandling(`${API_BASE_URL}/hosts`, 'hosts');
            appState.hosts = hosts;
            
            // Fetch nodes for all hosts in parallel
            const nodePromises = hosts.map(host => this.fetchNodesForHost(host.id));
            await Promise.allSettled(nodePromises);
            
            // Update UI after all data is loaded
            DisplayManager.displayNodes();
            StatsManager.updateStats();
        } catch (error) {
            console.error('Error in fetchHosts:', error);
        }
    }

    static async fetchNodesForHost(hostId) {
        try {
            const nodes = await Utils.fetchWithErrorHandling(`${API_BASE_URL}/hosts/${hostId}/nodes`, `nodes for host ${hostId}`);
            appState.nodes.push(...nodes);

            // Fetch status, VMs, and containers for all nodes in parallel
            const promises = nodes.flatMap(node => [
                this.fetchNodeStatus(hostId, node.node),
                this.fetchVMsForNode(hostId, node.node),
                this.fetchContainersForNode(hostId, node.node)
            ]);

            await Promise.allSettled(promises);
        } catch (error) {
            console.error(`Error fetching data for host ${hostId}:`, error);
        }
    }

    static async fetchNodeStatus(hostId, node) {
        try {
            const status = await Utils.fetchWithErrorHandling(`${API_BASE_URL}/hosts/${hostId}/nodes/${node}/status`, `status for node ${node}`);
            appState.setNodeStatus(hostId, node, status);
        } catch (error) {
            appState.setNodeStatus(hostId, node, {
                status: 'error',
                error: error.message
            });
        }
    }

    static async fetchVMsForNode(hostId, node) {
        try {
            const vms = await Utils.fetchWithErrorHandling(`${API_BASE_URL}/hosts/${hostId}/nodes/${node}/vms`, `VMs for node ${node}`);
            appState.vms.push(...vms);
        } catch (error) {
            console.error(`Error fetching VMs for node ${node}:`, error);
        }
    }

    static async fetchContainersForNode(hostId, node) {
        try {
            const containers = await Utils.fetchWithErrorHandling(`${API_BASE_URL}/hosts/${hostId}/nodes/${node}/containers`, `containers for node ${node}`);
            appState.containers.push(...containers);
        } catch (error) {
            console.error(`Error fetching containers for node ${node}:`, error);
        }
    }
}

// Display Management
class DisplayManager {
    static displayNodes() {
        const nodesList = domCache.get('nodesList');
        if (!nodesList) return;

        // Group nodes by host_id
        const nodesByHost = {};
        appState.nodes.forEach(node => {
            if (!nodesByHost[node.host_id]) nodesByHost[node.host_id] = [];
            nodesByHost[node.host_id].push(node);
        });

        // Render all node cards
        nodesList.innerHTML = appState.hosts.map(host => {
            const nodes = nodesByHost[host.id] || [];
            return nodes.length > 0 
                ? this.renderHostNodes(host, nodes)
                : this.renderOfflineHost(host);
        }).join('');

        this.attachNodeEventListeners();
        this.updateClearButtonVisibility();
    }

    static renderHostNodes(host, nodes) {
        return nodes.map(node => {
            const statusData = appState.getNodeStatus(node.host_id, node.node);
            const isExpanded = appState.isNodeExpanded(node.host_id, node.node);
            const statusKey = appState.getStatusKey(node.host_id, node.node);
            
            const totalCores = statusData?.cpuinfo?.cpus || '-';
            const totalMemory = statusData?.memory ? Utils.formatMemory(statusData.memory.total) : '-';
            const statusOnline = statusData?.status === 'online' || statusData?.host_id;

            return `
                <div class="server-item simple-card" data-host="${node.host_id}" data-node="${node.node}" style="margin-bottom:12px;padding:14px 16px 10px 16px;">
                    ${this.renderNodeHeader(node)}
                    ${this.renderNodeSummary(host, statusData, totalCores, totalMemory, statusOnline)}
                    ${this.renderShowMoreButton(statusKey, isExpanded)}
                    ${isExpanded && statusData ? this.renderNodeDetails(statusData) : ''}
                </div>
            `;
        }).join('');
    }

    static renderNodeHeader(node) {
        return `
            <div class="server-name" style="font-size:1.12rem;font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <i class="fas fa-server" style="font-size:1.2rem;"></i>${node.node}
            </div>
            <div class="server-name-divider"></div>
        `;
    }

    static renderNodeSummary(host, statusData, totalCores, totalMemory, statusOnline) {
        return `
            <div class="baremetal-summary-row" style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-bottom:2px;">
                <div style="display:flex;align-items:center;gap:5px;font-size:0.98rem;">
                    <i class="fas fa-globe"></i>
                    <span>${statusData?.host_id ? host.host : 'N/A'}</span>
                </div>
                <div style="display:flex;align-items:center;gap:5px;font-size:0.98rem;">
                    <i class="fas fa-building"></i>
                    <span>${host.company || '-'}</span>
                </div>
                <div style="display:flex;align-items:center;gap:5px;font-size:0.98rem;">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${host.site || '-'}</span>
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
        `;
    }

    static renderShowMoreButton(statusKey, isExpanded) {
        return `
            <button class="show-more-btn ${isExpanded ? 'expanded' : ''}" data-statuskey="${statusKey}" style="margin-top:4px;margin-bottom:2px;padding:2px 14px;font-size:0.95rem;border-radius:8px;border:none;background:#e9ecef;color:#495057;cursor:pointer;transition:all 0.2s;float:right;">
                ${isExpanded ? 'Show Less' : 'Show More'}
            </button>
            <div style="clear:both;"></div>
        `;
    }

    static renderNodeDetails(statusData) {
        const details = [];
        
        if (statusData.cpuinfo) {
            details.push(`<div class="server-info-row" style="font-size:0.97rem;margin-bottom:2px;"><i class="fas fa-microchip"></i><span class="server-info-label">CPU:</span><span class="server-info-value">${statusData.cpuinfo.model}</span></div>`);
        }
        
        if (statusData.loadavg) {
            details.push(`<div class="server-info-row" style="font-size:0.97rem;margin-bottom:2px;"><i class="fas fa-chart-line"></i><span class="server-info-label">Load:</span><span class="server-info-value">${statusData.loadavg.join(', ')}</span></div>`);
        }
        
        if (statusData.rootfs) {
            details.push(`<div class="server-info-row" style="font-size:0.97rem;margin-bottom:2px;"><i class="fas fa-hdd"></i><span class="server-info-label">Storage:</span><span class="server-info-value">${Utils.formatStorage(statusData.rootfs.total)} (${Utils.formatStorage(statusData.rootfs.used)} used)</span></div>`);
        }
        
        if (statusData.uptime) {
            details.push(`<div class="server-info-row" style="font-size:0.97rem;margin-bottom:2px;"><i class="fas fa-clock"></i><span class="server-info-label">Uptime:</span><span class="server-info-value">${Utils.formatUptime(statusData.uptime)}</span></div>`);
        }
        
        if (statusData.pveversion) {
            details.push(`<div class="server-info-row" style="font-size:0.97rem;margin-bottom:2px;"><i class="fas fa-code-branch"></i><span class="server-info-label">Proxmox:</span><span class="server-info-value">${statusData.pveversion}</span></div>`);
        }

        return `
            <div class="baremetal-details" style="margin-top:8px;padding-top:8px;border-top:1px solid #e0e0e0;">
                ${details.join('')}
            </div>
        `;
    }

    static renderOfflineHost(host) {
        return `
            <div class="server-item simple-card" data-host="${host.id}" style="opacity:0.6;cursor:default;">
                <div class="server-name">
                    <i class="fas fa-exclamation-triangle"></i> (${host.name} is not available)
                </div>
                <div class="server-info-row">
                    <div style="display:flex;align-items:center;gap:5px;font-size:0.98rem;">
                        <i class="fas fa-globe"></i>
                        <span>${host.host}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:5px;font-size:0.98rem;">
                        <i class="fas fa-building"></i>
                        <span>${host.company || '-'}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:5px;font-size:0.98rem;">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${host.site || '-'}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:5px;font-size:0.98rem;">
                        <span class="status-indicator offline">
                            <i class="fas fa-times-circle"></i>
                            Offline
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    static attachNodeEventListeners() {
        // Node selection listeners
        document.querySelectorAll('.server-item[data-node]').forEach(item => {
            item.addEventListener('click', () => this.handleNodeSelection(item));
            // item.addEventListener('dblclick', () => this.handleNodeDeselection());
        });

        // Show more/less button listeners
        document.querySelectorAll('.show-more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleShowMoreToggle(e, btn));
        });
    }

    static handleNodeSelection(item) {
        const isCurrentlySelected = item.classList.contains('selected');
        
        if (isCurrentlySelected) {
            // If already selected, deselect it (toggle behavior)
            this.handleNodeDeselection();
        } else {
            // Select the new node
            document.querySelectorAll('.server-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            appState.selectedHostId = item.dataset.host;
            appState.selectedNode = item.dataset.node;
            this.displayVMs();
            this.updateClearButtonVisibility();
            // Show VM list if hidden
            UIManager.setVmListVisibility(true);
        }
    }

    static handleNodeDeselection() {
        appState.selectedHostId = null;
        appState.selectedNode = null;
        document.querySelectorAll('.server-item').forEach(i => i.classList.remove('selected'));
        this.displayVMs();
        this.updateClearButtonVisibility();
    }

    static handleShowMoreToggle(e, btn) {
        e.stopPropagation();
        const statusKey = btn.getAttribute('data-statuskey');
        const [hostId, node] = statusKey.split('-');
        appState.toggleNodeExpansion(hostId, node);
        this.displayNodes();
    }

    static updateClearButtonVisibility() {
        const clearBtn = domCache.get('clearNodeSelectionBtn');
        if (clearBtn) {
            clearBtn.style.display = (appState.selectedHostId && appState.selectedNode) ? 'inline-flex' : 'none';
        }
    }

    static displayVMs(filteredItems) {
        const vmsList = domCache.get('vmsList');
        if (!vmsList) return;

        let allItems = filteredItems || this.getFilteredItems();
        
        // Sort items by name
        const sortedItems = allItems.sort((a, b) => a.name.localeCompare(b.name));
        
        vmsList.innerHTML = sortedItems.map(item => this.renderVMCard(item)).join('');
    }

    static getFilteredItems() {
        if (appState.selectedHostId && appState.selectedNode) {
            const filteredVMs = appState.vms.filter(vm => 
                vm.host_id === appState.selectedHostId && vm.node === appState.selectedNode
            );
            const filteredContainers = appState.containers.filter(container => 
                container.host_id === appState.selectedHostId && container.node === appState.selectedNode
            );
            return [...filteredVMs, ...filteredContainers];
        }
        return [...appState.vms, ...appState.containers];
    }

    static renderVMCard(item) {
        return `
            <div class="vm-card">
                <div class="vm-name">
                    <i class="${item.type === 'lxc' ? 'fas fa-cube' : 'fas fa-desktop'}"></i>${item.name}
                </div>
                <div class="vm-details">
                    <div><i class="fas fa-hashtag"></i><b>ID:</b> ${item.vmid || item.id || '-'}</div>
                    <div><i class="fas fa-tag"></i>Type: ${item.type || 'VM'}</div>
                    <div><i class="fas fa-server"></i>Baremetal: ${item.node}</div>
                    <div><i class="fas fa-microchip"></i>Resource: ${Utils.formatMemory(item.maxmem || 0)} RAM, ${item.cpus || '-'} cores, ${item.maxdisk !== undefined ? Utils.formatStorage(item.maxdisk) : ''} DISK</div>
                </div>
                <div class="status ${item.status === 'running' ? 'running' : 'stopped'}">
                    <i class="fas ${item.status === 'running' ? 'fa-play' : 'fa-stop'}"></i>${item.status || 'unknown'}
                </div>
            </div>
        `;
    }
}

// Statistics Management
class StatsManager {
    static updateStats() {
        const stats = this.calculateStats();
        this.updateStatsDisplay(stats);
    }

    static calculateStats() {
        const runningVMs = appState.vms.filter(vm => vm.status === 'running');
        const runningContainers = appState.containers.filter(c => c.status === 'running');
        const stoppedVMs = appState.vms.filter(vm => vm.status !== 'running');
        const stoppedContainers = appState.containers.filter(c => c.status !== 'running');

        const totalRAM = runningVMs.reduce((sum, vm) => sum + (vm.maxmem || 0), 0) +
                        runningContainers.reduce((sum, c) => sum + (c.maxmem || 0), 0);

        const totalCPU = runningVMs.reduce((sum, vm) => sum + (vm.cpus || 0), 0) +
                        runningContainers.reduce((sum, c) => sum + (c.cpus || 0), 0);

        const totalDisk = runningVMs.reduce((sum, vm) => sum + (vm.maxdisk || 0), 0) +
                         runningContainers.reduce((sum, c) => sum + (c.maxdisk || 0), 0);

        return {
            totalNodes: appState.nodes.length,
            totalVMs: appState.vms.length,
            totalContainers: appState.containers.length,
            runningVMs: runningVMs.length,
            runningContainers: runningContainers.length,
            stoppedVMs: stoppedVMs.length,
            stoppedContainers: stoppedContainers.length,
            totalRAM: Utils.formatMemory(totalRAM),
            totalCPU,
            totalDisk: Utils.formatStorage(totalDisk)
        };
    }

    static updateStatsDisplay(stats) {
        const updates = [
            ['totalNodes', stats.totalNodes],
            ['totalVMs', stats.totalVMs],
            ['totalContainers', stats.totalContainers],
            ['totalVMsRunning', stats.runningVMs],
            ['totalContainersRunning', stats.runningContainers],
            ['totalVMsStopped', stats.stoppedVMs],
            ['totalContainersStopped', stats.stoppedContainers],
            ['totalRAM', stats.totalRAM],
            ['totalCPU', stats.totalCPU],
            ['totalDisk', stats.totalDisk]
        ];

        updates.forEach(([elementId, value]) => {
            const element = domCache.get(elementId);
            if (element) {
                element.textContent = value;
            }
        });
    }
}

// Search and Filter Management
class SearchAndFilterManager {
    static init() {
        this.setupSearchHandler();
        this.setupFilterHandlers();
    }

    static setupSearchHandler() {
        const searchInput = domCache.get('searchInput');
        if (!searchInput) return;

        const debouncedSearch = Utils.debounce((searchTerm) => {
            this.handleSearch(searchTerm);
        }, DEBOUNCE_DELAY);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value.toLowerCase());
        });
    }

    static handleSearch(searchTerm) {
        // Clear node selection when searching
        appState.selectedHostId = null;
        appState.selectedNode = null;
        
        if (!searchTerm.trim()) {
            DisplayManager.displayVMs();
            UIManager.setVmListVisibility(false);
            return;
        }

        const filteredVMs = appState.vms.filter(vm => 
            vm.name.toLowerCase().includes(searchTerm) ||
            vm.node.toLowerCase().includes(searchTerm) ||
            vm.host_name?.toLowerCase().includes(searchTerm)
        );

        const filteredContainers = appState.containers.filter(container =>
            container.name.toLowerCase().includes(searchTerm) ||
            container.node.toLowerCase().includes(searchTerm) ||
            container.host_name?.toLowerCase().includes(searchTerm)
        );

        const allItems = [...filteredVMs, ...filteredContainers];
        DisplayManager.displayVMs(allItems);
        UIManager.setVmListVisibility(true);
    }

    static setupFilterHandlers() {
        const filterBtns = domCache.get('filterBtns');
        if (!filterBtns) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleFilter(btn));
        });
    }

    static handleFilter(btn) {
        // Update active filter
        domCache.get('filterBtns').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        let filteredItems = this.getBaseFilteredItems();

        if (filter === 'running') {
            filteredItems = filteredItems.filter(item => item.status === 'running');
        } else if (filter === 'stopped') {
            filteredItems = filteredItems.filter(item => item.status === 'stopped');
        }

        DisplayManager.displayVMs(filteredItems);
    }

    static getBaseFilteredItems() {
        if (appState.selectedHostId && appState.selectedNode) {
            return [...appState.vms, ...appState.containers].filter(item => 
                item.host_id === appState.selectedHostId && item.node === appState.selectedNode
            );
        }
        return [...appState.vms, ...appState.containers];
    }
}

// UI Management
class UIManager {
    static init() {
        this.setupToggleHandlers();
        this.setupClearSelectionHandler();
        this.initializeUIState();
    }

    static setupToggleHandlers() {
        this.setupStatsToggle();
        this.setupVmListToggle();
        this.setupBaremetalListToggle();
    }

    static setupStatsToggle() {
        const toggleStatsBtn = domCache.get('toggleStatsBtn');
        const statsGrid = domCache.get('statsGrid');
        
        if (toggleStatsBtn && statsGrid) {
            toggleStatsBtn.addEventListener('click', () => {
                appState.uiState.statsVisible = !appState.uiState.statsVisible;
                this.updateStatsVisibility();
            });
        }
    }

    static updateStatsVisibility() {
        const statsGrid = domCache.get('statsGrid');
        const toggleStatsBtn = domCache.get('toggleStatsBtn');
        
        if (statsGrid && toggleStatsBtn) {
            statsGrid.style.display = appState.uiState.statsVisible ? 'grid' : 'none';
            toggleStatsBtn.textContent = appState.uiState.statsVisible ? 'Hide Summary' : 'Show Summary';
        }
    }

    static setupVmListToggle() {
        const toggleVmListBtn = domCache.get('toggleVmListBtn');
        
        if (toggleVmListBtn) {
            toggleVmListBtn.addEventListener('click', () => {
                this.setVmListVisibility(!appState.uiState.vmListVisible);
            });
        }
    }

    static setVmListVisibility(visible) {
        appState.uiState.vmListVisible = visible;
        
        const vmsList = domCache.get('vmsList');
        const filters = domCache.get('filters');
        const toggleVmListBtn = domCache.get('toggleVmListBtn');
        
        if (vmsList) vmsList.style.display = visible ? '' : 'none';
        if (filters) filters.style.display = visible ? '' : 'none';
        if (toggleVmListBtn) toggleVmListBtn.textContent = visible ? 'Hide VM List' : 'Show VM List';
    }

    static setupBaremetalListToggle() {
        const toggleBaremetalListBtn = domCache.get('toggleBaremetalListBtn');
        
        if (toggleBaremetalListBtn) {
            toggleBaremetalListBtn.addEventListener('click', () => {
                this.setBaremetalListVisibility(!appState.uiState.baremetalListVisible);
            });
        }
    }

    static setBaremetalListVisibility(visible) {
        appState.uiState.baremetalListVisible = visible;
        
        const nodesList = domCache.get('nodesList');
        const toggleBaremetalListBtn = domCache.get('toggleBaremetalListBtn');
        
        if (nodesList) nodesList.style.display = visible ? '' : 'none';
        if (toggleBaremetalListBtn) {
            toggleBaremetalListBtn.textContent = visible ? 'Hide List' : 'Show List';
            toggleBaremetalListBtn.setAttribute('aria-expanded', visible.toString());
        }
    }

    static setupClearSelectionHandler() {
        const clearBtn = domCache.get('clearNodeSelectionBtn');
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                DisplayManager.handleNodeDeselection();
            });
        }
    }

    static initializeUIState() {
        // Initialize UI state based on appState
        this.setVmListVisibility(appState.uiState.vmListVisible);
        this.setBaremetalListVisibility(appState.uiState.baremetalListVisible);
        this.updateStatsVisibility();
    }
}

// Application Initialization
class App {
    static async init() {
        try {
            // Initialize UI components
            UIManager.init();
            SearchAndFilterManager.init();
            
            // Load initial data
            await APIService.fetchHosts();
            
            // Update display
            DisplayManager.displayVMs();
            StatsManager.updateStats();
            
            console.log('Proxmox Dashboard initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Proxmox Dashboard:', error);
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
}); 