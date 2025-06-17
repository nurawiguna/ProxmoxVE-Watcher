# Proxmox Dashboard

A modern dashboard to monitor multiple Proxmox hosts, nodes, VMs, and containers in real time.

## Features
- Monitor multiple Proxmox hosts (baremetal or cluster)
- View nodes, VMs, and containers with live status
- Filter and search VMs/containers by status, node, or name
- Click a node to see only its VMs/containers
- Double-click or use the button to clear node selection
- Responsive, modern UI

## Stack Used
- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Backend:** Python 3, Flask, Flask-CORS, Proxmoxer, python-dotenv

## Getting Started

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd proxmox_dashboard
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Proxmox Hosts
Edit `backend/proxmox_hosts.json` and add your Proxmox hosts:
```json
[
  {
    "id": "host1",
    "name": "Histugaya",
    "host": "100.100.10.11",
    "user": "tomioka@pam",
    "password": "Admincontrol1"
  },
  {
    "id": "host2",
    "name": "Hutao",
    "host": "100.100.10.16",
    "user": "tomioka@pam",
    "password": "Admincontrol1"
  }
]
```

### 3. Run the Backend
```bash
python3 app.py
```
The backend will run on [http://localhost:5000](http://localhost:5000)

### 4. Frontend Setup & Run
```bash
cd ../frontend
python3 -m http.server 8000
```
The frontend will be available at [http://localhost:8000](http://localhost:8000)

## Usage
- Open the frontend in your browser.
- The dashboard will auto-fetch and display all hosts, nodes, VMs, and containers.
- Click a node to filter VMs/containers by node.
- Use the filter buttons (All, Running, Stopped) to filter by status.
- Use the search bar to search by name, node, or host.
- Double-click a selected node or use the "Clear Node Selection" button to reset the filter.

## Notes
- Make sure your machine can reach all Proxmox hosts via network and API.
- Credentials in `proxmox_hosts.json` must be valid and have API access.
- For production, secure your credentials and use HTTPS.

## Screenshots
![Dashboard Screenshot](screenshot.png)

## License
MIT 