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
        # Validate host configuration
        if not host_config.get('host'):
            raise ValueError("Host address is not configured")
        if not host_config.get('user'):
            raise ValueError("Username is not configured")
        if not host_config.get('password'):
            raise ValueError("Password is not configured")
            
        verify_ssl = host_config.get('verify_ssl', True)  # Default to True for security
        proxmox = ProxmoxAPI(
            host_config['host'],
            user=host_config['user'],
            password=host_config['password'],
            verify_ssl=verify_ssl
        )
        return proxmox
    except ValueError as e:
        print(f"Configuration error for host {host_config.get('name', 'Unknown')}: {str(e)}")
        return None
    except Exception as e:
        format_connection_error(host_config, e)
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
        error_msg = str(e)
        permission_error_response = handle_permission_error(error_msg)
        if permission_error_response:
            return permission_error_response
        return jsonify({"error": error_msg}), 500

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
        error_msg = str(e)
        permission_error_response = handle_permission_error(error_msg)
        if permission_error_response:
            return permission_error_response
        return jsonify({"error": error_msg}), 500

@app.route('/api/hosts/<host_id>/nodes/<node>/basic-info', methods=['GET'])
def get_node_basic_info(host_id, node):
    """Alternative endpoint that might work with lower permissions"""
    hosts = load_proxmox_hosts()
    host_config = next((h for h in hosts if h['id'] == host_id), None)
    
    if not host_config:
        return jsonify({"error": "Host not found"}), 404
    
    proxmox = get_proxmox_connection(host_config)
    if not proxmox:
        return jsonify({"error": "Failed to connect to Proxmox"}), 500
    
    try:
        # Try to get basic node information
        basic_info = {
            'host_id': host_id,
            'host_name': host_config['name'],
            'node': node,
            'status': 'online',  # Assume online if we can connect
            'ip': host_config['host'],
            'note': 'Limited information due to permission restrictions'
        }
        
        # Try to get VMs (might work with lower permissions)
        try:
            vms = proxmox.nodes(node).qemu.get()
            basic_info['vm_count'] = len(vms)
        except Exception as e:
            logging.error(f"Error retrieving VMs: {e}")
            basic_info['vm_count'] = 'unknown'
        
        # Try to get containers (might work with lower permissions)
        try:
            containers = proxmox.nodes(node).lxc.get()
            basic_info['container_count'] = len(containers)
        except Exception as e:
            logging.error(f"Error retrieving containers: {e}")
            basic_info['container_count'] = 'unknown'
            
        return jsonify(basic_info)
    except Exception as e:
        return jsonify({
            "error": "Failed to get basic node information",
            "details": str(e),
            "solution": "Check user permissions in Proxmox"
        }), 500

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
        error_msg = str(e)
        if "403 Forbidden" in error_msg or "Permission check failed" in error_msg:
            return jsonify({
                "error": "Permission denied. The user account needs VM.Audit permission.",
                "details": "Please check your Proxmox user permissions or use a different account.",
                "solution": "In Proxmox web interface: Datacenter > Permissions > Users > Edit user > Add VM.Audit permission"
            }), 403
        return jsonify({"error": error_msg}), 500

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
        error_msg = str(e)
        if "403 Forbidden" in error_msg or "Permission check failed" in error_msg:
            return jsonify({
                "error": "Permission denied. The user account needs VM.Audit permission.",
                "details": "Please check your Proxmox user permissions or use a different account.",
                "solution": "In Proxmox web interface: Datacenter > Permissions > Users > Edit user > Add VM.Audit permission"
            }), 403
        return jsonify({"error": error_msg}), 500

@app.route('/api/permissions-help', methods=['GET'])
def get_permissions_help():
    """Help endpoint for setting up permissions"""
    return jsonify({
        "message": "Proxmox API Permission Setup Guide",
        "required_permissions": [
            "Sys.Audit - For node status and system information",
            "VM.Audit - For virtual machine information", 
            "Datastore.Audit - For storage information"
        ],
        "setup_steps": [
            "1. Login to Proxmox web interface",
            "2. Go to Datacenter > Permissions > Users",
            "3. Find your API user or create a new one",
            "4. Click Edit on the user",
            "5. Add the required permissions",
            "6. Save the changes"
        ],
        "alternative": "You can also create a role with these permissions and assign it to your user"
    })

@app.route('/api/config/validate', methods=['GET'])
def validate_configuration():
    """Validate the current configuration and provide setup guidance"""
    hosts = load_proxmox_hosts()
    
    if not hosts:
        return jsonify({
            "status": "error",
            "message": "No hosts configured",
            "solution": "Please create proxmox_hosts.json with your Proxmox server details",
            "example": {
                "id": "1",
                "name": "My Proxmox Server",
                "host": "192.168.1.100",
                "user": "root@pam",
                "password": "your_password"
            }
        }), 400
    
    validation_results = []
    
    for host in hosts:
        host_result = {
            "host_id": host.get('id'),
            "host_name": host.get('name'),
            "host_address": host.get('host'),
            "user": host.get('user'),
            "status": "unknown",
            "issues": []
        }
        
        # Check configuration
        if not host.get('host'):
            host_result["issues"].append("Host address is missing")
        if not host.get('user'):
            host_result["issues"].append("Username is missing")
        if not host.get('password'):
            host_result["issues"].append("Password is missing")
        
        # Try to connect if configuration looks good
        if not host_result["issues"]:
            try:
                proxmox = get_proxmox_connection(host)
                if proxmox:
                    # Try a simple API call
                    nodes = proxmox.nodes.get()
                    host_result["status"] = "connected"
                    host_result["node_count"] = len(nodes)
                    host_result["nodes"] = [node['node'] for node in nodes]
                else:
                    host_result["status"] = "connection_failed"
                    host_result["issues"].append("Failed to establish connection")
            except Exception as e:
                host_result["status"] = "error"
                host_result["issues"].append(str(e))
        else:
            host_result["status"] = "misconfigured"
        
        validation_results.append(host_result)
    
    return jsonify({
        "status": "validation_complete",
        "hosts": validation_results,
        "setup_guide": {
            "step1": "Update proxmox_hosts.json with your actual Proxmox server details",
            "step2": "Use IP address instead of hostname if DNS resolution fails",
            "step3": "Ensure the user has proper permissions (Sys.Audit, VM.Audit)",
            "step4": "Check network connectivity to your Proxmox server"
        }
    })

@app.route('/api/config/test-connection/<host_id>', methods=['GET'])
def test_connection(host_id):
    """Test connection to a specific host"""
    hosts = load_proxmox_hosts()
    host_config = next((h for h in hosts if h['id'] == host_id), None)
    
    if not host_config:
        return jsonify({"error": "Host not found"}), 404
    
    try:
        proxmox = get_proxmox_connection(host_config)
        if not proxmox:
            return jsonify({
                "status": "failed",
                "host": host_config['host'],
                "error": "Failed to establish connection",
                "solutions": [
                    "Check if the IP address/hostname is correct",
                    "Verify the username and password",
                    "Ensure Proxmox is running and accessible",
                    "Check network connectivity"
                ]
            }), 500
        
        # Try to get nodes to verify full connectivity
        nodes = proxmox.nodes.get()
        return jsonify({
            "status": "success",
            "host": host_config['host'],
            "message": "Connection successful",
            "nodes_found": len(nodes),
            "nodes": [node['node'] for node in nodes]
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "host": host_config['host'],
            "error": str(e),
            "solutions": [
                "Check hostname/IP address resolution",
                "Verify network connectivity",
                "Ensure Proxmox API is accessible",
                "Check firewall settings"
            ]
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 