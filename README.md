# Proxmox VE Watcher

A modern, responsive web dashboard for monitoring Proxmox Virtual Environment (VE) clusters. Built with Vue.js and featuring real-time data updates, detailed resource monitoring, and an intuitive user interface.


<p align="center">
   <img alt="last commit" src="https://img.shields.io/github/last-commit/nurawiguna/ProxmoxVE-Watcher?style=flat-square&logo=github">
   <img alt="top language" src="https://img.shields.io/github/languages/top/nurawiguna/ProxmoxVE-Watcher?style=flat-square&logo=vue.js&label=vue">
   <img alt="languages" src="https://img.shields.io/github/languages/count/nurawiguna/ProxmoxVE-Watcher?style=flat-square&label=languages">
   <img alt="license" src="https://img.shields.io/github/license/nurawiguna/ProxmoxVE-Watcher?style=flat-square">
  
</p>

<p align="center">
   <img alt="Built with vibe coding" src="https://img.shields.io/badge/Built%20with-%E2%9D%A4%EF%B8%8F%20vibe%20coding-ff69b4?style=flat-square">
</p>

<p align="center"><em>Stack tools:</em></p>

<p align="center">
   <!-- row 1 -->
   <img alt="Flask" src="https://img.shields.io/badge/Flask-000?style=flat-square&logo=flask&logoColor=white">
   <img alt="JSON" src="https://img.shields.io/badge/JSON-000?style=flat-square&logo=json&logoColor=white">
   <img alt="Markdown" src="https://img.shields.io/badge/Markdown-000?style=flat-square&logo=markdown&logoColor=white">
   <img alt="npm" src="https://img.shields.io/badge/npm-CB3837?style=flat-square&logo=npm&logoColor=white">
   <img alt="Autoprefixer" src="https://img.shields.io/badge/Autoprefixer-DD3735?style=flat-square&logo=autoprefixer&logoColor=white">
   <img alt="PostCSS" src="https://img.shields.io/badge/PostCSS-DD3A0A?style=flat-square&logo=postcss&logoColor=white">
   <img alt="TOML" src="https://img.shields.io/badge/TOML-9558B2?style=flat-square&logo=toml&logoColor=white">
   <img alt="Prettier" src="https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=000">
</p>

<p align="center">
   <!-- row 2 -->
   <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=000">
   <img alt="Vue.js" src="https://img.shields.io/badge/Vue.js-42b883?style=flat-square&logo=vue.js&logoColor=white">
   <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white">
   <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white">
   <img alt="Python" src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white">
   <img alt="ESLint" src="https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white">
   <img alt="Axios" src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white">
   <img alt="GNU Bash" src="https://img.shields.io/badge/GNU%20Bash-4EAA25?style=flat-square&logo=gnubash&logoColor=white">
   <img alt="Gunicorn" src="https://img.shields.io/badge/Gunicorn-499848?style=flat-square&logo=gunicorn&logoColor=white">
</p>


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
