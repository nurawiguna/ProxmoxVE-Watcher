# Proxmox Dashboard
Manage and locate your VMs across baremetal servers.

## Requirements
- **Python 3.10+** (tested on 3.10.0)
- **pip** (Python package manager)
- **Python packages:**
  - Flask (2.0.1 or newer)
  - Flask-CORS (3.0.10 or newer)
  - proxmoxer (1.3.1 or newer)
  - python-dotenv (0.19.0 or newer)
- **Frontend static server:**
  - Python's built-in HTTP server (`python3 -m http.server`) is supported and available
  - (Optional) Node.js (v20.5.0 or newer) if you want to use other static servers

---

## Features
- Monitor multiple Proxmox hosts (baremetal or cluster)
- View nodes, VMs, and containers with live status
- Filter and search VMs/containers by status, node, or name
- Click a node to see only its VMs/containers
- Double-click or use the button to clear node selection
- Responsive, modern UI

---

## Technology Stack
- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Backend:** Python 3, Flask, Flask-CORS, Proxmoxer, python-dotenv

---

## Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/nurawiguna/proxmox_dashboard.git
cd proxmox_dashboard
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Proxmox Hosts
Edit `backend/proxmox_hosts.json` and add your Proxmox hosts. Example:
```json
[
    {
        "id": "1",
        "name": "Your Proxmox Host",
        "host": "your_proxmox_host_ip",
        "user": "api-user@pve",
        "password": "your_password",
        "verify_ssl": false
    },
    {
        "id": "2",
        "name": "Your Proxmox Host 2",
        "host": "your_proxmox_host_ip_2",
        "user": "api-user@pve",
        "password": "your_password",
        "verify_ssl": true
    }
]
```
- `user` should be a Proxmox user with API access (see Permissions below).
- `verify_ssl` (optional, default: `true`): Set to `false` to disable SSL certificate verification (useful for self-signed certificates or local testing). **Warning:** Disabling SSL verification is insecure and should only be used in trusted environments.

### 3. Run the Backend
```bash
python3 app.py
```
- The backend will run at [http://localhost:5000](http://localhost:5000)

### 4. Frontend Setup & Run
```bash
cd ../frontend
python3 -m http.server 8000
```
- The frontend will be available at [http://localhost:8000](http://localhost:8000)

---

## Permissions Setup (Proxmox)
1. **Create a User** in Proxmox (Datacenter > Permissions > Users).
2. **Create a Role** (if needed) with at least these privileges:
   - `Sys.Audit`, `VM.Audit`, `VM.Monitor`
3. **Assign Permissions**:
   - Go to Datacenter > Permissions > Add
   - Path: `/`
   - User: your API user
   - Role: your custom role or `PVEAdmin` (for testing)

---

## Usage
- Open the frontend in your browser.
- The dashboard will auto-fetch and display all hosts, nodes, VMs, and containers.
- Click a node to filter VMs/containers by node.
- Use the filter buttons (All, Running, Stopped) to filter by status.
- Use the search bar to search by name, node, or host.
- Double-click a selected node or use the "Clear Node Selection" button to reset the filter.
- Click "Show Summary" to view resource statistics.

---

## Notes
- Ensure your machine can reach all Proxmox hosts via network and API.
- Credentials in `proxmox_hosts.json` must be valid and have API access.
- For production, secure your credentials and use HTTPS.
- If your Proxmox server uses a self-signed certificate, you may need to set `"verify_ssl": false` in your host config. **Disabling SSL verification is insecure and should only be used for local/testing purposes.**

---

## Screenshot
![Dashboard Screenshot](ss.png)

---

## License
MIT 