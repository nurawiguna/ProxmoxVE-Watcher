# Proxmox VE Watcher

A modern, responsive web dashboard for monitoring Proxmox Virtual Environment (VE) clusters. Built with Vue.js and featuring real-time data updates, detailed resource monitoring, and an intuitive user interface.


## ✨ Features

- **Real-time Monitoring**: Live updates of VMs, containers, and node status
- **Multi-host Support**: Monitor multiple Proxmox hosts from a single dashboard  
- **Resource Tracking**: CPU, memory, disk usage visualization
- **VM/Container Management**: Start, stop, and reboot operations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Demo Mode**: Preview the interface with realistic dummy data


## 📦 Installation

### Prerequisites

- Python 3.10+ (tested on 3.10.0)
- Node.js 18+
- npm

### Quick Start

#### Manual  Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nurawiguna/ProxmoxVE-Watcher.git
   cd ProxmoxVE-Watcher
   ```

2. **Backend Setup**
   ```bash
   cd api
   python3 -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   pip install -r requirements.txt
   cp proxmox_hosts.json.example proxmox_hosts.json
   # Edit proxmox_hosts.json with your Proxmox credentials
   python app.py
   ```

3. **Frontend Setup**
   ```bash
   cd web
   npm install
   cp .env.example .env
   npm run dev
   ```

4. **Access the dashboard**
   - Open http://localhost:3000 in your browser

## 🎭 Demo Mode

This demo with data dummy

### Running Demo Locally

To run the demo mode locally for development:

```bash
cd web
npm run dev:demo
```

This will start the development server with dummy data, perfect for:
- Frontend development without needing Proxmox access
- Demonstrating features to stakeholders
- Testing UI components

### Building Demo for Deployment

To build a static version for deployment on Netlify, Vercel, or other platforms:

```bash
# Use the convenient build script
./build-demo.sh

# Or manually
cd web
npm run build:demo
```

The built files will be in `web/dist/` and can be deployed to any static hosting service.

### Deploy to Netlify

1. **Automatic Deployment** (Recommended)
   - Fork this repository
   - Connect your GitHub repo to Netlify
   - Netlify will automatically use the `netlify.toml` configuration
   - Your demo will be live in minutes!

2. **Manual Deployment**
   ```bash
   ./build-demo.sh
   # Drag and drop the web/dist folder to Netlify
   ```

### Deploy to Vercel

1. **Using Vercel CLI**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **GitHub Integration**
   - Connect your repository to Vercel
   - It will automatically use `vercel.json` configuration

### Other Static Hosts

The demo can be deployed to any static hosting service:
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront
- DigitalOcean App Platform

Just upload the contents of `web/dist/` after running `./build-demo.sh`.

## 🏗️ Project Structure

```
ProxmoxVE-Watcher/
├── api/                    # Python Flask backend
│   ├── app.py              # Main API application
│   ├── requirements.txt    # Python dependencies
│   └── proxmox_hosts.json  # Proxmox host configuration
├── web/                    # Vue.js frontend
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── services/       # API and demo services
│   │   ├── stores/         # Pinia state management
│   │   └── views/          # Page components
│   ├── .env                # Environment variables
│   ├── .env.production     # Environment variables for Production
│   ├── .env.demo           # Demo mode environment
│   └── package.json        # Frontend dependencies
├── netlify.toml            # Netlify deployment config
├── vercel.json             # Vercel deployment config
└── build-demo.sh           # Demo build script
```

## ⚙️ Configuration


### Backend Configuration


### 🔐 Permissions Setup (Proxmox)
1. **Create a User** in Proxmox (Datacenter > Permissions > Users).
2. **Create a Role** (if needed) with at least these privileges:
   - `Sys.Audit`, `VM.Audit`, `VM.Monitor`
3. **Assign Permissions**:
   - Go to Datacenter > Permissions > Add
   - Path: `/`
   - User: your API user
   - Role: your custom role or `PVEAdmin` (for testing)

### Setup Proxmox Host into API
Copy `api/proxmox_hosts.json.example` to `api/proxmox_hosts.json` then modify it as your server. example

```json
[
  {
      "id": "1",
      "name": "proxmox_host_1",
      "host": "proxmox_host_1_ip",
      "user": "user@pve",
      "password": "password",
      "verify_ssl": false,
      "company": "company_name",
      "site": "site_name"
    }
]
```

### Environment Variables

**Frontend (.env) for Development**

- Copy `./web/.env.example` to `./web/.env`
- Modify as you need 

**Demo Mode (.env.demo)**
- Use .env.demo

**Frontend (.env.production) for Production**

- Copy `./web/.env.production.example` to `./web/.env.production`
- Modify as you need 


## 🛠️ Development

### Available Scripts

**Frontend**
- `npm run dev` - Development server
- `npm run dev:demo` - Development server with demo data
- `npm run build` - Production build
- `npm run build:demo` - Demo build for static deployment
- `npm run preview` - Preview production build

**Backend**
- `python app.py` - Start API server

### API Endpoints

- `GET /api/hosts` - List Proxmox hosts
- `GET /api/hosts/{id}/nodes` - Get nodes for a host
- `GET /api/hosts/{id}/nodes/{node}/vms` - Get VMs for a node
- `GET /api/hosts/{id}/nodes/{node}/containers` - Get containers for a node

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Proxmox VE](https://www.proxmox.com/en/proxmox-ve) for the excellent virtualization platform
- [Vue.js](https://vuejs.org/) for the reactive frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Heroicons](https://heroicons.com/) for the beautiful icons

## 📞 Support

If you have any questions or need help:
- Open an [Issue](https://github.com/nurawiguna/ProxmoxVE-Watcher/issues)
- Contact: [nura@nspace.fyi](nura@nspace.fyi)
- Support ME: [Nura Wiguna](https://coff.ee/nurawiguna)
<p align="center">
   <a href="https://coff.ee/nurawiguna">
      <img src="https://cdn.buymeacoffee.com/buttons/v2/default-orange.png" height="50" width="210" alt="Buy Me A Coffee" />
   </a>
</p>

---

⭐ **Star this repository if you find it helpful!**
