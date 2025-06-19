# Proxmox Dashboard

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

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/nurawiguna/proxmox_dashboard.git
cd proxmox_dashboard
```

### 2. Backend Setup (with Python Virtual Environment)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

#### Configure Proxmox Hosts
Edit `backend/proxmox_hosts.json` and add your Proxmox hosts (see example in file).

### 3. Run the Backend
```bash
python app.py
```
- The backend runs at [http://localhost:5000](http://localhost:5000)

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
- Use the dashboard to view, filter, and search VMs/containers.
- Click a node to filter by node, use the search bar or filter buttons, and use the toggle to show/hide the VM list.

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