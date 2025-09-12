# Proxmox VE Watcher

A modern, responsive web dashboard for monitoring Proxmox Virtual Environment (VE) clusters. Built with Vue.js and featuring real-time data updates, detailed resource monitoring, and an intuitive user interface.

## ✨ Features

- **Real-time Monitoring**: Live updates of VMs, containers, and node status
- **Multi-host Support**: Monitor multiple Proxmox hosts from a single dashboard  
- **Resource Tracking**: CPU, memory, disk usage visualization
- **VM/Container Management**: Start, stop, and reboot operations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Demo Mode**: Preview the interface with realistic dummy data

## 🚀 Demo

🎯 **Try the live demo**: [proxmoxve-wathcer-dev.nspace.fyi] (Deploy using instructions below)

The demo mode provides a fully functional preview with realistic dummy data showing:
- 3 Proxmox hosts (3 online)
- 3 nodes with realistic resource usage
- 5 virtual machines with various states
- 5 containers with different configurations
- Live simulated data variations

## 📦 Installation

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/nurawiguna/ProxmoxVE-Watcher.git
   cd ProxmoxVE-Watcher
   ```

2. **Backend Setup**
   ```bash
   cd api
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
├── api/                     # Python Flask backend
│   ├── app.py              # Main API application
│   ├── requirements.txt    # Python dependencies
│   └── proxmox_hosts.json  # Proxmox host configuration
├── web/                    # Vue.js frontend
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── services/       # API and demo services
│   │   ├── stores/         # Pinia state management
│   │   └── views/          # Page components
│   ├── .env.demo          # Demo mode environment
│   └── package.json       # Frontend dependencies
├── netlify.toml           # Netlify deployment config
├── vercel.json           # Vercel deployment config
└── build-demo.sh         # Demo build script
```

## ⚙️ Configuration

### Backend Configuration

Edit `api/proxmox_hosts.json`:

```json
[
  {
    "id": "host1",
    "name": "Proxmox Host 1",
    "host": "192.168.1.100",
    "port": 8006,
    "user": "root@pam",
    "password": "your-password",
    "verify_ssl": false
  }
]
```

### Environment Variables

**Frontend (.env)**
```env
VITE_APP_TITLE=Proxmox VE - Watcher
VITE_DEMO_MODE=false
API_BASE_URL=http://127.0.0.1:5000
```

**Demo Mode (.env.demo)**
```env
VITE_APP_TITLE=Proxmox VE - Watcher (Demo)
VITE_DEMO_MODE=true
```

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
- `DEMO_MODE=true python app.py` - Start with demo endpoints

### API Endpoints

- `GET /api/hosts` - List Proxmox hosts
- `GET /api/hosts/{id}/nodes` - Get nodes for a host
- `GET /api/hosts/{id}/nodes/{node}/vms` - Get VMs for a node
- `GET /api/hosts/{id}/nodes/{node}/containers` - Get containers for a node
- `POST /api/hosts/{id}/nodes/{node}/vms/{vmid}/start` - Start VM
- `POST /api/hosts/{id}/nodes/{node}/vms/{vmid}/stop` - Stop VM

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
- Check the [Wiki](https://github.com/nurawiguna/ProxmoxVE-Watcher/wiki)
- Contact: [your-email@example.com]

---

⭐ **Star this repository if you find it helpful!**
