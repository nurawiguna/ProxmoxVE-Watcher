# Proxmox Dashboard

A modern, easy-to-use dashboard for monitoring multiple Proxmox hosts, nodes, VMs, and containers in real time.

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
        "password": "your_password"
    },
    {
        "id": "2",
        "name": "Your Proxmox Host 2",
        "host": "your_proxmox_host_ip_2",
        "user": "api-user@pve",
        "password": "your_password"
    }
]
```
- `user` should be a Proxmox user with API access (see Permissions below).

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

---

## Screenshot
![Dashboard Screenshot](screenshot.png)

---

## License
MIT 