from flask import Flask, jsonify
from flask_cors import CORS
from proxmoxer import ProxmoxAPI
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load Proxmox hosts configuration
def load_proxmox_hosts():
    try:
        with open('proxmox_hosts.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def get_proxmox_connection(host_config):
    try:
        proxmox = ProxmoxAPI(
            host_config['host'],
            user=host_config['user'],
            password=host_config['password'],
            verify_ssl=False
        )
        return proxmox
    except Exception as e:
        print("Error connecting to Proxmox host {}: {}".format(host_config['host'], str(e)))
        return None

@app.route('/api/hosts', methods=['GET'])
def get_hosts():
    hosts = load_proxmox_hosts()
    return jsonify(hosts)

@app.route('/api/hosts/<host_id>/nodes', methods=['GET'])
def get_nodes(host_id):
    hosts = load_proxmox_hosts()
    host_config = next((h for h in hosts if h['id'] == host_id), None)
    
    if not host_config:
        return jsonify({"error": "Host not found"}), 404
    
    proxmox = get_proxmox_connection(host_config)
    if not proxmox:
        return jsonify({"error": "Failed to connect to Proxmox"}), 500
    
    try:
        nodes = proxmox.nodes.get()
        # Add host information to each node
        for node in nodes:
            node['host_id'] = host_id
            node['host_name'] = host_config['name']
        return jsonify(nodes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hosts/<host_id>/nodes/<node>/status', methods=['GET'])
def get_node_status(host_id, node):
    hosts = load_proxmox_hosts()
    host_config = next((h for h in hosts if h['id'] == host_id), None)
    
    if not host_config:
        return jsonify({"error": "Host not found"}), 404
    
    proxmox = get_proxmox_connection(host_config)
    if not proxmox:
        return jsonify({"error": "Failed to connect to Proxmox"}), 500
    
    try:
        status = proxmox.nodes(node).status.get()
        status['host_id'] = host_id
        status['host_name'] = host_config['name']
        return jsonify(status)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hosts/<host_id>/nodes/<node>/vms', methods=['GET'])
def get_vms(host_id, node):
    hosts = load_proxmox_hosts()
    host_config = next((h for h in hosts if h['id'] == host_id), None)
    
    if not host_config:
        return jsonify({"error": "Host not found"}), 404
    
    proxmox = get_proxmox_connection(host_config)
    if not proxmox:
        return jsonify({"error": "Failed to connect to Proxmox"}), 500
    
    try:
        vms = proxmox.nodes(node).qemu.get()
        # Add host and node information to each VM
        for vm in vms:
            vm['host_id'] = host_id
            vm['host_name'] = host_config['name']
            vm['node'] = node
        return jsonify(vms)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hosts/<host_id>/nodes/<node>/containers', methods=['GET'])
def get_containers(host_id, node):
    hosts = load_proxmox_hosts()
    host_config = next((h for h in hosts if h['id'] == host_id), None)
    
    if not host_config:
        return jsonify({"error": "Host not found"}), 404
    
    proxmox = get_proxmox_connection(host_config)
    if not proxmox:
        return jsonify({"error": "Failed to connect to Proxmox"}), 500
    
    try:
        containers = proxmox.nodes(node).lxc.get()
        # Add host and node information to each container
        for container in containers:
            container['host_id'] = host_id
            container['host_name'] = host_config['name']
            container['node'] = node
        return jsonify(containers)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 